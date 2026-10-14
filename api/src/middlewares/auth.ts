import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../shared/errors/httpErrors.js';
import { verifyToken } from '../modules/auth/auth.service.js';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export const requireAdmin: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);
  if (!token) {
    next(new UnauthorizedError('Missing or invalid Authorization header'));
    return;
  }
  try {
    req.admin = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAdmin: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    req.admin = verifyToken(token);
  } catch {
    // Ignoramos tokens inválidos en rutas opcionales
  }
  next();
};