import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { Users, Plus } from 'lucide-react';

export default function UserManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [thrustAreas, setThrustAreas] = useState([]);
  const [tab, setTab] = useState('users');
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showTAForm, setShowTAForm] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [taForm, setTaForm] = useState({ name: '', description: '', department_id: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: u }, { data: d }, { data: ta }] = await Promise.all([
      supabase.from('profiles').select('*, department:departments(name)'),
      supabase.from('departments').select('*'),
      supabase.from('thrust_areas').select('*, department:departments(name)'),
    ]);
    setUsers(u || []); setDepartments(d || []); setThrustAreas(ta || []); setLoading(false);
  }

  async function createDept() {
    if (!deptName.trim()) return;
    const { error } = await supabase.from('departments').insert({ name: deptName });
    if (error) { toast.error(error.message); return; }
    toast.success('Department created!'); setDeptName(''); setShowDeptForm(false); load();
  }

  async function createTA() {
    if (!taForm.name.trim()) return;
    await supabase.from('thrust_areas').insert({ name: taForm.name, description: taForm.description, department_id: taForm.department_id || null });
    toast.success('Thrust area created!'); setTaForm({ name: '', description: '', department_id: '' }); setShowTAForm(false); load();
  }

  async function updateUserRole(userId, role) { await supabase.from('profiles').update({ role }).eq('id', userId); toast.success('Role updated!'); load(); }
  async function updateUserDept(userId, deptId) { await supabase.from('profiles').update({ department_id: deptId || null }).eq('id', userId); toast.success('Department updated!'); load(); }

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  async function updateUserManager(userId, managerId) { await supabase.from('profiles').update({ manager_id: managerId || null }).eq('id', userId); toast.success('Manager updated!'); load(); }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Users size={20} style={{ display: 'inline', marginRight: 8 }} />User & Org Management</h2></div>
      <div className="tabs"><button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users ({users.length})</button><button className={`tab ${tab === 'departments' ? 'active' : ''}`} onClick={() => setTab('departments')}>Departments ({departments.length})</button><button className={`tab ${tab === 'thrust' ? 'active' : ''}`} onClick={() => setTab('thrust')}>Thrust Areas ({thrustAreas.length})</button></div>
      {tab === 'users' && <div className="table-container"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Manager</th></tr></thead><tbody>
        {users.map(u => (<tr key={u.id}><td className="font-bold">{u.full_name}</td><td className="text-sm text-muted">{u.email}</td>
          <td><select className="form-select" value={u.role} onChange={e => updateUserRole(u.id, e.target.value)} style={{width:120}}><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></td>
          <td><select className="form-select" value={u.department_id||''} onChange={e => updateUserDept(u.id, e.target.value)} style={{width:140}}><option value="">None</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></td>
          <td><select className="form-select" value={u.manager_id||''} onChange={e => updateUserManager(u.id, e.target.value)} style={{width:160}}><option value="">None</option>{managers.filter(m=>m.id!==u.id).map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}</select></td>
        </tr>))}</tbody></table></div>}
      {tab === 'departments' && <><button className="btn btn-primary mb-4" onClick={() => setShowDeptForm(true)}><Plus size={16}/> Add Department</button><div className="card-grid card-grid-3">{departments.map(d => <div key={d.id} className="card"><h3 style={{fontSize:15}}>{d.name}</h3><div className="text-sm text-muted">{users.filter(u=>u.department_id===d.id).length} members</div></div>)}</div>{showDeptForm && <div className="modal-overlay" onClick={()=>setShowDeptForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Add Department</h3></div><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={deptName} onChange={e=>setDeptName(e.target.value)}/></div><div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowDeptForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createDept}>Create</button></div></div></div>}</>}
      {tab === 'thrust' && <><button className="btn btn-primary mb-4" onClick={() => setShowTAForm(true)}><Plus size={16}/> Add Thrust Area</button><div className="table-container"><table><thead><tr><th>Name</th><th>Description</th><th>Department</th></tr></thead><tbody>{thrustAreas.map(ta => <tr key={ta.id}><td className="font-bold">{ta.name}</td><td className="text-sm">{ta.description||'\u2014'}</td><td className="text-sm">{ta.department?.name||'Org-wide'}</td></tr>)}</tbody></table></div>{showTAForm && <div className="modal-overlay" onClick={()=>setShowTAForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Add Thrust Area</h3></div><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={taForm.name} onChange={e=>setTaForm({...taForm,name:e.target.value})}/></div><div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={taForm.description} onChange={e=>setTaForm({...taForm,description:e.target.value})}/></div><div className="form-group"><label className="form-label">Department</label><select className="form-select" value={taForm.department_id} onChange={e=>setTaForm({...taForm,department_id:e.target.value})}><option value="">Org-wide</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div><div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowTAForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createTA}>Create</button></div></div></div>}</>}
    </div>
  );
}
