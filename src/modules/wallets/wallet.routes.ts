import { Router } from "express";

import {
  authenticateFauxToken,
  authorizeRouteUser,
} from "../../middlewares/fauxAuth";
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
  authenticateFauxToken,
  authorizeRouteUser("userId"),
  validateWalletAmount,
  walletController.fundUser,
);
router.post(
  "/:userId/withdraw",
  validateWalletUserId,
  authenticateFauxToken,
  authorizeRouteUser("userId"),
  validateWalletAmount,
  walletController.withdrawUserFunds,
);
router.post(
  "/:userId/transfer",
  validateWalletUserId,
  authenticateFauxToken,
  authorizeRouteUser("userId"),
  validateTransferFunds,
  walletController.transferFunds,
);

export default router;
