const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

const fs = require('fs');
const { Pool } = require('pg');

async function resetDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(
    'TRUNCATE list_item_tags, list_members, list_items, tags, custom_lists, users RESTART IDENTITY CASCADE'
  );
  await pool.end();
}

module.exports = { resetDb };
