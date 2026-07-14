const xlsx = require('xlsx');
const fs = require('fs');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Helper for random ocean images
const oceanImage = (id) => {
  const ids = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473116763269-255ea7b2b5f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520113805175-e5eb463e7925?auto=format&fit=crop&w=800&q=80"
  ];
  return ids[id % ids.length];
};

function main() {
  const buf = fs.readFileSync('docs/Exuberant Club Leaders Directory RY 2026-27');
  const workbook = xlsx.read(buf, { type: 'buffer' });
  const worksheet = workbook.Sheets['Master Sheet'];
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  let currentClub = null;
  let currentClubType = null;
  let currentClubEmail = null;
  let currentZone = "Zone 1";
  
  const clubsMap = new Map();
  
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    // Check if new club starts
    if (row[1] && row[1].trim() !== '') {
      currentClub = row[1].trim();
      currentClubType = row[2] ? row[2].trim() : '';
      currentClubEmail = row[3] ? row[3].trim() : '';
      
      if (!clubsMap.has(currentClub)) {
        clubsMap.set(currentClub, {
          id: slugify(currentClub),
          name: currentClub,
          logo: oceanImage(clubsMap.size),
          leaders: [],
          charterYear: "20" + (10 + Math.floor(Math.random() * 15)), // placeholder
          memberCount: 20 + Math.floor(Math.random() * 80),
          totalProjects: Math.floor(Math.random() * 40),
          totalPoints: Math.floor(Math.random() * 2000),
          zone: "Zone " + (1 + (clubsMap.size % 3)),
          description: currentClubType + " based Rotaract club in District 3192.",
          email: currentClubEmail || slugify(currentClub) + "@example.com",
        });
      }
    }
    
    const name = row[5] ? row[5].trim() : '';
    const designation = row[6] ? row[6].trim() : '';
    
    if (name && currentClub) {
      const clubData = clubsMap.get(currentClub);
      clubData.leaders.push({
        designation,
        name
      });
    }
  }
  
  const clubsArray = Array.from(clubsMap.values());
  
  // Also we want to preserve backwards compatibility for `president` field if needed,
  // but we will update the type instead.
  
  fs.writeFileSync('clubs_output.json', JSON.stringify(clubsArray, null, 2));
  console.log(`Generated ${clubsArray.length} clubs.`);
}

main();
