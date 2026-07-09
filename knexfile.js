require("dotenv").config();

const baseConfig = {
  client: "mysql2",
  migrations: {
    tableName: "knex_migrations",
    directory: "./src/database/migrations",
    extension: "js",
  },
  seeds: {
    directory: "./src/database/seeds",
    extension: "js",
  },
};

module.exports = {
  development: {
    ...baseConfig,
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "demo_credit",
    },
  },

  test: {
    ...baseConfig,
    connection: {
      host: process.env.TEST_DB_HOST || "localhost",
      port: Number(process.env.TEST_DB_PORT) || 3306,
      user: process.env.TEST_DB_USER || "root",
      password: process.env.TEST_DB_PASSWORD || "",
      database: process.env.TEST_DB_NAME || "demo_credit_test",
    },
  },
};
