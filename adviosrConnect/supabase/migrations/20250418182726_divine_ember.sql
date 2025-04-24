/*
  # Create advisor reviews table and view

  1. New Tables
    - `advisor_reviews`
      - `id` (uuid, primary key)
      - `advisor_id` (uuid, foreign key to advisors)
      - `customer_id` (uuid, foreign key to users)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. New Views
    - `advisor_review_details`
      - Joins reviews with users to get reviewer names
      - Includes all review fields plus reviewer's full name

  3. Security
    - Enable RLS
    - Add policy for public read access
    - Add policy for customers to manage their own reviews
*/

-- Create advisor reviews table
CREATE TABLE IF NOT EXISTS advisor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES advisors(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE advisor_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read reviews"
  ON advisor_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Customers can manage own reviews"
  ON advisor_reviews
  FOR ALL
  TO authenticated
  USING (customer_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_advisor_reviews_updated_at
  BEFORE UPDATE ON advisor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_reviews_advisor_id ON advisor_reviews(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_reviews_customer_id ON advisor_reviews(customer_id);

-- Create view for review details
CREATE VIEW advisor_review_details WITH (security_barrier) AS
SELECT 
  r.id,
  r.advisor_id,
  r.customer_id,
  r.rating,
  r.comment,
  r.created_at,
  u.full_name as reviewer_name
FROM advisor_reviews r
JOIN users u ON r.customer_id = u.id;

-- Grant appropriate permissions
GRANT SELECT ON advisor_review_details TO authenticated, anon;

-- Insert sample reviews
INSERT INTO advisor_reviews (advisor_id, customer_id, rating, comment)
SELECT 
  a.id as advisor_id,
  u.id as customer_id,
  5 as rating,
  'Excellent advice on mutual fund portfolio diversification. Very knowledgeable and patient in explaining complex concepts.' as comment
FROM advisors a
CROSS JOIN users u
WHERE a.is_verified = true
AND u.role = 'user'
LIMIT 1;

INSERT INTO advisor_reviews (advisor_id, customer_id, rating, comment)
SELECT 
  a.id as advisor_id,
  u.id as customer_id,
  4 as rating,
  'Great insights on tax-saving investments. Would recommend for long-term planning.' as comment
FROM advisors a
CROSS JOIN users u
WHERE a.is_verified = true
AND u.role = 'user'
OFFSET 1 LIMIT 1;

INSERT INTO advisor_reviews (advisor_id, customer_id, rating, comment)
SELECT 
  a.id as advisor_id,
  u.id as customer_id,
  5 as rating,
  'Very professional and thorough in analysis. Worth every rupee!' as comment
FROM advisors a
CROSS JOIN users u
WHERE a.is_verified = true
AND u.role = 'user'
OFFSET 2 LIMIT 1;