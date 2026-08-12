import 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: {
        userId: string;
        email: string;
        roles: string[];
      };
    }
  }
}

export {};
