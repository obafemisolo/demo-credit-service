import knex, { Knex } from "knex";
import Env from "./Env";

const knexConfig = require("../../knexfile");
const environment = Env.APP.NODE_ENV || "development";

const db: Knex = knex(knexConfig[environment]);

export default db;
