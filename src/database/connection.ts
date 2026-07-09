import db from "../config/database";
import logger from "../config/logger";

export async function checkDatabaseConnection(): Promise<void> {
  try {
    await db.raw("SELECT 1");
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await db.destroy();
}

export default db;
