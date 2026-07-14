const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log("Checking if 'club_logos' bucket exists...");
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }
  
  const exists = buckets.some(b => b.name === 'club_logos');
  
  if (!exists) {
    console.log("Creating 'club_logos' bucket...");
    const { data, error } = await supabase.storage.createBucket('club_logos', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    });
    
    if (error) {
      console.error("Failed to create bucket:", error);
    } else {
      console.log("Bucket created successfully:", data);
    }
  } else {
    console.log("'club_logos' bucket already exists.");
  }
}

main();
