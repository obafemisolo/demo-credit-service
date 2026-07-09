import "dotenv/config";

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

export function getEnv(name: string, fallback?: string) {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value.trim();
  }

  if (isProduction && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return fallback ?? "";
}

export default {
  APP: {
    NODE_ENV: nodeEnv,
    HOST: process.env.HOST || "localhost",
    PORT: process.env.PORT || 5400,
    APP_URL: process.env.APP_URL || "localhost",
    API_VERSION: process.env.API_VERSION as string,
    HOSTER: process.env.HOSTER || "LOCAL",
  },

  SECURITY: {
    CORS_ORIGIN: "",
    // JWT configuration
    JWT_SECRET: getEnv("JWT_SECRET", "dev-jwt-secret-change-me"),
    JWT_REFRESH_SECRET: getEnv(
      "JWT_REFRESH_SECRET",
      "dev-refresh-secret-change-me",
    ),
  },

  ORGANIZATION: {
    NAME: "LendSqr",
  },
};
