const { Client } = require('pg');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

const zoneMapping = {
  "Arnava": [
    "Rotaract Club of Bangalore Udyog",
    "Rotaract Club of Bangalore Golden Rock",
    "Rotaract Club of Bengaluru Nava Chaitanya",
    "Rotaract Club of Christ University Bangalore Yeshwanthpur Campus",
    "Rotaract Club of Surana College",
    "Rotaract Club of Presidency College",
    "Rotaract Club of Rajanukunte Royals",
    "Rotaract Club of St. Anne's First Grade College",
    "Rotaract Club of AIMIT College",
    "Rotaract Club of Siddaganga Institute of Technology Tumakuru", // duplicate mapped here
    "Rotaract Club of Sri Basaveshwara First Grade College",
    "Rotaract Club of H K Veeranna Gowda College",
    "Rotaract Club of Baldwin Women's Methodist College",
    "Rotaract Club of MP Birla Institute of Management"
  ],
  "Pravaha": [
    "Rotaract Club of AIMS Institute of Higher Education",
    "Rotaract Bangalore West",
    "Rotaract Club of MES College",
    "Rotaract Club of Yenepoya",
    "Rotaract Club of Bangalore Bhuvaneshwari Nagar",
    "Rotaract Club of Bangalore Warriors",
    "Rotaract Club of Bangalore Oasis",
    "Rotaract Club of Presidency University Bangalore",
    "Rotaract Club of Koshys Institute of Management Studies Autonomous",
    "Rotaract Club of M. S. Engineering College",
    "Rotaract Club of St. Annes Degree College for Women",
    "Rotaract Club of Seshadripuram College",
    "Rotaract Club of Bengaluru Compassion Crew",
    "Rotaract Club of Aditya Institute of Management Studies"
  ],
  "Samudhra": [
    "Rotaract Club of Bengaluru Nagasandra",
    "Rotaract Club of Bangalore",
    "Rotaract Club of Bangalore North West",
    "Rotaract Club of Sai Vidya Institute of Technology",
    "Rotaract Club of Jyothy Institute of Technology",
    "Rotaract Club of Ramaiah Institute of Management Studies",
    "Rotaract Club of CMRIT",
    "Rotaract Club of GEMS B School",
    "Rotaract Club of HKBK Group of Institutions",
    "Rotaract Club of Sri Guru Sai First Grade College",
    "Rotaract Club of Mandya",
    "Rotaract Club of Charan's Degree College",
    "Rotaract Club of HKES Sree Veerendra Patil Degree College",
    "Rotaract Club of Srirangapatna"
  ],
  "Varuna": [
    "Rotaract Club of Vidyaranyapura",
    "Rotaract Club of BMS Yelahanka",
    "Rotaract Club of RajaRajeswari College of Engineering",
    "Rotaract Club of Bangalore Indiranagar",
    "Rotaract Club of Triveni College",
    "Rotaract Club of Christ University Central Campus",
    "Rotaract Club of Christ University Bannerghatta Road Campus",
    "Rotaract Club of MES Institute of Management",
    "Rotaract Club of Bangalore Nandini",
    "Rotaract Club of Bangalore R.T. Nagar",
    "Rotaract Club of St Pauls College",
    "Rotaract Club of Sri Sai College for Women",
    "Rotaract Club of Dhanwantri Institutions",
    "Rotaract Club of Agragami Degree College",
    "Rotaract Club of Soundarya Institute of Management and Science"
  ],
  "Taranga": [
    "Rotaract Club of Swarna Bengaluru",
    "Rotaract Club of RUAS",
    "Rotaract Club of Bangalore Basaveshwaranagar",
    "Rotaract Club of Acharya Bangalore B School",
    "Rotaract Club of Bengaluru Orion Gateway",
    "Rotaract Club of RPA First Grade College Rajajinagar",
    "Rotaract Club of Nelamangala",
    "Rotaract Club of Seshadripuram Institute of Management Studies",
    "Rotaract Club of VBR",
    "Rotaract Club of Ambedkar Institute of Technology",
    "Rotaract Club of Gulmohar KIT MBA Department Tiptur",
    "Rotaract Club of Sahakaranagar",
    "Rotaract Club of Vidya Para Medical College",
    "Rotaract Club of Bishop Cotton Yelahanka"
  ],
  "Sagara": [
    "Rotaract Club of Bangalore Raj Mahal Vilas",
    "Rotaract Club of Yelahanka",
    "Rotaract Club of Silicon City",
    "Rotaract Club of M S Ramaiah College of Arts, Science and Commerce",
    "Rotaract Club of Falcon Youth",
    "Rotaract Club of Surana College Peenya",
    "Rotaract Club of St.Claret College",
    "Rotaract Club of United International Business School",
    "Rotaract Club of Bangalore Junction",
    "Rotaract Club of GITAM Bengaluru",
    "Rotaract Club of Siddaganga Institute of Technology Tumakuru", // duplicate mapped here
    "Rotaract Club of Bengaluru Avinya",
    "Rotaract Club of NBC College",
    "Rotaract Club of BNM Institute of Technology"
  ]
};

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to DB, starting update...");

    let matchCount = 0;
    let unmatchCount = 0;

    for (const [zone, clubNames] of Object.entries(zoneMapping)) {
      for (let rawName of clubNames) {
        const name = rawName.trim();
        // we replace 'Rotaract Club of ' optionally, or just match ilike
        const searchTerm = `%${name.replace('Rotaract Club of ', '').trim()}%`;
        const res = await client.query('SELECT id, name FROM clubs WHERE name ILIKE $1', [searchTerm]);
        
        if (res.rows.length > 0) {
          const club = res.rows[0];
          await client.query('UPDATE clubs SET zone = $1 WHERE id = $2', [zone, club.id]);
          console.log(`Updated ${club.name} to Zone ${zone}`);
          matchCount++;
        } else {
          console.warn(`⚠️ Could not find exact match in DB for: ${name}`);
          unmatchCount++;
        }
      }
    }
    console.log(`\nFinished! Successfully updated ${matchCount} clubs.`);
    if (unmatchCount > 0) {
      console.log(`There were ${unmatchCount} clubs that could not be matched exactly in the database.`);
    }
  } catch (err) {
    console.error("Error updating clubs:", err);
  } finally {
    await client.end();
  }
}

run();
