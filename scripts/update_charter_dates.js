const { Client } = require('pg');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

const charterMapping = [
  { searchStr: "Rotaract Bangalore West", dateStr: "9 Feb 2020" }, // defaulting year if missing
  { searchStr: "Acharya Bangalore B School", dateStr: "20-Aug-2025" },
  { searchStr: "Koshys Institute of Management Studies", dateStr: "23-Jan-2025" },
  { searchStr: "Agragami Degree College", dateStr: "14-Jan-2022" },
  { searchStr: "AIMIT College", dateStr: "29-Nov-2017" },
  { searchStr: "AIMS Institute of Higher Education", dateStr: "4-Sep-2018" },
  { searchStr: "Ambedkar Institute of Technology", dateStr: "12-Sep-2024" },
  { searchStr: "Baldwin Women's Methodist College", dateStr: "5-Nov-2003" },
  { searchStr: "Rotaract Club of Bangalore", dateStr: "28-Jul-1968" }, // exact
  { searchStr: "Bangalore Basaveshwaranagar", dateStr: "25-Jun-2019" },
  { searchStr: "Bangalore Bhuvaneshwari Nagar", dateStr: "09-Aug-2022" },
  { searchStr: "Bangalore Golden Rock", dateStr: "01-Feb-2012" },
  { searchStr: "Bangalore Indiranagar", dateStr: "17-Nov-1981" },
  { searchStr: "Bangalore Junction", dateStr: "07-May-2018" },
  { searchStr: "Bangalore Nandini", dateStr: "18-Oct-2024" },
  { searchStr: "Bangalore North West", dateStr: "29-May-2012" },
  { searchStr: "Bangalore Oasis", dateStr: "25-Jul-2024" },
  { searchStr: "Bangalore R.T. Nagar", dateStr: "29-Nov-2000" },
  { searchStr: "Bangalore Raj Mahal Vilas", dateStr: "26-Jul-2017" },
  { searchStr: "Bangalore Udyog", dateStr: "18-Jul-2023" },
  { searchStr: "Bangalore Warriors", dateStr: "28-Sep-2023" },
  { searchStr: "Bengaluru Avinya", dateStr: "14-Aug-2024" },
  { searchStr: "Bengaluru Compassion Crew", dateStr: "10-Jul-2025" },
  { searchStr: "Bengaluru Nagasandra", dateStr: "21-Jun-2021" },
  { searchStr: "Bengaluru Nava Chaitanya", dateStr: "25-Jul-2024" },
  { searchStr: "Bengaluru Orion Gateway", dateStr: "20-Jul-2021" },
  { searchStr: "Bishop Cotton Yelahanka", dateStr: "04-Sep-2018" },
  { searchStr: "BMS Yelahanka", dateStr: "12-Feb-2018" },
  { searchStr: "BNM Institute of Technology", dateStr: "09-Jan-2026" },
  { searchStr: "CMRIT", dateStr: "21-Sep-2015" },
  { searchStr: "Charan's Degree College", dateStr: "01-Sep-2025" },
  { searchStr: "Yeshwanthpur Campus", dateStr: "28-Oct-2025" },
  { searchStr: "Christ University Central Campus", dateStr: "11-Sep-2024" },
  { searchStr: "Christ University Kengeri Campus", dateStr: "19-Jun-2026" },
  { searchStr: "Christ University Bannerghatta Road Campus", dateStr: "15-May-2026" }, // best guess for "Campus - 15 May"
  { searchStr: "Dhanwantri Institutions", dateStr: "08-Oct-2025" },
  { searchStr: "Falcon Youth", dateStr: "25-Aug-2022" },
  { searchStr: "GEMS B School", dateStr: "18-Nov-2016" },
  { searchStr: "GITAM Bengaluru", dateStr: "10-May-2024" },
  { searchStr: "Kalpataru", dateStr: "28-Jun-2026" },
  { searchStr: "Tiptur", dateStr: "03-Nov-2025" },
  { searchStr: "H K Veeranna Gowda College", dateStr: "28-Jan-2026" },
  { searchStr: "HKBK Group of Institutions", dateStr: "24-Jun-2025" },
  { searchStr: "Sri Basaveshwara First Grade College", dateStr: "15-Sep-2025" }, // best guess for "College - 15 Sep"
  { searchStr: "Jyothy Institute of Technology", dateStr: "02-Jan-2024" },
  { searchStr: "Mandya", dateStr: "30-Jun-2026" },
  { searchStr: "MES College", dateStr: "12-Oct-2015" },
  { searchStr: "MES Institute of Management", dateStr: "27-Feb-2023" },
  { searchStr: "MP Birla Institute of Management", dateStr: "21-Aug-2025" },
  { searchStr: "Science and Commerce", dateStr: "08-Apr-2025" }, // Ramaiah Arts/Science
  { searchStr: "M. S. Engineering College", dateStr: "05-May-2025" },
  { searchStr: "NBC College", dateStr: "10-Oct-2025" },
  { searchStr: "Presidency College", dateStr: "31-Mar-2005" },
  { searchStr: "Presidency University", dateStr: "24-Sep-2019" },
  { searchStr: "Rajanukunte Royals", dateStr: "22-Aug-2025" },
  { searchStr: "RajaRajeswari College of Engineering", dateStr: "21-Nov-2022" }, // guess
  { searchStr: "Ramaiah Institute of Management Studies", dateStr: "10-Nov-2015" }, // guess
  { searchStr: "RPA First Grade College Rajajinagar", dateStr: "04-Nov-2024" },
  { searchStr: "RUAS", dateStr: "24-Jun-2022" },
  { searchStr: "Sahakaranagar", dateStr: "01-Sep-2025" },
  { searchStr: "Sai Vidya Institute of Technology", dateStr: "25-Aug-2022" },
  { searchStr: "Seshadripuram College", dateStr: "19-Jan-2026" },
  { searchStr: "Seshadripuram Institute of Management Studies", dateStr: "11-Jan-2017" }, // guess
  { searchStr: "Tumakuru", dateStr: "10-Mar-2025" }, // SIT Tumakuru
  { searchStr: "Silicon City", dateStr: "02-Mar-2023" },
  { searchStr: "Soundarya Institute of Management and Science", dateStr: "03-Sep-2025" }, // guess
  { searchStr: "Sri Guru Sai First Grade College", dateStr: "22-Aug-2025" },
  { searchStr: "Srirangapatna", dateStr: "14-May-2026" },
  { searchStr: "Sri Sai College for Women", dateStr: "19-Jan-2026" },
  { searchStr: "St.Claret College", dateStr: "11-Nov-2021" },
  { searchStr: "St Pauls College", dateStr: "25-Aug-2021" },
  { searchStr: "St. Anne's First Grade College", dateStr: "18-Nov-2024" },
  { searchStr: "St. Annes Degree College for Women", dateStr: "29-Oct-2024" }, // guess
  { searchStr: "Surana College", dateStr: "27-May-2015" },
  { searchStr: "Surana College Peenya", dateStr: "16-Aug-2019" },
  { searchStr: "Swarna Bengaluru", dateStr: "07-Mar-2014" },
  { searchStr: "Triveni College", dateStr: "24-Apr-2025" },
  { searchStr: "United International Business School", dateStr: "25-Aug-2025" },
  { searchStr: "VBR", dateStr: "26-Jul-2021" },
  { searchStr: "Vidya Para Medical College", dateStr: "06-Oct-2025" },
  { searchStr: "Vidyaranyapura", dateStr: "16-Nov-2017" },
  { searchStr: "Yelahanka", dateStr: "19-Mar-2010" },
  { searchStr: "Yenepoya", dateStr: "10-Jun-2024" }
];

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to DB, starting charter date update...");

    let matchCount = 0;
    let unmatchCount = 0;

    for (const item of charterMapping) {
      if (!item.dateStr) continue;

      let nameToSearch = item.searchStr.replace('Rotaract Club of', '').trim();
      if (nameToSearch === 'Bangalore') {
        nameToSearch = 'Bangalore'; 
      }
      
      const searchTerm = `%${nameToSearch}%`;

      const res = await client.query('SELECT id, name FROM clubs WHERE name ILIKE $1', [searchTerm]);
      
      if (res.rows.length === 1 || (res.rows.length > 0 && nameToSearch === 'Bangalore')) {
        let club;
        if (nameToSearch === 'Bangalore') {
           club = res.rows.find(r => r.name.toLowerCase() === 'rotaract club of bangalore');
           if (!club) club = res.rows[0];
        } else {
           club = res.rows[0];
        }
        
        let parsedDate = null;
        try {
          parsedDate = new Date(item.dateStr).toISOString();
        } catch (e) {
          console.error(`Invalid date format for ${item.dateStr}`);
        }

        if (parsedDate) {
          await client.query('UPDATE clubs SET charter_date = $1 WHERE id = $2', [parsedDate, club.id]);
          console.log(`Updated ${club.name} to Charter Date: ${item.dateStr} (${parsedDate.split('T')[0]})`);
          matchCount++;
        }
      } else {
        console.warn(`⚠️ Could not find exact match in DB for: ${item.searchStr} (Found ${res.rows.length} rows)`);
        unmatchCount++;
      }
    }
    console.log(`\nFinished! Successfully updated ${matchCount} clubs.`);
    if (unmatchCount > 0) {
      console.log(`There were ${unmatchCount} clubs that could not be matched exactly in the database.`);
    }
  } catch (err) {
    console.error("Error updating charter dates:", err);
  } finally {
    await client.end();
  }
}

run();
