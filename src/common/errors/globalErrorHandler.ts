import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access", details?: unknown) {
    super(401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden", details?: unknown) {
    super(403, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(404, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", details?: unknown) {
    super(409, message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: unknown) {
    super(500, message, details);
  }
}
