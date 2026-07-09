import { Router } from "express";

import userController from "./User.controller";
import { validateCreateUser, validateUserId } from "./user.validator";

const router: Router = Router();

router.post("/", validateCreateUser, userController.createUser);
router.get("/", userController.getUsers);
router.get("/:id", validateUserId, userController.getUserById);
router.patch("/:id/blacklist", validateUserId, userController.blacklistUser);
router.patch("/:id/unblacklist", validateUserId, userController.unblacklistUser);

export default router;
