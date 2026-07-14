const xlsx = require('xlsx');
const fs = require('fs');

try {
  const buf = fs.readFileSync('docs/Exuberant Club Leaders Directory RY 2026-27');
  const workbook = xlsx.read(buf, { type: 'buffer' });
  const worksheet = workbook.Sheets['Master Sheet'];
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log("Master Sheet total raw rows:", rows.length);
  
  // Headers are at index 2 (row 3)
  const headers = rows[2];
  console.log("Headers:", headers);
  
  let currentClub = null;
  let currentClubType = null;
  let currentClubEmail = null;
  let currentPartnerClub = null;
  
  const parsedLeaders = [];
  
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
      parsedLeaders.push({
        club: currentClub,
        clubType: currentClubType,
        clubEmail: currentClubEmail,
        partnerClub: currentPartnerClub,
        name,
        designation,
        contact,
        email
      });
    }
  }
  
  console.log(`Parsed ${parsedLeaders.length} leaders.`);
  console.log("Sample 10 leaders:");
  console.log(parsedLeaders.slice(0, 10));
  
  // Count by designation
  const designationCounts = {};
  parsedLeaders.forEach(l => {
    designationCounts[l.designation] = (designationCounts[l.designation] || 0) + 1;
  });
  console.log("\nDesignation Counts:", designationCounts);
  
} catch (err) {
  console.error("Error:", err);
}
