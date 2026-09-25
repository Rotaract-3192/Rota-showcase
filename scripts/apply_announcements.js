const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) { console.error("Set SUPABASE_DB_URL"); process.exit(1); }

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    console.log("Reading migration file...");
    const sqlPath = path.join(__dirname, '../supabase/migrations/011_announcements.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Applying announcements migration...");
    await client.query(sql);
    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Error applying migration:", err);
  } finally {
    await client.end();
  }
}

main();
