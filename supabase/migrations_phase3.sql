-- ═══════════════════════════════════════════════════════════
-- PHASE 3 MIGRATIONS — Run in Supabase SQL Editor
-- Safe — only ADDs new columns, does NOT drop or modify existing
-- ═══════════════════════════════════════════════════════════

-- Issue #8: Add quantity to machines
ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;

-- Issue #9: Transport — add staff_profile_id, is_round_trip
ALTER TABLE transport_trips
  ADD COLUMN IF NOT EXISTS staff_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS is_round_trip boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS trip_type text DEFAULT 'commercial' 
    CHECK (trip_type IN ('commercial','bike','private_bike','other'));

-- Issue #11/12/13: Transport payment tracking
ALTER TABLE transport_trips
  ADD COLUMN IF NOT EXISTS paid_by_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_note text,
  ADD COLUMN IF NOT EXISTS reverted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS revert_reason text,
  ADD COLUMN IF NOT EXISTS reverted_by_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS reverted_at timestamptz;

-- Issue #14: Payment collection tracking
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS collected_by_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS collection_method text 
    CHECK (collection_method IN ('cash','online','cheque')),
  ADD COLUMN IF NOT EXISTS handed_to_profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS handed_at timestamptz;

-- Verify new columns
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('machines','transport_trips','events')
  AND column_name IN ('quantity','staff_profile_id','is_round_trip','trip_type',
                      'paid_by_profile_id','paid_at','collected_by_profile_id',
                      'collection_method','handed_to_profile_id','reverted')
ORDER BY table_name, column_name;
