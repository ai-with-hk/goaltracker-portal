import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('audit_logs').select('*, changed_by_user:profiles!audit_logs_changed_by_fkey(full_name)').order('created_at', { ascending: false }).limit(100);
    setLogs(data || []); setLoading(false);
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  const formatValue = (val) => {
    if (!val) return '\u2014';
    if (typeof val === 'object') {
      return Object.entries(val).map(([k, v]) => {
        const keyName = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${keyName}: ${v}`;
      }).join(', ');
    }
    return val;
  };

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Shield size={20} style={{ display: 'inline', marginRight: 8 }} />Audit Trail</h2><p>All changes made after goal lock are logged here</p></div>
      {logs.length === 0 ? <div className="empty-state"><Shield size={40}/><h4>No audit logs yet</h4><p>Changes to locked goals will appear here</p></div> :
        <div className="table-container"><table><thead><tr><th>Timestamp</th><th>User</th><th>Entity</th><th>Action</th><th>Old Values</th><th>New Values</th></tr></thead><tbody>
          {logs.map(l => (<tr key={l.id}><td className="text-sm">{new Date(l.created_at).toLocaleString()}</td><td className="font-bold text-sm">{l.changed_by_user?.full_name || 'System'}</td><td className="text-sm">{l.entity_type}</td><td><span className={`badge badge-${l.action === 'approve' ? 'approved' : 'submitted'}`}>{l.action}</span></td><td className="text-sm">{formatValue(l.old_values)}</td><td className="text-sm">{formatValue(l.new_values)}</td></tr>))}
        </tbody></table></div>}
    </div>
  );
}
