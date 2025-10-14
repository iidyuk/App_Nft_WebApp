-- Migration: Create NFT application tables
-- Created: 2024-01-01
-- Description: Initial schema for NFT application

-- UUID generation is handled by gen_random_uuid() (built-in function)

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Metadata table
CREATE TABLE IF NOT EXISTS metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  pinata_cid TEXT NOT NULL,
  pinata_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata_id UUID REFERENCES metadata(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  token_uri TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  minter_address TEXT NOT NULL,
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_metadata_image_id ON metadata(image_id);
CREATE INDEX IF NOT EXISTS idx_tokens_metadata_id ON tokens(metadata_id);
CREATE INDEX IF NOT EXISTS idx_tokens_tx_hash ON tokens(tx_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_contract_address ON tokens(contract_address);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles linked to Supabase auth';
COMMENT ON TABLE images IS 'Uploaded images stored in Supabase storage';
COMMENT ON TABLE metadata IS 'NFT metadata stored on Pinata IPFS';
COMMENT ON TABLE tokens IS 'Minted NFT tokens on blockchain';
