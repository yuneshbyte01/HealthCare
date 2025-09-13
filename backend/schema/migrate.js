/**
 * ======================
 * DATABASE MIGRATION SCRIPT
 * Healthcare Backend - Day 1 Mission 3
 * ======================
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 
    `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
});

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - patients');
    console.log('   - clinics');
    console.log('   - clinic_staff');
    console.log('   - admins');
    console.log('   - appointments');
    console.log('   - indexes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
