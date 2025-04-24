/*
  # Add sample customers and reviews

  1. Changes
    - Insert sample customers in users table
    - Add sample reviews for advisors from these customers
    - Ensure realistic review distribution

  2. Sample Data
    - 10 customers with varied profiles
    - Multiple reviews per customer
    - Mix of ratings and detailed comments
*/

-- Insert sample customers
INSERT INTO users (id, email, password_hash, full_name, role, phone)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'customer1@example.com', 'dummy_hash', 'Aditya Verma', 'user', '+91-9811111111'),
  ('c2222222-2222-2222-2222-222222222222', 'customer2@example.com', 'dummy_hash', 'Sneha Patel', 'user', '+91-9822222222'),
  ('c3333333-3333-3333-3333-333333333333', 'customer3@example.com', 'dummy_hash', 'Rajesh Kumar', 'user', '+91-9833333333'),
  ('c4444444-4444-4444-4444-444444444444', 'customer4@example.com', 'dummy_hash', 'Priya Singh', 'user', '+91-9844444444'),
  ('c5555555-5555-5555-5555-555555555555', 'customer5@example.com', 'dummy_hash', 'Karthik Reddy', 'user', '+91-9855555555'),
  ('c6666666-6666-6666-6666-666666666666', 'customer6@example.com', 'dummy_hash', 'Anita Sharma', 'user', '+91-9866666666'),
  ('c7777777-7777-7777-7777-777777777777', 'customer7@example.com', 'dummy_hash', 'Mohammed Khan', 'user', '+91-9877777777'),
  ('c8888888-8888-8888-8888-888888888888', 'customer8@example.com', 'dummy_hash', 'Lakshmi Nair', 'user', '+91-9888888888'),
  ('c9999999-9999-9999-9999-999999999999', 'customer9@example.com', 'dummy_hash', 'Vikram Malhotra', 'user', '+91-9899999999'),
  ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'customer10@example.com', 'dummy_hash', 'Deepika Iyer', 'user', '+91-9800000000');

-- Add sample reviews for SEBI analysts
INSERT INTO advisor_reviews (advisor_id, customer_id, rating, comment, created_at)
SELECT 
  a.id,
  c.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 5
    WHEN 1 THEN 4
    WHEN 2 THEN 5
    WHEN 3 THEN 4
    ELSE 3
  END as rating,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Excellent analysis and clear explanations. Really helped me understand the market better.'
    WHEN 1 THEN 'Very professional and knowledgeable. Great investment suggestions.'
    WHEN 2 THEN 'Thorough research and practical advice. Would definitely recommend.'
    WHEN 3 THEN 'Good insights into market trends. Helped me make informed decisions.'
    ELSE 'Helpful session with detailed portfolio analysis.'
  END as comment,
  now() - (random() * interval '90 days') as created_at
FROM advisors a
CROSS JOIN users c
WHERE a.registration_type = 'SEBI'
AND c.role = 'user'
AND random() < 0.7;  -- 70% chance of review

-- Add sample reviews for MFD distributors
INSERT INTO advisor_reviews (advisor_id, customer_id, rating, comment, created_at)
SELECT 
  a.id,
  c.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 5
    WHEN 1 THEN 4
    WHEN 2 THEN 5
    WHEN 3 THEN 4
    ELSE 3
  END as rating,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Great mutual fund recommendations. Portfolio performing well.'
    WHEN 1 THEN 'Very helpful in selecting the right funds for my goals.'
    WHEN 2 THEN 'Excellent understanding of different fund categories.'
    WHEN 3 THEN 'Clear explanation of fund strategies and risks.'
    ELSE 'Good guidance on SIP planning and asset allocation.'
  END as comment,
  now() - (random() * interval '90 days') as created_at
FROM advisors a
CROSS JOIN users c
WHERE a.registration_type = 'MFD'
AND c.role = 'user'
AND random() < 0.7;  -- 70% chance of review