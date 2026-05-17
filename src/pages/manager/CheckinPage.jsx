import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { ClipboardCheck, Send } from 'lucide-react';

export default function CheckinPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [sheets, setSheets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) load(); }, [profile]);

  async function load() {
    const { data } = await supabase.from('goal_sheets').select('*, employee:profiles!goal_sheets_employee_id_fkey(full_name), goals(*, quarterly_achievements(*))').in('status', ['approved', 'locked']).order('created_at', { ascending: false });
    setSheets(data || []); setLoading(false);
  }

  async function loadComments(sheetId) {
    const { data } = await supabase.from('checkin_comments').select('*, author:profiles!checkin_comments_author_id_fkey(full_name)').eq('goal_sheet_id', sheetId).order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function postComment() {
    if (!comment.trim() || !selected) return;
    await supabase.from('checkin_comments').insert({ goal_sheet_id: selected.id, author_id: profile.id, comment });
    toast.success('Comment posted!'); setComment(''); loadComments(selected.id);
  }

  function selectSheet(s) { setSelected(s); loadComments(s.id); }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><ClipboardCheck size={20} style={{ display: 'inline', marginRight: 8 }} />Check-ins</h2><p>Provide periodic feedback on goal progress</p></div>
      <div className="card-grid card-grid-2">
        <div>
          {sheets.map(s => (<div key={s.id} className="card mb-2" style={{ cursor: 'pointer', borderColor: selected?.id === s.id ? 'var(--accent)' : undefined }} onClick={() => selectSheet(s)}><div className="flex justify-between items-center"><strong>{s.employee?.full_name}</strong><span className={`badge badge-${s.status}`}>{s.status}</span></div><div className="text-sm text-muted">{s.goals?.length || 0} goals</div></div>))}
        </div>
        <div>
          {selected ? (<div className="card">
            <div className="card-header"><h3>Check-in: {selected.employee?.full_name}</h3></div>
            {selected.goals?.map(g => { const qas = g.quarterly_achievements || []; const latest = qas[qas.length - 1]; return (<div key={g.id} className="mb-2" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}><div className="font-bold text-sm">{g.title} ({g.weightage}%)</div>{latest && <div className="text-sm">Latest: {latest.actual_value || latest.actual_date} — <span style={{ color: latest.progress_score >= 80 ? 'var(--green)' : 'var(--yellow)' }}>{latest.progress_score?.toFixed(0)}%</span></div>}</div>); })}
            <div className="mt-4"><h4 className="text-sm font-bold mb-2">Comments</h4>{comments.map(c => (<div key={c.id} className="mb-2" style={{ padding: 8, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}><div className="text-sm font-bold">{c.author?.full_name}</div><div className="text-sm">{c.comment}</div><div className="text-sm text-muted">{new Date(c.created_at).toLocaleString()}</div></div>))}</div>
            <div className="flex gap-2 mt-2"><input className="form-input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && postComment()} /><button className="btn btn-primary btn-sm" onClick={postComment}><Send size={14} /></button></div>
          </div>) : <div className="empty-state"><ClipboardCheck size={32} /><p>Select an employee to start check-in</p></div>}
        </div>
      </div>
    </div>
  );
}
