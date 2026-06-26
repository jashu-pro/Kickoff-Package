-- Execute this script in your Supabase SQL Editor

-- 1. Update projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_value numeric;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_manager text;

-- 2. Update team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 100;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status text DEFAULT 'available';

-- 3. Create risks table
CREATE TABLE IF NOT EXISTS risks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  timeline_risk text NOT NULL DEFAULT 'low',
  budget_risk text NOT NULL DEFAULT 'low',
  communication_risk text NOT NULL DEFAULT 'low',
  technical_risk text NOT NULL DEFAULT 'low',
  resource_risk text NOT NULL DEFAULT 'low',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text NOT NULL,
  created_by text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Create deliverables table
CREATE TABLE IF NOT EXISTS deliverables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Create kickoff_packages table
CREATE TABLE IF NOT EXISTS kickoff_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT '1.0.0',
  pdf_url text,
  docx_url text,
  json_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
