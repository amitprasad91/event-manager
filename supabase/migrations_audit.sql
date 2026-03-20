-- ═══════════════════════════════════════════════════════════
-- AUDIT LOG TABLE
-- Tracks financial actions: payments collected, trips paid,
-- profit splits paid, payment reversions
-- Safe to run — CREATE TABLE IF NOT EXISTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action      text NOT NULL,  -- 'payment_collected', 'trip_paid', 'trip_reverted', 'split_paid'
  entity_type text NOT NULL,  -- 'event', 'transport_trip', 'profit_split'
  entity_id   uuid NOT NULL,
  amount      numeric(10,2),
  notes       text,
  done_by     uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all" ON audit_log FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON audit_log(created_at DESC);

-- Verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'audit_log';
