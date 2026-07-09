/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();

    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("email", 150).notNullable().unique();
    table.string("phone_number", 30).notNullable().unique();

    table.string("password_hash").notNullable();

    table.boolean("is_blacklisted").notNullable().defaultTo(false);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.index(["email"]);
    table.index(["phone_number"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
