-- Monitors table
CREATE TABLE IF NOT EXISTS monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  check_interval integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;

-- Policies for monitors
CREATE POLICY "Users can view their own monitors"
  ON monitors FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own monitors"
  ON monitors FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own monitors"
  ON monitors FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own monitors"
  ON monitors FOR DELETE USING (user_id = auth.uid());

-- Monitor checks table
CREATE TABLE IF NOT EXISTS monitor_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid REFERENCES monitors(id) ON DELETE CASCADE,
  status text NOT NULL,
  response_time integer,
  status_code integer,
  error_message text,
  checked_at timestamptz DEFAULT now()
);
