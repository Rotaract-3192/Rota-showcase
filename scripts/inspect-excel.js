const xlsx = require('xlsx');
const fs = require('fs');

try {
  // Read file buffer first
  const buf = fs.readFileSync('docs/Exuberant Club Leaders Directory RY 2026-27');
  const workbook = xlsx.read(buf, { type: 'buffer' });
  
  console.log("Sheet Names:", workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // read as raw rows
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log("Total rows:", data.length);
    console.log("Header row (row 0):", data[0]);
    console.log("Row 1:", data[1]);
    console.log("Row 2:", data[2]);
    console.log("Row 3:", data[3]);
  }
} catch (err) {
  console.error("Error reading workbook:", err);
}
