const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

async function main() {
  const clubsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../clubs_output.json'), 'utf8'));
  console.log(`Loaded ${clubsData.length} clubs from JSON.`);

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    console.log("Updating club details in database...");
    
    // We match by name case-insensitively
    const updateQuery = `
      UPDATE public.clubs 
      SET 
        logo_url = $1,
        charter_date = $2,
        member_count = $3,
        total_projects = 0,
        total_points = 0,
        zone = $4,
        description = $5,
        club_email = $6,
        email = $6
      WHERE LOWER(name) = LOWER($7)
    `;

    let updatedCount = 0;
    for (const club of clubsData) {
      const charterDate = club.charterYear ? `${club.charterYear}-07-01` : null;
      const res = await client.query(updateQuery, [
        club.logo,
        charterDate,
        club.memberCount || 0,
        club.zone || 'Zone 1',
        club.description || '',
        club.email || '',
        club.name.trim()
      ]);
      if (res.rowCount > 0) {
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} clubs in the database!`);
  } catch (err) {
    console.error("Failed to seed club details:", err);
  } finally {
    await client.end();
  }
}

main();
