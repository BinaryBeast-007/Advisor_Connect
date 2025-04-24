/*
  # Create advisor profiles view

  1. Changes
    - Create a view that joins advisors and users tables
    - Include all relevant fields from both tables
    - Expose only necessary user information (excluding sensitive data)

  2. View Structure
    - All advisor fields
    - User fields: id, full_name, email, phone
    - Excludes sensitive user data like password_hash
*/

-- Create the view with a security barrier to prevent information leakage
CREATE VIEW advisor_profiles WITH (security_barrier) AS
SELECT 
  a.id,
  a.registration_number,
  a.registration_type,
  a.years_of_experience,
  a.languages,
  a.about_me,
  a.profile_picture_url,
  a.profile_picture_hash,
  a.is_verified,
  a.created_at,
  a.updated_at,
  u.id as user_id,
  u.full_name,
  u.email,
  u.phone
FROM advisors a
JOIN users u ON a.user_id = u.id
WHERE a.is_verified = true;

-- Grant appropriate permissions
GRANT SELECT ON advisor_profiles TO authenticated, anon;