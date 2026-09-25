const { Client } = require('pg');
const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) { console.error("Set SUPABASE_DB_URL"); process.exit(1); }

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
