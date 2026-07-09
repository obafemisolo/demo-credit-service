import { Router } from "express";

import transactionController from "./Transaction.controller";
import { validateTransactionUserId } from "./transaction.validator";

const router: Router = Router();

router.get(
  "/users/:userId",
  validateTransactionUserId,
  transactionController.getUserTransactions,
);

export default router;
