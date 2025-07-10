
-- supabase/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Monitors table
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  check_interval INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitor checks table
CREATE TABLE monitor_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert configurations
CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
  slack_webhook_url TEXT,
  alert_threshold INTEGER DEFAULT 1,
  last_alert_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_monitors_user_id ON monitors(user_id);
CREATE INDEX idx_monitor_checks_monitor_id ON monitor_checks(monitor_id);
CREATE INDEX idx_monitor_checks_checked_at ON monitor_checks(checked_at DESC);

-- RLS Policies
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;

-- Monitors policies
CREATE POLICY "Users can view own monitors" ON monitors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own monitors" ON monitors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitors" ON monitors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitors" ON monitors
  FOR DELETE USING (auth.uid() = user_id);

-- Monitor checks policies
CREATE POLICY "Users can view checks for own monitors" ON monitor_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors 
      WHERE monitors.id = monitor_checks.monitor_id 
      AND monitors.user_id = auth.uid()
    )
  );

-- Alert configs policies
CREATE POLICY "Users can manage alerts for own monitors" ON alert_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM monitors 
      WHERE monitors.id = alert_configs.monitor_id 
      AND monitors.user_id = auth.uid()
    )
  );

