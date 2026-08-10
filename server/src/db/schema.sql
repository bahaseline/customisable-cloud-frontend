CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (created/updated on every OAuth2 login)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  name VARCHAR,
  access_token TEXT,        -- encrypted
  refresh_token TEXT,       -- encrypted
  created_at TIMESTAMP DEFAULT NOW()
);

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

-- Tags (Gmail-label style) — owned per user and private to that user even on
-- shared lists. Other members never see someone else's labels.
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  color VARCHAR NOT NULL DEFAULT '#1a73e8',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (owner_id, name)
);

ALTER TABLE tags ADD COLUMN IF NOT EXISTS color VARCHAR NOT NULL DEFAULT '#1a73e8';

-- Many-to-many: a list item can have several tags, a tag can apply to several items
CREATE TABLE IF NOT EXISTS list_item_tags (
  list_item_id UUID REFERENCES list_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (list_item_id, tag_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_custom_lists_owner_id ON custom_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_list_members_user_id ON list_members(user_id);
CREATE INDEX IF NOT EXISTS idx_list_item_tags_tag_id ON list_item_tags(tag_id);
