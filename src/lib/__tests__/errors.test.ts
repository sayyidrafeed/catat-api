import { describe, expect, test } from "bun:test";
import * as HttpStatus from "stoker/http-status-codes";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors";

describe("Domain Errors", () => {
  test("AppError should hold status and message", () => {
    const error = new AppError(HttpStatus.IM_A_TEAPOT, "I am a teapot");
    expect(error.statusCode).toBe(HttpStatus.IM_A_TEAPOT);
    expect(error.message).toBe("I am a teapot");
    expect(error.name).toBe("AppError");
  });

  test("AppError should hold optional details", () => {
    const details = { field: "email", issue: "invalid" };
    const error = new AppError(HttpStatus.BAD_REQUEST, "Bad request", details);
    expect(error.details).toEqual(details);
  });

  test("NotFoundError should have 404 status", () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(error.name).toBe("NotFoundError");
  });

  test("NotFoundError should accept custom message", () => {
    const error = new NotFoundError("User not found");
    expect(error.message).toBe("User not found");
  });

  test("UnauthorizedError should have 401 status", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(error.name).toBe("UnauthorizedError");
  });

  test("UnauthorizedError should accept custom message", () => {
    const error = new UnauthorizedError("Token expired");
    expect(error.message).toBe("Token expired");
  });

  test("ForbiddenError should have 403 status", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(error.name).toBe("ForbiddenError");
  });

  test("ForbiddenError should accept custom message", () => {
    const error = new ForbiddenError("Admin access required");
    expect(error.message).toBe("Admin access required");
  });

  test("ValidationError should have 422 status and optional details", () => {
    const details = { field: "email", issue: "invalid format" };
    const error = new ValidationError("Validation failed", details);
    expect(error.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(error.details).toEqual(details);
  });

  test("ConflictError should have 409 status", () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(HttpStatus.CONFLICT);
    expect(error.name).toBe("ConflictError");
  });

  test("ConflictError should accept custom message", () => {
    const error = new ConflictError("Email already registered");
    expect(error.message).toBe("Email already registered");
  });

  test("InternalServerError should have 500 status", () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(error.name).toBe("InternalServerError");
  });

  test("InternalServerError should accept custom message", () => {
    const error = new InternalServerError("Database connection failed");
    expect(error.message).toBe("Database connection failed");
  });

  test("errors should be instance of Error", () => {
    const errors = [
      new NotFoundError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new ValidationError(),
      new ConflictError(),
      new InternalServerError(),
    ];
    for (const error of errors) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    }
  });
});
