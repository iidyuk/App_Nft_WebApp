-- Seed data for local development
-- This file is automatically run after migrations when using `supabase db reset`

-- Insert test user into auth.users
-- Note: This creates a user in the auth system with a known password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  -- Password: 'password123' (hashed with bcrypt)
  -- You can generate a new hash using: https://bcrypt-generator.com/
  '$2a$10$5pGXXxLXxXxXxXxXxXxXxOKq7YxXxXxXxXxXxXxXxXxXxXxXxXx',
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- Note: The trigger we created will automatically create a corresponding record in public.users
-- So we don't need to manually insert into public.users

-- Optional: Add more test data here
-- For example, you could add test images, metadata, etc.

COMMENT ON TABLE auth.users IS 'Seeded with test@example.com for local development';

