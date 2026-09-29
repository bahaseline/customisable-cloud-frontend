CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (created/updated on every OAuth2 login)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  name VARCHAR,
  picture VARCHAR,           -- Google profile photo URL
  access_token TEXT,        -- encrypted
  refresh_token TEXT,       -- encrypted
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS picture VARCHAR;

-- Custom file lists
CREATE TABLE IF NOT EXISTS custom_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Files added to a list (Drive file ID only — no file content)
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  drive_file_id VARCHAR NOT NULL,   -- Google Drive file ID
  file_name VARCHAR,                -- cached display name
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW()
);

-- Shared list members (RBAC)
CREATE TABLE IF NOT EXISTS list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL DEFAULT 'viewer',   -- 'editor' | 'viewer' (owner lives on custom_lists.owner_id)
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (list_id, user_id)
);

ALTER TABLE list_members ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT NOW();

-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, so guard it for pre-existing databases.
DO $$
BEGIN
  ALTER TABLE list_members ADD CONSTRAINT list_members_list_id_user_id_key UNIQUE (list_id, user_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Tags (for categorizing list items)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  color VARCHAR NOT NULL DEFAULT '#1a73e8',
  visibility VARCHAR NOT NULL DEFAULT 'private',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT tags_visibility_check CHECK (visibility IN ('private', 'shared')),
  UNIQUE (owner_id, name)
);

-- Many-to-many: a list item can have several tags, a tag can apply to several items
CREATE TABLE IF NOT EXISTS list_item_tags (
  list_item_id UUID REFERENCES list_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (list_item_id, tag_id)
);

-- Track how many times a user has opened a file, for "most opened first" sorting.
CREATE TABLE IF NOT EXISTS file_opens (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drive_file_id VARCHAR NOT NULL,
  file_name VARCHAR,
  open_count INTEGER NOT NULL DEFAULT 1,
  last_opened_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, drive_file_id)
);

-- Refresh tokens: one row per signed-in device/browser. Only a SHA-256 hash
-- of the token is stored, never the token itself
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_custom_lists_owner_id ON custom_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_list_members_user_id ON list_members(user_id);
CREATE INDEX IF NOT EXISTS idx_list_item_tags_tag_id ON list_item_tags(tag_id);
-- Serves the "most opened first" lookup without scanning every row.
CREATE INDEX IF NOT EXISTS idx_file_opens_user_count ON file_opens(user_id, open_count DESC);
-- The UNIQUE constraint above already indexes token_hash; this serves lookups
-- and revocation by user instead (e.g. revoking every session on an account).
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
