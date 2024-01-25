const path = require("path");
const { conObject } = require(path.join(__dirname, "DBMethods", "dbConnection"));

module.exports = {
  client: "pg",
  connection: conObject,
  migrations: {
    tableName: "knex_migrations",
  },
  pool: {
    min: 0,
    max: 5,
  },
};
