const { Client } = require('pg');
const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    console.log("Granting privileges on club_leaders_directory...");
    await client.query("GRANT SELECT ON public.club_leaders_directory TO service_role;");
    await client.query("GRANT SELECT ON public.club_leaders_directory TO anon;");
    await client.query("GRANT SELECT ON public.club_leaders_directory TO authenticated;");
    console.log("Privileges granted successfully.");
  } catch (err) {
    console.error("Error granting privileges:", err);
  } finally {
    await client.end();
  }
}

main();
