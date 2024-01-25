require("dotenv").config();

const conObject = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const knex = require("knex")({
  client: "pg",
  connection: conObject,
  pool: {
    min: 0,
    max: 5,
  },
});

module.exports = { conObject, knex };
