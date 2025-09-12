const { Pool } = require("pg");

/**
 * PostgreSQL connection pool
 * Uses environment variables for configuration.
 * Example env vars:
 *   PGUSER=postgres
 *   PGHOST=localhost
 *   PGDATABASE=healthcare
 *   PGPASSWORD=yourpassword
 *   PGPORT=5432
 */
const pool = new Pool({
  user: process.env.PGUSER,       // Database user
  host: process.env.PGHOST,       // Database host
  database: process.env.PGDATABASE, // Database name
  password: process.env.PGPASSWORD, // Database password
  port: process.env.PGPORT,       // Database port
});

module.exports = pool;
