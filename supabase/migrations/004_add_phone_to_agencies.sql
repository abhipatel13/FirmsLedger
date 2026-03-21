-- Add phone column to agencies table
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS phone TEXT;
