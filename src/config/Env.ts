import { requireEnv, requireNumberEnv } from "../utils/requireEnv";

const nodeEnv = process.env.NODE_ENV || "development";

export default {
  APP: {
    NODE_ENV: nodeEnv,
    HOST: process.env.HOST || "localhost",
    PORT: requireNumberEnv("PORT", 5400),
    APP_URL: process.env.APP_URL || "localhost",
    API_VERSION: process.env.API_VERSION as string,
    HOSTER: process.env.HOSTER || "LOCAL",
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
    CORS_ORIGIN: "",
    // JWT configuration
    JWT_SECRET: requireEnv("JWT_SECRET", "dev-jwt-secret-change-me"),
    JWT_REFRESH_SECRET: requireEnv(
      "JWT_REFRESH_SECRET",
      "dev-refresh-secret-change-me",
    ),
  },

  ORGANIZATION: {
    NAME: "LendSqr",
  },
};
