/*
  # Add sample advisor data

  1. Changes
    - Insert 20 sample users (10 SEBI analysts, 10 MFD distributors)
    - Insert corresponding advisor profiles with varied experience and languages
    - Set all advisors as verified for testing

  2. Sample Data
    - SEBI Registered Analysts: 10 entries with registration numbers
    - Mutual Fund Distributors: 10 entries with ARN numbers
    - Languages: Mix of English, Hindi, Telugu, Tamil, Gujarati, Marathi
    - Experience: Ranging from 2 to 15 years
*/

-- Insert sample users
INSERT INTO public.users (id, email, password_hash, full_name, role, phone)
VALUES
  -- SEBI Analysts
  ('11111111-1111-1111-1111-111111111111', 'analyst1@example.com', 'dummy_hash', 'Rahul Sharma', 'advisor', '+91-9876543210'),
  ('22222222-2222-2222-2222-222222222222', 'analyst2@example.com', 'dummy_hash', 'Priya Patel', 'advisor', '+91-9876543211'),
  ('33333333-3333-3333-3333-333333333333', 'analyst3@example.com', 'dummy_hash', 'Amit Kumar', 'advisor', '+91-9876543212'),
  ('44444444-4444-4444-4444-444444444444', 'analyst4@example.com', 'dummy_hash', 'Deepa Reddy', 'advisor', '+91-9876543213'),
  ('55555555-5555-5555-5555-555555555555', 'analyst5@example.com', 'dummy_hash', 'Vikram Singh', 'advisor', '+91-9876543214'),
  ('66666666-6666-6666-6666-666666666666', 'analyst6@example.com', 'dummy_hash', 'Neha Gupta', 'advisor', '+91-9876543215'),
  ('77777777-7777-7777-7777-777777777777', 'analyst7@example.com', 'dummy_hash', 'Rajesh Iyer', 'advisor', '+91-9876543216'),
  ('88888888-8888-8888-8888-888888888888', 'analyst8@example.com', 'dummy_hash', 'Anjali Desai', 'advisor', '+91-9876543217'),
  ('99999999-9999-9999-9999-999999999999', 'analyst9@example.com', 'dummy_hash', 'Suresh Kumar', 'advisor', '+91-9876543218'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'analyst10@example.com', 'dummy_hash', 'Meera Shah', 'advisor', '+91-9876543219'),
  
  -- MFD Distributors
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mfd1@example.com', 'dummy_hash', 'Arun Joshi', 'advisor', '+91-9876543220'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'mfd2@example.com', 'dummy_hash', 'Smita Patil', 'advisor', '+91-9876543221'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'mfd3@example.com', 'dummy_hash', 'Karthik Raman', 'advisor', '+91-9876543222'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'mfd4@example.com', 'dummy_hash', 'Pooja Mehta', 'advisor', '+91-9876543223'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'mfd5@example.com', 'dummy_hash', 'Sanjay Verma', 'advisor', '+91-9876543224'),
  ('11111111-2222-3333-4444-555555555555', 'mfd6@example.com', 'dummy_hash', 'Anita Rao', 'advisor', '+91-9876543225'),
  ('22222222-3333-4444-5555-666666666666', 'mfd7@example.com', 'dummy_hash', 'Dinesh Tiwari', 'advisor', '+91-9876543226'),
  ('33333333-4444-5555-6666-777777777777', 'mfd8@example.com', 'dummy_hash', 'Lakshmi Nair', 'advisor', '+91-9876543227'),
  ('44444444-5555-6666-7777-888888888888', 'mfd9@example.com', 'dummy_hash', 'Prakash Menon', 'advisor', '+91-9876543228'),
  ('55555555-6666-7777-8888-999999999999', 'mfd10@example.com', 'dummy_hash', 'Ritu Kapoor', 'advisor', '+91-9876543229');

-- Insert sample advisors
INSERT INTO public.advisors (user_id, registration_number, registration_type, years_of_experience, languages, about_me, is_verified)
VALUES
  -- SEBI Analysts
  ('11111111-1111-1111-1111-111111111111', 'INH000001111', 'SEBI', 12, ARRAY['English', 'Hindi', 'Gujarati'], 'Experienced SEBI registered analyst specializing in equity research and portfolio management.', true),
  ('22222222-2222-2222-2222-222222222222', 'INH000002222', 'SEBI', 8, ARRAY['English', 'Hindi', 'Marathi'], 'Expert in technical analysis with focus on derivatives trading strategies.', true),
  ('33333333-3333-3333-3333-333333333333', 'INH000003333', 'SEBI', 15, ARRAY['English', 'Hindi', 'Telugu'], 'Senior analyst with expertise in fundamental analysis and value investing.', true),
  ('44444444-4444-4444-4444-444444444444', 'INH000004444', 'SEBI', 6, ARRAY['English', 'Telugu', 'Tamil'], 'Specializing in small-cap and mid-cap stock analysis.', true),
  ('55555555-5555-5555-5555-555555555555', 'INH000005555', 'SEBI', 10, ARRAY['English', 'Hindi', 'Punjabi'], 'Focus on long-term wealth creation through diversified portfolio management.', true),
  ('66666666-6666-6666-6666-666666666666', 'INH000006666', 'SEBI', 7, ARRAY['English', 'Hindi', 'Bengali'], 'Expert in sector analysis and thematic investing strategies.', true),
  ('77777777-7777-7777-7777-777777777777', 'INH000007777', 'SEBI', 13, ARRAY['English', 'Tamil', 'Malayalam'], 'Specialized in risk management and portfolio optimization.', true),
  ('88888888-8888-8888-8888-888888888888', 'INH000008888', 'SEBI', 9, ARRAY['English', 'Gujarati', 'Hindi'], 'Focus on dividend investing and income generation strategies.', true),
  ('99999999-9999-9999-9999-999999999999', 'INH000009999', 'SEBI', 11, ARRAY['English', 'Hindi', 'Kannada'], 'Expert in global markets and international investing.', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'INH000010000', 'SEBI', 5, ARRAY['English', 'Hindi', 'Marathi'], 'Specializing in ESG investing and sustainable portfolio strategies.', true),
  
  -- MFD Distributors
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ARN-11111', 'MFD', 8, ARRAY['English', 'Hindi', 'Gujarati'], 'Experienced mutual fund distributor focusing on goal-based investing.', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ARN-22222', 'MFD', 5, ARRAY['English', 'Marathi', 'Hindi'], 'Specializing in retirement planning and SIP strategies.', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ARN-33333', 'MFD', 12, ARRAY['English', 'Tamil', 'Telugu'], 'Expert in tax-saving mutual fund schemes and financial planning.', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ARN-44444', 'MFD', 6, ARRAY['English', 'Hindi', 'Bengali'], 'Focus on child education planning and wealth creation.', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ARN-55555', 'MFD', 9, ARRAY['English', 'Hindi', 'Punjabi'], 'Specialized in debt fund portfolios and fixed income strategies.', true),
  ('11111111-2222-3333-4444-555555555555', 'ARN-66666', 'MFD', 7, ARRAY['English', 'Telugu', 'Hindi'], 'Expert in hybrid funds and balanced investment approaches.', true),
  ('22222222-3333-4444-5555-666666666666', 'ARN-77777', 'MFD', 10, ARRAY['English', 'Kannada', 'Hindi'], 'Focus on international funds and global diversification.', true),
  ('33333333-4444-5555-6666-777777777777', 'ARN-88888', 'MFD', 4, ARRAY['English', 'Malayalam', 'Tamil'], 'Specializing in sector funds and thematic investing.', true),
  ('44444444-5555-6666-7777-888888888888', 'ARN-99999', 'MFD', 11, ARRAY['English', 'Hindi', 'Gujarati'], 'Expert in liquid funds and short-term investment strategies.', true),
  ('55555555-6666-7777-8888-999999999999', 'ARN-10000', 'MFD', 6, ARRAY['English', 'Hindi', 'Marathi'], 'Focus on small-cap and mid-cap fund selection.', true);