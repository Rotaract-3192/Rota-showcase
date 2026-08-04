const { Client } = require('pg');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

async function checkDb() {
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    
    // Check for system actor
    const actorRes = await client.query(`SELECT * FROM public.member_profiles WHERE id = '5057e100-0000-4000-8000-000000000001'`);
    
    if (actorRes.rowCount === 0) {
      console.log('Inserting system actor...');
      try {
        await client.query(`
          INSERT INTO member_profiles (id, auth_id, first_name, last_name, email)
          VALUES ('5057e100-0000-4000-8000-000000000001', 'system_auth_id', 'System', 'Automations', 'system@rotaract3192.org')
        `);
        console.log('System actor inserted successfully.');
      } catch (err) {
        console.log('Failed to insert system actor:', err.message);
      }
    } else {
      console.log('System actor already exists.');
    }

    try {
        await client.query(`
          INSERT INTO member_roles (member_id, role)
          SELECT '5057e100-0000-4000-8000-000000000001', 'Super Admin'
          WHERE NOT EXISTS (
              SELECT 1 FROM member_roles 
              WHERE member_id = '5057e100-0000-4000-8000-000000000001' 
              AND role = 'Super Admin'
          );
        `);
        console.log('System actor role assigned.');
    } catch (err) {
        console.log('Failed to assign system actor role:', err.message);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkDb();
