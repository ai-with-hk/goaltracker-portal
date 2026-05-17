import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Plus } from 'lucide-react';

export default function EscalationPage() {
  const toast = useToast();
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('rules');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', condition_type: 'goal_not_submitted', days_threshold: 7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from('escalation_rules').select('*').order('created_at', { ascending: false }),
      supabase.from('escalation_logs').select('*, rule:escalation_rules(name), employee:profiles!escalation_logs_employee_id_fkey(full_name)').order('created_at', { ascending: false }).limit(50),
    ]);
    setRules(r || []); setLogs(l || []); setLoading(false);
  }

  async function createRule() {
    if (!form.name) { toast.error('Name required'); return; }
    await supabase.from('escalation_rules').insert(form);
    toast.success('Rule created!'); setShowForm(false); load();
  }

  async function toggleRule(id, active) {
    await supabase.from('escalation_rules').update({ is_active: !active }).eq('id', id);
    toast.success(active ? 'Rule deactivated' : 'Rule activated'); load();
  }

  const condLabels = { goal_not_submitted: 'Goal Not Submitted', goal_not_approved: 'Goal Not Approved', checkin_not_completed: 'Check-in Not Completed' };

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><AlertTriangle size={20} style={{ display: 'inline', marginRight: 8 }} />Escalation Management</h2><p>Configure automated escalation rules and view logs</p>
        <div className="page-header-actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16}/> New Rule</button></div></div>
      <div className="tabs"><button className={`tab ${tab==='rules'?'active':''}`} onClick={()=>setTab('rules')}>Rules ({rules.length})</button><button className={`tab ${tab==='logs'?'active':''}`} onClick={()=>setTab('logs')}>Log ({logs.length})</button></div>
      {tab === 'rules' && <div className="table-container"><table><thead><tr><th>Rule</th><th>Condition</th><th>Threshold</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {rules.map(r => (<tr key={r.id}><td className="font-bold">{r.name}</td><td className="text-sm">{condLabels[r.condition_type]}</td><td>{r.days_threshold} days</td><td><span className={`badge ${r.is_active?'badge-approved':'badge-draft'}`}>{r.is_active?'Active':'Inactive'}</span></td><td><button className="btn btn-sm btn-secondary" onClick={()=>toggleRule(r.id,r.is_active)}>{r.is_active?'Disable':'Enable'}</button></td></tr>))}
      </tbody></table></div>}
      {tab === 'logs' && <div className="table-container"><table><thead><tr><th>Date</th><th>Employee</th><th>Rule</th><th>Level</th><th>Status</th></tr></thead><tbody>
        {logs.length===0 ? <tr><td colSpan={5} className="text-muted text-sm" style={{textAlign:'center',padding:32}}>No escalation logs</td></tr> :
          logs.map(l => (<tr key={l.id}><td className="text-sm">{new Date(l.created_at).toLocaleDateString()}</td><td className="font-bold">{l.employee?.full_name||'\u2014'}</td><td className="text-sm">{l.rule?.name||'\u2014'}</td><td>Level {l.escalation_level}</td><td><span className={`badge badge-${l.status==='resolved'?'approved':'submitted'}`}>{l.status}</span></td></tr>))}
      </tbody></table></div>}
      {showForm && <div className="modal-overlay" onClick={()=>setShowForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Create Escalation Rule</h3></div>
        <div className="form-group"><label className="form-label">Rule Name</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div className="form-group"><label className="form-label">Condition</label><select className="form-select" value={form.condition_type} onChange={e=>setForm({...form,condition_type:e.target.value})}>{Object.entries(condLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Days Threshold</label><input className="form-input" type="number" value={form.days_threshold} onChange={e=>setForm({...form,days_threshold:Number(e.target.value)})}/></div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createRule}>Create</button></div>
      </div></div>}
    </div>
  );
}
