import http from "http";
import app from "./app";

import logger from "./config/logger";
import Env from "./config/Env";
import {
  checkDatabaseConnection,
  closeDatabaseConnection,
} from "./database/connection";

const startServer = async (): Promise<void> => {
  try {
    await checkDatabaseConnection();

    const server = http.createServer(app);

    server.listen(Env.APP.PORT, () => {
      logger.info(`Demo Credit Wallet API running on port ${Env.APP.PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down...`);

      server.close(async () => {
        await closeDatabaseConnection();
        logger.info("Server and database connection closed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
