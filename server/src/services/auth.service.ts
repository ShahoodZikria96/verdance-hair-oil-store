import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { hashPassword, verifyPassword } from '../lib/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt';
import { randomToken, sha256 } from '../lib/tokens';
import { env } from '../config/env';
import { emailService } from './email/EmailService';
import { logger } from '../lib/logger';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

export interface AuthContext {
  userAgent?: string;
  ip?: string;
}

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export type PublicUser = Omit<User, 'passwordHash'>;

const publicUser = (user: User): PublicUser => {
  const { passwordHash: _omit, ...rest } = user;
  return rest;
};

async function issueTokens(user: User, ctx: AuthContext): Promise<TokenBundle> {
  const tokenRow = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: 'pending',
      userAgent: ctx.userAgent?.slice(0, 250),
      ip: ctx.ip,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  const refreshToken = signRefreshToken({ sub: user.id, jti: tokenRow.id });
  await prisma.refreshToken.update({
    where: { id: tokenRow.id },
    data: { tokenHash: sha256(refreshToken) },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  return { accessToken, refreshToken, user: publicUser(user) };
}

export const authService = {
  async register(
    input: { firstName: string; lastName: string; email: string; password: string; phone?: string },
    ctx: AuthContext,
  ): Promise<TokenBundle> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        role: 'CUSTOMER',
      },
    });

    emailService.welcome(user.email, user.firstName).catch((e) => logger.warn(e, 'welcome email failed'));
    return issueTokens(user, ctx);
  },

  async login(input: { email: string; password: string }, ctx: AuthContext): Promise<TokenBundle> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    // Constant-ish response to reduce enumeration signal.
    if (!user) {
      await hashPassword('placeholder');
      throw ApiError.unauthorized('Invalid email or password');
    }
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');
    if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

    return issueTokens(user, ctx);
  },

  async refresh(rawToken: string | undefined, ctx: AuthContext): Promise<TokenBundle> {
    if (!rawToken) throw ApiError.unauthorized('No refresh token provided');

    let payload;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw ApiError.unauthorized('Refresh token is invalid or expired');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.tokenHash !== sha256(rawToken)
    ) {
      throw ApiError.unauthorized('Refresh token is no longer valid');
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw ApiError.unauthorized('Account is inactive');

    // Rotate: revoke the used token, issue a fresh pair.
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return issueTokens(user, ctx);
  },

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    try {
      const payload = verifyRefreshToken(rawToken);
      await prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* already invalid — nothing to do */
    }
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    return publicUser(user);
  },

  async updateProfile(
    userId: string,
    input: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<PublicUser> {
    const user = await prisma.user.update({ where: { id: userId }, data: input });
    return publicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');
    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) throw ApiError.badRequest('Current password is incorrect');
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    // Invalidate existing sessions.
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always resolve the same way — no account enumeration.
    if (!user) {
      logger.info({ email }, 'forgot-password requested for unknown email');
      return;
    }
    const token = randomToken(32);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    const resetUrl = `${env.FRONTEND_URL}/account/reset-password?token=${token}`;
    await emailService.passwordReset(user.email, resetUrl);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw ApiError.badRequest('This reset link is invalid or has expired');
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
      prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  },
};
