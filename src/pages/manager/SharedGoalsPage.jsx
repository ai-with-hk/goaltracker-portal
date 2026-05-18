import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { Share2, Plus, Send, Users } from 'lucide-react';
import { UOM_LABELS } from '../../lib/goalCalculations';

export default function SharedGoalsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', uom_type: 'numeric_min', target_value: '', weightage: 15 });
  const [selectedEmps, setSelectedEmps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) load(); }, [profile]);

  async function load() {
    const { data: emps } = await supabase.from('profiles').select('id, full_name, email').eq('manager_id', profile.id);
    setEmployees(emps || []);
    const { data } = await supabase.from('goals').select('*, goal_sheet:goal_sheets!inner(employee_id, employee:profiles!goal_sheets_employee_id_fkey(full_name))').eq('is_shared', true);
    setGoals(data || []); setLoading(false);
  }

  async function pushSharedGoal() {
    if (!form.title || selectedEmps.length === 0) { toast.error('Title and at least one employee required'); return; }
    for (const empId of selectedEmps) {
      let { data: sheet } = await supabase.from('goal_sheets').select('id').eq('employee_id', empId).in('status', ['draft', 'returned']).limit(1).single();
      if (!sheet) { const { data: newSheet } = await supabase.from('goal_sheets').insert({ employee_id: empId, status: 'draft' }).select().single(); sheet = newSheet; }
      if (sheet) { await supabase.from('goals').insert({ goal_sheet_id: sheet.id, title: form.title, description: form.description, uom_type: form.uom_type, target_value: form.target_value ? Number(form.target_value) : null, weightage: form.weightage, is_shared: true }); }
    }
    toast.success('Shared goal pushed to team!'); setShowForm(false); load();
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Share2 size={20} style={{ display: 'inline', marginRight: 8 }} />Shared Goals</h2><p>Push common goals to your team members</p>
        <div className="page-header-actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Create Shared Goal</button></div></div>
      {goals.length === 0 ? <div className="empty-state"><Share2 size={40} /><h4>No shared goals yet</h4></div> :
        <div className="table-container"><table><thead><tr><th>Goal</th><th>Employee</th><th>UoM</th><th>Weight</th></tr></thead><tbody>
          {goals.map(g => (<tr key={g.id}><td className="font-bold">{g.title}</td><td className="text-sm">{g.goal_sheet?.employee?.full_name}</td><td className="text-sm">{UOM_LABELS[g.uom_type]}</td><td>{g.weightage}%</td></tr>))}
        </tbody></table></div>}
      {showForm && (<div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Push Shared Goal</h3></div>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row"><div className="form-group"><label className="form-label">UoM</label><select className="form-select" value={form.uom_type} onChange={e => setForm({ ...form, uom_type: e.target.value })}>{Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Weightage</label><input className="form-input" type="number" value={form.weightage} onChange={e => setForm({ ...form, weightage: Number(e.target.value) })} /></div></div>
        <div className="form-group"><label className="form-label">Select Employees</label>{employees.map(emp => (<div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}><input type="checkbox" id={`emp-${emp.id}`} checked={selectedEmps.includes(emp.id)} onChange={() => setSelectedEmps(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id])} style={{ cursor: 'pointer' }} /><label htmlFor={`emp-${emp.id}`} style={{ cursor: 'pointer', margin: 0 }}>{emp.full_name}</label></div>))}</div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={pushSharedGoal}><Send size={16} /> Push to Team</button></div>
      </div></div>)}
    </div>
  );
}
