-- ═══════════════════════════════════════════════════════════
-- PHASE 3 PART 2 — Missing columns
-- Run this in Supabase SQL Editor
-- Safe — only ADDs, does NOT delete anything
-- ═══════════════════════════════════════════════════════════

-- Transport revert tracking
ALTER TABLE transport_trips
  ADD COLUMN IF NOT EXISTS revert_reason text,
  ADD COLUMN IF NOT EXISTS reverted_by_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS reverted_at timestamptz;

-- Events payment collection timestamps
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS handed_at timestamptz;

-- Verify all phase 3 columns exist
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('events', 'transport_trips', 'machines')
  AND column_name IN (
    'quantity', 'is_round_trip', 'trip_type', 'staff_profile_id',
    'paid_by_profile_id', 'paid_at', 'reverted', 'revert_reason',
    'reverted_by_profile_id', 'reverted_at',
    'collected_by_profile_id', 'collection_method', 'collected_at',
    'handed_to_profile_id', 'handed_at'
  )
ORDER BY table_name, column_name;
