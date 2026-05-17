import { supabase } from './supabase';

export async function logAudit(entityType, entityId, action, changedBy, oldValues, newValues) {
  try {
    await supabase.from('audit_logs').insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      changed_by: changedBy,
      old_values: oldValues,
      new_values: newValues,
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
