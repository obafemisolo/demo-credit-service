import { Router } from "express";

import {
  authenticateFauxToken,
  authorizeRouteUser,
} from "../../middlewares/fauxAuth";
import transactionController from "./Transaction.controller";
import { validateTransactionUserId } from "./transaction.validator";

const router: Router = Router();

router.get(
  "/users/:userId",
  validateTransactionUserId,
  authenticateFauxToken,
  authorizeRouteUser("userId"),
  transactionController.getUserTransactions,
);

export default router;
