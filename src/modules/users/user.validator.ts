import type { RequestHandler } from "express";

import { AppError } from "../../common/errors/AppError";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export const validateCreateUser: RequestHandler = (req, _res, next) => {
  const errors: string[] = [];
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!isNonEmptyString(firstName)) errors.push("firstName is required");
  if (!isNonEmptyString(lastName)) errors.push("lastName is required");
  if (!isNonEmptyString(email)) errors.push("email is required");
  if (isNonEmptyString(email) && !emailRegex.test(email.trim())) {
    errors.push("email is invalid");
  }
  if (!isNonEmptyString(phoneNumber)) errors.push("phoneNumber is required");
  if (!isNonEmptyString(password)) errors.push("password is required");
  if (isNonEmptyString(password) && password.length < 6) {
    errors.push("password must be at least 6 characters");
  }

  if (errors.length > 0) {
    next(new AppError(400, "Validation failed", errors));
    return;
  }

  next();
};

export const validateUserId: RequestHandler<{ id: string }> = (
  req,
  _res,
  next,
) => {
  if (!uuidRegex.test(req.params.id)) {
    next(new AppError(400, "Invalid user id"));
    return;
  }

  next();
};
