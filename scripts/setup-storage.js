const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly from .env file
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function setupStorage() {
  try {
    console.log('🚀 Setting up Supabase Storage...');

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(b => b.name === 'upwear-images');

    if (!bucketExists) {
      // Create bucket
      const { data, error } = await supabase.storage.createBucket('upwear-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }

      console.log('✅ Bucket created successfully');
    } else {
      console.log('ℹ️ Bucket already exists');
    }

    console.log('✅ Storage setup completed');
    console.log('📁 Bucket name: upwear-images');
    console.log('🔒 Public access: enabled');
    console.log('📄 File size limit: 5MB');

  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupStorage();