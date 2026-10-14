import { AppError } from './AppError.js';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super({ statusCode: 400, code: 'BAD_REQUEST', message, details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super({ statusCode: 401, code: 'UNAUTHORIZED', message, details });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super({ statusCode: 403, code: 'FORBIDDEN', message, details });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found', details?: unknown) {
    super({ statusCode: 404, code: 'NOT_FOUND', message, details });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super({ statusCode: 409, code: 'CONFLICT', message, details });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity', details?: unknown) {
    super({
      statusCode: 422,
      code: 'UNPROCESSABLE_ENTITY',
      message,
      details,
    });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', details?: unknown) {
    super({ statusCode: 429, code: 'TOO_MANY_REQUESTS', message, details });
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message,
      details,
      isOperational: false,
    });
  }
}