import type { CookieOptions, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { authService } from '../services/auth.service';
import { env, isProd } from '../config/env';

const REFRESH_COOKIE = 'refreshToken';
const ACCESS_COOKIE = 'accessToken';

const baseCookie: CookieOptions = {
  httpOnly: true,
  // `sameSite: 'none'` is only honoured by browsers when the cookie is also Secure.
  secure: env.COOKIE_SECURE || isProd || env.COOKIE_SAMESITE === 'none',
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/',
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...baseCookie, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookie,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookie });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookie, path: '/api/auth' });
}

const ctxFrom = (req: Request) => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const bundle = await authService.register(req.body, ctxFrom(req));
    setAuthCookies(res, bundle.accessToken, bundle.refreshToken);
    sendSuccess(
      res,
      { user: bundle.user, accessToken: bundle.accessToken },
      'Account created',
      201,
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const bundle = await authService.login(req.body, ctxFrom(req));
    setAuthCookies(res, bundle.accessToken, bundle.refreshToken);
    sendSuccess(res, { user: bundle.user, accessToken: bundle.accessToken }, 'Signed in');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const raw =
      (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE] ??
      req.body?.refreshToken;
    const bundle = await authService.refresh(raw, ctxFrom(req));
    setAuthCookies(res, bundle.accessToken, bundle.refreshToken);
    sendSuccess(res, { user: bundle.user, accessToken: bundle.accessToken }, 'Session refreshed');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const raw = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    await authService.logout(raw);
    clearAuthCookies(res);
    sendSuccess(res, null, 'Signed out');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    sendSuccess(res, user, 'Current user');
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user, 'Profile updated');
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    clearAuthCookies(res);
    sendSuccess(res, null, 'Password changed — please sign in again');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'If that email is registered, a reset link is on its way');
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, 'Password updated — you can now sign in');
  }),
};
