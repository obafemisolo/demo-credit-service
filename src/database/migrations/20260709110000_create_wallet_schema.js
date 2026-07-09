exports.up = async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("phone", 30).notNullable().unique();
    table.string("bvn", 20).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("wallets", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.decimal("balance", 18, 2).notNullable().defaultTo(0);
    table.string("currency", 3).notNullable().defaultTo("NGN");
    table.timestamps(true, true);

    table.unique(["user_id"]);
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
  });

  await knex.schema.createTable("wallet_transactions", (table) => {
    table.increments("id").primary();
    table.integer("wallet_id").unsigned().notNullable();
    table
      .enu("type", ["fund", "transfer_in", "transfer_out", "withdrawal"])
      .notNullable();
    table.decimal("amount", 18, 2).unsigned().notNullable();
    table.decimal("balance_before", 18, 2).notNullable();
    table.decimal("balance_after", 18, 2).notNullable();
    table.string("reference", 100).notNullable().unique();
    table.integer("counterparty_wallet_id").unsigned().nullable();
    table.timestamps(true, true);

    table.index(["wallet_id", "created_at"]);
    table.foreign("wallet_id").references("wallets.id").onDelete("CASCADE");
    table
      .foreign("counterparty_wallet_id")
      .references("wallets.id")
      .onDelete("SET NULL");
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("wallet_transactions");
  await knex.schema.dropTableIfExists("wallets");
  await knex.schema.dropTableIfExists("users");
};
