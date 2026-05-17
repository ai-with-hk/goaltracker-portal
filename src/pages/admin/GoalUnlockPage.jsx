import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../lib/auditLogger';
import { useAuth } from '../../contexts/AuthContext';
import { Unlock } from 'lucide-react';

export default function GoalUnlockPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [sheets, setSheets] = useState([]);
  const [reason, setReason] = useState('');
  const [unlocking, setUnlocking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('goal_sheets').select('*, employee:profiles!goal_sheets_employee_id_fkey(full_name, email)').in('status', ['approved', 'locked']).order('approved_at', { ascending: false });
    setSheets(data || []); setLoading(false);
  }

  async function unlockSheet(sheetId) {
    if (!reason.trim()) { toast.error('Reason required'); return; }
    await logAudit('goal_sheet', sheetId, 'unlock', profile.id, { status: 'locked' }, { status: 'draft', reason });
    await supabase.from('goal_sheets').update({ status: 'draft' }).eq('id', sheetId);
    toast.success('Goal sheet unlocked!'); setUnlocking(null); setReason(''); load();
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Unlock size={20} style={{ display: 'inline', marginRight: 8 }} />Goal Sheet Unlock</h2><p>Unlock approved/locked goal sheets for editing (with audit trail)</p></div>
      <div className="table-container"><table><thead><tr><th>Employee</th><th>Email</th><th>Status</th><th>Approved At</th><th>Action</th></tr></thead><tbody>
        {sheets.map(s => (<tr key={s.id}><td className="font-bold">{s.employee?.full_name}</td><td className="text-sm text-muted">{s.employee?.email}</td><td><span className={`badge badge-${s.status}`}>{s.status}</span></td><td className="text-sm">{s.approved_at ? new Date(s.approved_at).toLocaleDateString() : '\u2014'}</td><td>
          {unlocking === s.id ? <div className="flex gap-2"><input className="form-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason..." style={{width:200}}/><button className="btn btn-danger btn-sm" onClick={() => unlockSheet(s.id)}>Confirm</button><button className="btn btn-ghost btn-sm" onClick={() => setUnlocking(null)}>Cancel</button></div> : <button className="btn btn-secondary btn-sm" onClick={() => setUnlocking(s.id)}><Unlock size={14}/> Unlock</button>}
        </td></tr>))}</tbody></table></div>
    </div>
  );
}
