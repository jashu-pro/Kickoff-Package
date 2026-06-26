-- Run this script in your Supabase SQL Editor to create the missing tables and storage bucket

-- 1. Create kickoff_packages table
CREATE TABLE IF NOT EXISTS kickoff_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT '1.0.0',
  pdf_url text,
  docx_url text,
  json_url text,
  status text NOT NULL DEFAULT 'Generated',
  generated_by text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Storage Bucket for packages if not exists
-- (Requires Supabase superuser, but typically works in SQL editor)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('packages', 'packages', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up public access policy for packages bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'packages');

CREATE POLICY "Authenticated Users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'packages');

CREATE POLICY "Authenticated Users can update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'packages');

-- Force PostgREST to reload the schema cache so the API recognizes the new tables immediately
NOTIFY pgrst, 'reload schema';
