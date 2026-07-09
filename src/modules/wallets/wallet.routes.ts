import { Router } from "express";

import walletController from "./Wallet.controller";
import {
  validateTransferFunds,
  validateWalletAmount,
  validateWalletUserId,
} from "./wallet.validator";

const router: Router = Router();

router.post(
  "/:userId/fund",
  validateWalletUserId,
  validateWalletAmount,
  walletController.fundUser,
);
router.post(
  "/:userId/withdraw",
  validateWalletUserId,
  validateWalletAmount,
  walletController.withdrawUserFunds,
);
router.post(
  "/:userId/transfer",
  validateWalletUserId,
  validateTransferFunds,
  walletController.transferFunds,
);

export default router;
