const { Client } = require('pg');

// We need the postgres connection string, but we can also extract it from package.json or just use what we saw earlier.
// Wait, I will use a simple connection string we know works from package.json supabase:push.
const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) { console.error("Set SUPABASE_DB_URL"); process.exit(1); }

async function main() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database.");

    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS district_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        general JSONB DEFAULT '{}'::jsonb,
        branding JSONB DEFAULT '{}'::jsonb,
        security JSONB DEFAULT '{}'::jsonb,
        notifications JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await client.query(createTableQuery);
    console.log("Ensured district_settings table exists.");

    // Check if a row already exists, if not, insert a default one
    const checkQuery = `SELECT count(*) FROM district_settings`;
    const res = await client.query(checkQuery);
    if (parseInt(res.rows[0].count) === 0) {
      console.log("Inserting default settings row...");
      await client.query(`
        INSERT INTO district_settings (general, branding, security, notifications)
        VALUES (
          '{"districtName": "Rotaract District 3192", "riYear": "2023-2024", "districtDrr": "Rtr. Jane Doe", "contactEmail": "admin@rotaract3192.org", "publicLeaderboard": true, "maintenanceMode": false}'::jsonb,
          '{"primaryColor": "#00F0FF", "darkModeDefault": true}'::jsonb,
          '{"enforce2fa": false, "publicRegistrations": true, "sessionTimeout": 60}'::jsonb,
          '{"emailNotifications": true, "smsNotifications": false, "dailyDigest": true}'::jsonb
        );
      `);
      console.log("Default settings row inserted.");
    } else {
      console.log("Settings row already exists.");
    }

  } catch (err) {
    console.error("Error migrating settings:", err);
  } finally {
    await client.end();
  }
}

main();
