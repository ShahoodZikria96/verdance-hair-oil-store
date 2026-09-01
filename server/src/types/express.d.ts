import type { Role } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
      email: string;
    }
    interface Request {
      user?: AuthUser;
      /** Populated by validate() with the parsed payload. */
      valid?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
