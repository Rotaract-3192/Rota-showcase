const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

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
