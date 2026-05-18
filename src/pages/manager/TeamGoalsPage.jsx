import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../lib/auditLogger';
import { Users, Check, X, Eye } from 'lucide-react';

export default function TeamGoalsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [sheets, setSheets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) load(); }, [profile]);

  async function load() {
    const { data } = await supabase.from('goal_sheets').select('*, employee:profiles!goal_sheets_employee_id_fkey(full_name, email, department:departments(name)), goals(*, thrust_area:thrust_areas(name))').order('created_at', { ascending: false });
    setSheets(data || []); setLoading(false);
  }

  async function handleAction(sheetId, action) {
    const status = action === 'approve' ? 'approved' : 'returned';
    const update = { status, feedback: action === 'return' ? feedback : null, reviewed_by: profile.id };
    if (action === 'approve') update.approved_at = new Date().toISOString();
    await supabase.from('goal_sheets').update(update).eq('id', sheetId);
    await logAudit('goal_sheet', sheetId, action, profile.id, { status: 'submitted' }, update);
    toast.success(action === 'approve' ? 'Goal sheet approved!' : 'Goal sheet returned for revision');
    setSelected(null); setFeedback(''); load();
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Users size={20} style={{ display: 'inline', marginRight: 8 }} />Team Goals</h2><p>Review and approve your team's goal sheets</p></div>
      <div className="table-container">
        <table><thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Goals</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>{sheets.map(s => (<tr key={s.id}><td className="font-bold">{s.employee?.full_name}</td><td className="text-sm text-muted">{s.employee?.department?.name || '-'}</td><td><span className={`badge badge-${s.status}`}>{s.status}</span></td><td>{s.goals?.length || 0}</td><td className="text-sm">{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '-'}</td><td className="flex gap-2">
            <button className="btn btn-sm btn-secondary" onClick={() => setSelected(s)}><Eye size={14} /> View</button>
            {s.status === 'submitted' && <><button className="btn btn-sm btn-success" title="Approve" onClick={() => handleAction(s.id, 'approve')}><Check size={14} /></button><button className="btn btn-sm btn-danger" title="Return" onClick={() => { setSelected(s); }}><X size={14} /></button></>}
            {(s.status === 'draft' || s.status === 'returned') && <button className="btn btn-sm" style={{ background: 'var(--yellow-bg)', color: 'var(--yellow)', borderColor: 'var(--yellow)' }} onClick={() => toast.success(`Nudge sent to ${s.employee?.full_name} via Email/Teams!`)}>🔔 Nudge</button>}
          </td></tr>))}</tbody></table>
      </div>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
          <div className="modal-header"><h3>{selected.employee?.full_name}'s Goals</h3></div>
          {selected.goals?.map(g => (<div key={g.id} className="card mb-2" style={{ padding: 12 }}><div className="flex justify-between items-center"><strong>{g.title}</strong><span className="badge badge-on_track">{g.weightage}%</span></div><div className="text-sm text-muted">{g.thrust_area?.name || 'No thrust area'} | Target: {g.target_value || g.target_date || 'N/A'}</div>{g.description && <div className="text-sm mt-2">{g.description}</div>}</div>))}
          {selected.status === 'submitted' && <><div className="form-group mt-4"><label className="form-label">Feedback (required for return)</label><textarea className="form-textarea" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide feedback..." /></div>
          <div className="modal-footer"><button className="btn btn-danger" onClick={() => handleAction(selected.id, 'return')} disabled={!feedback.trim()}>Return for Revision</button><button className="btn btn-primary" onClick={() => handleAction(selected.id, 'approve')}>Approve</button></div></>}
        </div></div>
      )}
    </div>
  );
}
