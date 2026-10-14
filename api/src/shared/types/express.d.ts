import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      log: Logger;
      id: string;
      admin?: { email: string };
    }
  }
}

export {};