const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",       // DB superuser
  host: "localhost",      // DB server
  database: "healthcare", // DB name
  password: "Himal123!",  // your password
  port: 5432,             // default Postgres port
});

module.exports = pool;
