const { Client } = require('pg');
const xlsx = require('xlsx');
const fs = require('fs');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

async function main() {
  // 1. Parse Excel
  console.log("Parsing Excel document...");
  const buf = fs.readFileSync('docs/Exuberant Club Leaders Directory RY 2026-27');
  const workbook = xlsx.read(buf, { type: 'buffer' });
  const worksheet = workbook.Sheets['Master Sheet'];
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  let currentClub = null;
  let currentClubType = null;
  let currentClubEmail = null;
  let currentPartnerClub = null;
  
  const leaders = [];
  
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    // Carry forward club details if they exist in this row
    if (row[1] && row[1].trim() !== '') {
      currentClub = row[1].trim();
      currentClubType = row[2] ? row[2].trim() : '';
      currentClubEmail = row[3] ? row[3].trim() : '';
      currentPartnerClub = row[4] ? row[4].trim() : '';
    }
    
    const name = row[5] ? row[5].trim() : '';
    const designation = row[6] ? row[6].trim() : '';
    const contact = row[7] ? String(row[7]).trim() : '';
    const email = row[8] ? row[8].trim() : '';
    
    if (name || designation || email) {
      leaders.push({
        club_name: currentClub,
        club_type: currentClubType,
        club_email: currentClubEmail,
        partner_club: currentPartnerClub,
        name,
        designation,
        phone: contact,
        email: email.toLowerCase() // normalized
      });
    }
  }
  
  console.log(`Parsed ${leaders.length} leaders.`);

  // 2. Connect to Database
  console.log("Connecting to Supabase Database...");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    // 3. Create table if not exists
    console.log("Creating public.club_leaders_directory table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.club_leaders_directory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        club_name VARCHAR(255) NOT NULL,
        club_type VARCHAR(100),
        club_email VARCHAR(255),
        partner_club VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Enable RLS and create policy if not exists
    await client.query(`ALTER TABLE public.club_leaders_directory ENABLE ROW LEVEL SECURITY;`);
    await client.query(`
      DROP POLICY IF EXISTS "Admins read directory" ON public.club_leaders_directory;
      CREATE POLICY "Admins read directory" ON public.club_leaders_directory 
        FOR SELECT TO authenticated 
        USING (public.auth_has_role('District Admin', 'Super Admin'));
    `);

    // 4. Truncate table
    console.log("Truncating public.club_leaders_directory...");
    await client.query('TRUNCATE public.club_leaders_directory CASCADE;');

    // 5. Insert rows
    console.log("Inserting leaders...");
    const insertQuery = `
      INSERT INTO public.club_leaders_directory 
      (club_name, club_type, club_email, partner_club, name, designation, phone, email) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    for (const leader of leaders) {
      await client.query(insertQuery, [
        leader.club_name,
        leader.club_type,
        leader.club_email,
        leader.partner_club,
        leader.name,
        leader.designation,
        leader.phone,
        leader.email
      ]);
    }
    
    console.log("Database seeding completed successfully!");
  } catch (err) {
    console.error("Database seeding failed:", err);
  } finally {
    await client.end();
  }
}

main();
