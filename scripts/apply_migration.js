const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) { console.error("Set SUPABASE_DB_URL"); process.exit(1); }

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    const migrationPath = path.join(__dirname, '../supabase/migrations/013_add_club_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log("Applying SQL migration...");
    await client.query(sql);
    console.log("Migration 013 applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

main();
