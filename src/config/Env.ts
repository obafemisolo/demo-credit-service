import { requireEnv, requireNumberEnv } from "../utils/requireEnv";

const nodeEnv = process.env.NODE_ENV || "development";

export default {
  APP: {
    NODE_ENV: nodeEnv,
    HOST: process.env.HOST || "localhost",
    PORT: requireNumberEnv("PORT", 5400),
    APP_URL: process.env.APP_URL || "localhost",
  },

  DATABASE: {
    HOST: requireEnv("DB_HOST", "127.0.0.1"),
    PORT: requireNumberEnv("DB_PORT", 3306),
    USER: requireEnv("DB_USER", "root"),
    PASSWORD: requireEnv("DB_PASSWORD", ""),
    NAME: requireEnv("DB_NAME", "demo_credit"),
    POOL_MIN: requireNumberEnv("DB_POOL_MIN", 2),
    POOL_MAX: requireNumberEnv("DB_POOL_MAX", 10),
  },

  SECURITY: {
    CORS_ORIGIN: "*",
  },

  ORGANIZATION: {
    NAME: "LendSqr",
  },

  ADJUTOR_API_KEY: process.env.ADJUTOR_API_KEY || "",
};
