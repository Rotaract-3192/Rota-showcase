const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) { console.error("Set SUPABASE_DB_URL"); process.exit(1); }

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '018_grant_notifications.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log("Applying SQL migration 018...");
    await client.query(sql);
    console.log("Migration 018 applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

main();
