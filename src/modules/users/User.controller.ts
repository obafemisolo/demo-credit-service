import type { Request, Response } from "express";

import { ApiResponse } from "../../common/ApiResponse";
import { asyncHandler } from "../../common/asyncHandler";
import userService from "./User.service";

export class UserController {
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);

    res
      .status(201)
      .json(ApiResponse.created("User created successfully", user));
  });

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const users = await userService.getUsers(page, limit);

    res
      .status(200)
      .json(ApiResponse.success("Users fetched successfully", users));
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(String(req.params.id));

    res
      .status(200)
      .json(ApiResponse.success("User fetched successfully", user));
  });

  blacklistUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.blacklistUser(String(req.params.id));

    res
      .status(200)
      .json(ApiResponse.success("User blacklisted successfully", user));
  });

  unblacklistUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.unblacklistUser(String(req.params.id));

    res
      .status(200)
      .json(ApiResponse.success("User unblacklisted successfully", user));
  });
}

export default new UserController();
