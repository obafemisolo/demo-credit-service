import http from "http";
import app from "./app";

import logger from "./config/logger";
import env from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    const server = http.createServer(app);

    server.listen(env.APP.PORT, () => {
      logger.info(`Demo Credit Wallet API running on port ${env.APP.PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down...`);

      server.close(async () => {
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
