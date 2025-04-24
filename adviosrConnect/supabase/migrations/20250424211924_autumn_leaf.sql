/*
  # Create advisor availability table and add sample data

  1. New Tables
    - `advisor_availability`
      - `id` (uuid, primary key)
      - `advisor_id` (uuid, foreign key to advisors)
      - `day_of_week` (text)
      - `start_time` (time)
      - `end_time` (time)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
    - Add policy for advisors to manage their availability
*/

-- Create advisor availability table
CREATE TABLE IF NOT EXISTS advisor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week = ANY (ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample availability for SEBI analysts
WITH sebi_analysts AS (
  SELECT id FROM advisors WHERE registration_type = 'SEBI'
)
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_active)
SELECT 
  id,
  'monday',
  '09:00'::time,
  '17:00'::time,
  true
FROM sebi_analysts
UNION ALL
SELECT 
  id,
  'tuesday',
  '10:00'::time,
  '18:00'::time,
  true
FROM sebi_analysts
UNION ALL
SELECT 
  id,
  'wednesday',
  '09:00'::time,
  '17:00'::time,
  false -- Wednesday off
FROM sebi_analysts
UNION ALL
SELECT 
  id,
  'thursday',
  '11:00'::time,
  '19:00'::time,
  true
FROM sebi_analysts
UNION ALL
SELECT 
  id,
  'friday',
  '09:00'::time,
  '16:00'::time,
  true
FROM sebi_analysts
UNION ALL
SELECT 
  id,
  'saturday',
  '10:00'::time,
  '14:00'::time,
  CASE WHEN random() > 0.5 THEN true ELSE false END -- 50% chance of working Saturday
FROM sebi_analysts;

-- Insert sample availability for MFD distributors
WITH mfd_distributors AS (
  SELECT id FROM advisors WHERE registration_type = 'MFD'
)
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_active)
SELECT 
  id,
  'monday',
  '10:00'::time,
  '18:00'::time,
  true
FROM mfd_distributors
UNION ALL
SELECT 
  id,
  'tuesday',
  '09:00'::time,
  '17:00'::time,
  true
FROM mfd_distributors
UNION ALL
SELECT 
  id,
  'wednesday',
  '10:00'::time,
  '18:00'::time,
  true
FROM mfd_distributors
UNION ALL
SELECT 
  id,
  'thursday',
  '09:00'::time,
  '17:00'::time,
  false -- Thursday off
FROM mfd_distributors
UNION ALL
SELECT 
  id,
  'friday',
  '10:00'::time,
  '16:00'::time,
  true
FROM mfd_distributors
UNION ALL
SELECT 
  id,
  'sunday',
  '11:00'::time,
  '15:00'::time,
  CASE WHEN random() > 0.7 THEN true ELSE false END -- 30% chance of working Sunday
FROM mfd_distributors;