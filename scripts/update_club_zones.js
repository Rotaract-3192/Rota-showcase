const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    "Rotaract Club of Siddaganga Institute of Technology Tumakuru",
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
    "Rotaract Club of Siddaganga Institute of Technology Tumakuru",
    "Rotaract Club of Bengaluru Avinya",
    "Rotaract Club of NBC College",
    "Rotaract Club of BNM Institute of Technology"
  ]
};

async function run() {
  console.log("Starting zone mapping update...");
  let matchCount = 0;
  let unmatchCount = 0;

  for (const [zone, clubNames] of Object.entries(zoneMapping)) {
    for (let rawName of clubNames) {
      const name = rawName.trim();
      // Search for the club in DB
      // We will use ilike to ignore case, and possibly trim 'Rotaract Club of ' to be safer if needed.
      const { data: clubs, error } = await supabase
        .from('clubs')
        .select('id, name')
        .ilike('name', `%${name.replace('Rotaract Club of ', '').trim()}%`);

      if (error) {
        console.error(`Error searching for ${name}:`, error);
        continue;
      }

      if (clubs && clubs.length > 0) {
        // Assume first match is correct, or log if multiple
        const clubToUpdate = clubs[0];
        const { error: updateError } = await supabase
          .from('clubs')
          .update({ zone: zone })
          .eq('id', clubToUpdate.id);

        if (updateError) {
          console.error(`Error updating zone for ${clubToUpdate.name}:`, updateError);
        } else {
          console.log(`Updated ${clubToUpdate.name} to Zone ${zone}`);
          matchCount++;
        }
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
}

run();
