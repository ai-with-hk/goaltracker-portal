import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { Calendar, Plus, Edit2 } from 'lucide-react';

export default function CycleManagementPage() {
  const toast = useToast();
  const [cycles, setCycles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', goal_setting_open: '', goal_setting_close: '', q1_open: '', q1_close: '', q2_open: '', q2_close: '', q3_open: '', q3_close: '', q4_open: '', q4_close: '', is_active: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('goal_cycles').select('*').order('created_at', { ascending: false });
    setCycles(data || []); setLoading(false);
  }

  async function saveCycle() {
    if (!form.name) { toast.error('Name required'); return; }
    const { error } = await supabase.from('goal_cycles').insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success('Cycle created!'); setShowForm(false); load();
  }

  async function toggleActive(id, current) {
    if (!current) await supabase.from('goal_cycles').update({ is_active: false }).neq('id', id);
    await supabase.from('goal_cycles').update({ is_active: !current }).eq('id', id);
    toast.success('Cycle updated'); load();
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Calendar size={20} style={{ display: 'inline', marginRight: 8 }} />Cycle Management</h2><p>Configure performance review cycles</p>
        <div className="page-header-actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> New Cycle</button></div></div>
      <div className="card-grid card-grid-2">
        {cycles.map(c => (<div key={c.id} className="card">
          <div className="flex justify-between items-center mb-2"><h3 style={{ fontSize: 15 }}>{c.name}</h3><span className={`badge ${c.is_active ? 'badge-approved' : 'badge-draft'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></div>
          <div className="text-sm text-muted">{new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}</div>
          <button className="btn btn-sm btn-secondary mt-2" onClick={() => toggleActive(c.id, c.is_active)}>{c.is_active ? 'Deactivate' : 'Set Active'}</button>
        </div>))}
      </div>
      {showForm && (<div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Create Goal Cycle</h3></div>
        <div className="form-group"><label className="form-label">Cycle Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., FY 2025-26" /></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div><div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Goal Setting Opens</label><input className="form-input" type="date" value={form.goal_setting_open} onChange={e => setForm({...form, goal_setting_open: e.target.value})} /></div><div className="form-group"><label className="form-label">Goal Setting Closes</label><input className="form-input" type="date" value={form.goal_setting_close} onChange={e => setForm({...form, goal_setting_close: e.target.value})} /></div></div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={saveCycle}>Create</button></div>
      </div></div>)}
    </div>
  );
}
