const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

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
