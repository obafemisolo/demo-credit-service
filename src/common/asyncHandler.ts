import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const asyncHandler =
  (fn: (req: Request, res: Response, next?: NextFunction) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      logger.error((err as Error).message, "Unhandled controller error");
      next(err);
    }
  };
