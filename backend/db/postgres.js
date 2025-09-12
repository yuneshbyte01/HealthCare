import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",       // DB superuser
  host: "localhost",      // DB server
  database: "healthcare", // DB name you created
  password: "Himal123!",  // your actual password
  port: 5432,             // default Postgres port
});

export default pool;
