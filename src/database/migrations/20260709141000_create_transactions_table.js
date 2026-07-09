/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary();
    table.string("reference", 80).notNullable();
    table.uuid("wallet_id").notNullable();
    table.uuid("user_id").notNullable();
    table.uuid("related_wallet_id").nullable();
    table.uuid("related_user_id").nullable();

    table.string("type", 30).notNullable();
    table.string("direction", 10).notNullable();
    table.decimal("amount", 15, 2).notNullable();
    table.decimal("balance_before", 15, 2).notNullable();
    table.decimal("balance_after", 15, 2).notNullable();
    table.string("status", 20).notNullable().defaultTo("successful");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.foreign("wallet_id").references("wallets.id").onDelete("CASCADE");
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table
      .foreign("related_wallet_id")
      .references("wallets.id")
      .onDelete("SET NULL");
    table.foreign("related_user_id").references("users.id").onDelete("SET NULL");

    table.index(["user_id"]);
    table.index(["wallet_id"]);
    table.index(["reference"]);
    table.index(["type"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("transactions");
};
