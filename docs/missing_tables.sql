-- Run this script in your Supabase SQL Editor to create the missing tables

-- 1. Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  service text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'connected',
  last_used text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create escalation_levels table
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

-- 3. Create stakeholders table (in case it's also missing, as it's fetched after escalation_levels)
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

-- 4. Create meeting_frequencies table (in case it's also missing)
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

-- Force PostgREST to reload the schema cache so the API recognizes the new tables immediately
NOTIFY pgrst, 'reload schema';
