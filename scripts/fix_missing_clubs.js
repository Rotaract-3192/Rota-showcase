const { Client } = require('pg');
const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    
    // Get a district_id to use
    const res = await client.query('SELECT district_id FROM clubs LIMIT 1');
    const district_id = res.rows[0].district_id;
    console.log("District ID:", district_id);

    // 1. Insert Rotaract Club of Chikkanayakanahalli Kalpataru
    const kalpataruName = "Rotaract Club of Chikkanayakanahalli Kalpataru";
    const kalpataruSlug = "rotaract-club-of-chikkanayakanahalli-kalpataru";
    const kalpataruDate = new Date("28-Jun-2026").toISOString();
    
    // Check if exists
    const checkK = await client.query('SELECT id FROM clubs WHERE name = $1', [kalpataruName]);
    if (checkK.rows.length === 0) {
      await client.query(`
        INSERT INTO clubs (district_id, name, slug, status, charter_date) 
        VALUES ($1, $2, $3, 'ACTIVE', $4)
      `, [district_id, kalpataruName, kalpataruSlug, kalpataruDate]);
      console.log("Inserted Kalpataru.");
    } else {
      await client.query('UPDATE clubs SET charter_date = $1 WHERE name = $2', [kalpataruDate, kalpataruName]);
      console.log("Updated Kalpataru.");
    }

    // 2. Update Surana College exactly
    const suranaDate = new Date("27-May-2015").toISOString();
    await client.query("UPDATE clubs SET charter_date = $1 WHERE name = 'Rotaract Club of Surana College'", [suranaDate]);
    console.log("Updated Surana College.");

    // 3. Update Yelahanka exactly
    const yelahankaDate = new Date("19-Mar-2010").toISOString();
    await client.query("UPDATE clubs SET charter_date = $1 WHERE name = 'Rotaract Club of Yelahanka'", [yelahankaDate]);
    console.log("Updated Yelahanka.");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
