import * as HttpStatus from "stoker/http-status-codes";
import type { StatusCode } from "hono/utils/http-status";

/**
 * Base class for all application-specific errors.
 * Handlers can catch this and map it to a structured JSON response.
 */
export class AppError extends Error {
  public readonly statusCode: StatusCode;
  public readonly details?: unknown;

  constructor(statusCode: StatusCode, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(HttpStatus.NOT_FOUND, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", details?: unknown) {
    super(HttpStatus.UNAUTHORIZED, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Permission denied", details?: unknown) {
    super(HttpStatus.FORBIDDEN, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict occurred", details?: unknown) {
    super(HttpStatus.CONFLICT, message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: unknown) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, details);
  }
}
