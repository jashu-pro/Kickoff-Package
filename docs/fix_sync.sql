-- Execute this script in your Supabase SQL Editor to fix the Meeting Sync and RLS errors
-- Also adds enterprise fields to projects table

-- 0. Update projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_code text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_unit text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS billing_currency text DEFAULT 'USD';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS engagement_model text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_budget numeric;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_team_size integer;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_duration text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_sponsor_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_sponsor_designation text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_city text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_country text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivery_model text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_goal text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technical_scope text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS success_criteria text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS dependencies text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS known_constraints text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS special_instructions text;

-- 1. Create meeting_frequencies if it doesn't exist
CREATE TABLE IF NOT EXISTS meeting_frequencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  frequency text NOT NULL,
  day_of_week text NOT NULL,
  time text NOT NULL,
  duration text NOT NULL,
  attendees jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create other missing tables
CREATE TABLE IF NOT EXISTS integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  service text NOT NULL,
  category text,
  description text,
  environment text,
  config jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'Ready to Generate',
  generated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escalation_levels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  level integer NOT NULL,
  severity text NOT NULL,
  description text NOT NULL,
  contact_name text NOT NULL,
  contact_role text NOT NULL,
  response_time text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stakeholders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  organization text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Disable Row Level Security (RLS) so the local UI can insert records without Auth
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_frequencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_levels DISABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables DISABLE ROW LEVEL SECURITY;
ALTER TABLE kickoff_packages DISABLE ROW LEVEL SECURITY;

-- 4. Reload the schema cache
NOTIFY pgrst, 'reload schema';
