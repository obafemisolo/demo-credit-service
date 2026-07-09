import type { RequestHandler } from "express";

import { AppError } from "../../common/errors/AppError";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateTransactionUserId: RequestHandler<{ userId: string }> = (
  req,
  _res,
  next,
) => {
  if (!uuidRegex.test(req.params.userId)) {
    next(new AppError(400, "Invalid user id"));
    return;
  }

  next();
};
