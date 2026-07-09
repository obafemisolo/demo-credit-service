import type { ErrorRequestHandler, RequestHandler } from "express";

import logger from "../config/logger";
import { AppError } from "../common/errors/AppError";

const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorLogger: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal server error";

  logger.error("Request error: ", { err });

  res.status(statusCode).json({
    success: false,
    message,
    details: err instanceof AppError ? err.details : undefined,
  });
};

export default function errorHandler(): [RequestHandler, ErrorRequestHandler] {
  return [notFoundHandler, errorLogger];
}
