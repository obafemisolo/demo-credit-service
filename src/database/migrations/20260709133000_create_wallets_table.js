/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("wallets", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").notNullable().unique();
    table.decimal("balance", 15, 2).notNullable().defaultTo(0);
    table.string("currency", 3).notNullable().defaultTo("NGN");
    table.string("status", 20).notNullable().defaultTo("active");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.index(["user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("wallets");
};
