-- Migration to add alert settings columns to existing profiles table
-- Run this in your Supabase SQL editor

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS slack_webhook_url text,
ADD COLUMN IF NOT EXISTS sms_alerts_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_alerts_enabled boolean DEFAULT false;

-- Update existing profiles to have default values
UPDATE profiles 
SET 
  sms_alerts_enabled = false,
  slack_alerts_enabled = false
WHERE sms_alerts_enabled IS NULL OR slack_alerts_enabled IS NULL; 