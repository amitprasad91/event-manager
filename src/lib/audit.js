// ─────────────────────────────────────────────
// Audit log helper — call after financial actions
// ─────────────────────────────────────────────
import { supabase } from './supabase'

export async function logAudit({ action, entityType, entityId, amount, notes, doneBy }) {
  try {
    await supabase.from('audit_log').insert({
      action,
      entity_type: entityType,
      entity_id:   entityId,
      amount:      amount || null,
      notes:       notes  || null,
      done_by:     doneBy || null,
    })
  } catch {
    // Audit log failure should never break the main flow
    console.warn('Audit log failed silently')
  }
}
