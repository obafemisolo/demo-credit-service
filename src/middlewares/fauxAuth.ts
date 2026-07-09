import type { RequestHandler } from "express";

import {
  ForbiddenError,
  UnauthorizedError,
} from "../common/errors/globalErrorHandler";
import userRepository from "../modules/users/User.repository";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getTokenFromRequest(req: Parameters<RequestHandler>[0]): string {
  const headerUserId = req.header("x-user-id");
  if (headerUserId) return headerUserId;

  const authorization = req.header("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return "";
}

export const authenticateFauxToken: RequestHandler = async (req, res, next) => {
  try {
    const userId = getTokenFromRequest(req);

    if (!uuidRegex.test(userId)) {
      next(new UnauthorizedError("Valid faux token is required"));
      return;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      next(new UnauthorizedError("Invalid faux token"));
      return;
    }

    if (user.is_blacklisted) {
      next(new ForbiddenError("Blacklisted users cannot access this resource"));
      return;
    }

    res.locals.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRouteUser =
  (paramName = "userId"): RequestHandler =>
  (req, res, next) => {
    if (req.params[paramName] !== res.locals.userId) {
      next(new ForbiddenError("You cannot access another user's resource"));
      return;
    }

    next();
  };
