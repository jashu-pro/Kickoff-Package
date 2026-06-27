import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('packages', {
    public: true,
    allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/json'],
    fileSizeLimit: 10485760 // 10MB
  })
  if (error) {
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      console.log('Bucket already exists.')
      
      // Try to update it to public
      await supabase.storage.updateBucket('packages', {
        public: true
      })
      console.log('Bucket updated to public.')
    } else {
      console.error('Error creating bucket:', error)
    }
  } else {
    console.log('Bucket created successfully:', data)
  }
}

createBucket()
