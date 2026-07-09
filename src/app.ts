import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import Env from "./config/Env";
import { morganStream } from "./config/logger";
import errorHandler from "./middlewares/errorHandler";
import transactionRoutes from "./modules/transactions/transaction.routes";
import userRoutes from "./modules/users/user.routes";
import walletRoutes from "./modules/wallets/wallet.routes";

const app: Application = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: Env.SECURITY.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan(Env.APP.NODE_ENV === "development" ? "dev" : "combined", {
    stream: morganStream,
  }),
);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Demo Credit Wallet API Is A Ok",
    version: "1.0.0",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/transactions", transactionRoutes);

const [notFoundHandler, errorLogger] = errorHandler();
app.use(notFoundHandler);
app.use(errorLogger);

export default app;
