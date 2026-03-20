-- ═══════════════════════════════════════════════════════════
-- PERFORMANCE INDEXES
-- Safe to run — CREATE INDEX IF NOT EXISTS
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_events_status       ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date         ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_client       ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_event_items_event   ON event_items(event_id);
CREATE INDEX IF NOT EXISTS idx_event_items_status  ON event_items(payment_status);
CREATE INDEX IF NOT EXISTS idx_transport_event     ON transport_trips(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_status    ON transport_trips(payment_status);
CREATE INDEX IF NOT EXISTS idx_transport_driver    ON transport_trips(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_machines_status     ON machines(status);
CREATE INDEX IF NOT EXISTS idx_machines_godown     ON machines(godown);
CREATE INDEX IF NOT EXISTS idx_profit_event        ON profit_splits(event_id);
CREATE INDEX IF NOT EXISTS idx_profit_owner        ON profit_splits(co_owner_id);

-- Verify indexes created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
