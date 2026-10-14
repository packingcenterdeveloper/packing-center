import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../shared/errors/httpErrors.js';

export interface AuthPayload {
  email: string;
}

export interface LoginResult {
  token: string;
  expiresIn: string;
  email: string;
}

function verifyCredentials(email: string, password: string): boolean {
  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) return false;
  return bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH);
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (
      typeof decoded !== 'object' ||
      typeof decoded.email !== 'string' ||
      decoded.email.length === 0
    ) {
      throw new UnauthorizedError('Invalid token payload');
    }
    return { email: decoded.email };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function login(email: string, password: string): LoginResult {
  if (!verifyCredentials(email, password)) {
    throw new UnauthorizedError('Invalid email or password');
  }
  const token = signToken({ email: env.ADMIN_EMAIL });
  return {
    token,
    expiresIn: env.JWT_EXPIRES_IN,
    email: env.ADMIN_EMAIL,
  };
}