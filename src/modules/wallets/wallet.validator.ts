import type { RequestHandler } from "express";

import { AppError } from "../../common/errors/AppError";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateWalletUserId: RequestHandler<{ userId: string }> = (
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

export const validateWalletAmount: RequestHandler = (req, _res, next) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    next(new AppError(400, "amount must be greater than 0"));
    return;
  }

  req.body.amount = amount;
  next();
};

export const validateTransferFunds: RequestHandler = (req, _res, next) => {
  const amount = Number(req.body.amount);
  const recipientUserId = String(req.body.recipientUserId || "");

  if (!uuidRegex.test(recipientUserId)) {
    next(new AppError(400, "recipientUserId is invalid"));
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    next(new AppError(400, "amount must be greater than 0"));
    return;
  }

  req.body.amount = amount;
  req.body.recipientUserId = recipientUserId;
  next();
};
