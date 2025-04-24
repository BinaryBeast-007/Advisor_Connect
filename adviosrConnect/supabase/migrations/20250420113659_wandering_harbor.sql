/*
  # Create advisor bookmarks table

  1. New Tables
    - `advisor_bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `advisor_id` (uuid, foreign key to advisors)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their bookmarks
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS advisor_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  advisor_id uuid REFERENCES advisors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, advisor_id)
);

-- Enable Row Level Security
ALTER TABLE advisor_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own bookmarks"
  ON advisor_bookmarks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_bookmarks_user_id ON advisor_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_bookmarks_advisor_id ON advisor_bookmarks(advisor_id);