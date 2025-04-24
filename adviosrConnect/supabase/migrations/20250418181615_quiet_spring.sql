/*
  # Create advisor packages table

  1. New Tables
    - `advisor_packages`
      - `id` (uuid, primary key)
      - `advisor_id` (uuid, foreign key to advisors)
      - `title` (text)
      - `subtitle` (text)
      - `price` (integer)
      - `duration` (integer, in minutes)
      - `features` (text[], array of bullet points)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
    - Add policy for advisor to manage their packages
*/

-- Create advisor packages table
CREATE TABLE IF NOT EXISTS advisor_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES advisors(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  price integer NOT NULL CHECK (price >= 0),
  duration integer NOT NULL CHECK (duration > 0),
  features text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE advisor_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read advisor packages"
  ON advisor_packages
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM advisors
      WHERE advisors.id = advisor_packages.advisor_id
      AND advisors.is_verified = true
    )
  );

CREATE POLICY "Advisors can manage own packages"
  ON advisor_packages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM advisors
      WHERE advisors.id = advisor_packages.advisor_id
      AND advisors.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_advisor_packages_updated_at
  BEFORE UPDATE ON advisor_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_packages_advisor_id ON advisor_packages(advisor_id);

-- Insert sample data
INSERT INTO advisor_packages (advisor_id, title, subtitle, price, duration, features)
SELECT 
  id as advisor_id,
  'Quick Consultation' as title,
  'Get quick answers to your investment queries' as subtitle,
  1500 as price,
  30 as duration,
  ARRAY[
    'One-on-one discussion',
    'Basic investment advice',
    'Quick portfolio review',
    'Investment strategy tips'
  ] as features
FROM advisors
WHERE is_verified = true;

INSERT INTO advisor_packages (advisor_id, title, subtitle, price, duration, features)
SELECT 
  id as advisor_id,
  'Portfolio Assessment' as title,
  'Comprehensive review of your investment portfolio' as subtitle,
  2500 as price,
  60 as duration,
  ARRAY[
    'Detailed portfolio analysis',
    'Risk assessment',
    'Rebalancing suggestions',
    'Written summary report'
  ] as features
FROM advisors
WHERE is_verified = true;

INSERT INTO advisor_packages (advisor_id, title, subtitle, price, duration, features)
SELECT 
  id as advisor_id,
  'Financial Planning' as title,
  'Complete financial planning session' as subtitle,
  3500 as price,
  90 as duration,
  ARRAY[
    'Goal-based planning',
    'Investment strategy',
    'Tax planning advice',
    'Detailed action plan'
  ] as features
FROM advisors
WHERE is_verified = true;

INSERT INTO advisor_packages (advisor_id, title, subtitle, price, duration, features)
SELECT 
  id as advisor_id,
  'Tax Strategy' as title,
  'Optimize your investments for tax efficiency' as subtitle,
  2500 as price,
  60 as duration,
  ARRAY[
    'Tax-saving investment options',
    'ELSS fund selection',
    'Tax harvesting strategies',
    'Written recommendations'
  ] as features
FROM advisors
WHERE is_verified = true;