const { Client } = require('pg');

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) { console.error("Set SUPABASE_DB_URL"); process.exit(1); }

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    await client.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO anon, authenticated, service_role;
    `);
    console.log("Permissions granted!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}
main();
