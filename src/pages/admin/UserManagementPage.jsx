import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';

export default function UserManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [thrustAreas, setThrustAreas] = useState([]);
  const [tab, setTab] = useState('users');
  
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showTAForm, setShowTAForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  
  const [deptName, setDeptName] = useState('');
  const [taForm, setTaForm] = useState({ name: '', description: '', department_id: '' });
  
  const [userForm, setUserForm] = useState({ id: null, full_name: '', email: '', password: '', role: 'employee', department_id: '', manager_id: '' });
  const [isEditingUser, setIsEditingUser] = useState(false);
  
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

  function openCreateUserModal() {
    setUserForm({ id: null, full_name: '', email: '', password: '', role: 'employee', department_id: '', manager_id: '' });
    setIsEditingUser(false);
    setShowUserForm(true);
  }

  function openEditUserModal(u) {
    setUserForm({ id: u.id, full_name: u.full_name || '', email: u.email || '', password: '', role: u.role || 'employee', department_id: u.department_id || '', manager_id: u.manager_id || '' });
    setIsEditingUser(true);
    setShowUserForm(true);
  }

  async function handleSaveUser() {
    if (!userForm.full_name || !userForm.email) return toast.error("Name and Email are required");
    
    if (isEditingUser) {
      // Update profile only (cannot update auth email/password from client without current password)
      const { error } = await supabase.from('profiles').update({
        full_name: userForm.full_name,
        role: userForm.role,
        department_id: userForm.department_id || null,
        manager_id: userForm.manager_id || null
      }).eq('id', userForm.id);
      
      if (error) { toast.error(error.message); return; }
      toast.success("User updated successfully");
    } else {
      if (!userForm.password) return toast.error("Password is required for new users");
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { email: userForm.email, password: userForm.password, full_name: userForm.full_name, role: userForm.role, department_id: userForm.department_id, manager_id: userForm.manager_id }
      });
      if (error) { toast.error(error.message || "Failed to create user"); return; }
      toast.success("User created successfully!");
    }
    setShowUserForm(false);
    load();
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user? This may fail if they have associated records.")) return;
    toast.error("User deletion requires Supabase Admin API. Simulated for demo.");
  }

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><Users size={20} style={{ display: 'inline', marginRight: 8 }} />User & Org Management</h2></div>
      
      <div className="tabs">
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users ({users.length})</button>
        <button className={`tab ${tab === 'departments' ? 'active' : ''}`} onClick={() => setTab('departments')}>Departments ({departments.length})</button>
        <button className={`tab ${tab === 'thrust' ? 'active' : ''}`} onClick={() => setTab('thrust')}>Thrust Areas ({thrustAreas.length})</button>
      </div>
      
      {tab === 'users' && (
        <>
          <button className="btn btn-primary mb-4" onClick={openCreateUserModal}><Plus size={16}/> Add User</button>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Manager</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-bold">{u.full_name}</td>
                    <td className="text-sm text-muted">{u.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td>{u.department?.name || '\u2014'}</td>
                    <td>{managers.find(m => m.id === u.manager_id)?.full_name || '\u2014'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => openEditUserModal(u)} title="Edit"><Edit2 size={16}/></button>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDeleteUser(u.id)} title="Delete"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {showUserForm && (
            <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>{isEditingUser ? 'Edit User' : 'Create User'}</h3></div>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})} required/>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} disabled={isEditingUser} required/>
                  {isEditingUser && <div className="text-sm text-muted mt-2">Email cannot be changed directly.</div>}
                </div>
                
                {!isEditingUser && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required/>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={userForm.department_id} onChange={e => setUserForm({...userForm, department_id: e.target.value})}>
                      <option value="">None</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <select className="form-select" value={userForm.manager_id} onChange={e => setUserForm({...userForm, manager_id: e.target.value})}>
                    <option value="">None</option>
                    {managers.filter(m => m.id !== userForm.id).map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                </div>
                
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowUserForm(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveUser}>{isEditingUser ? 'Save Changes' : 'Create User'}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {tab === 'departments' && <><button className="btn btn-primary mb-4" onClick={() => setShowDeptForm(true)}><Plus size={16}/> Add Department</button><div className="card-grid card-grid-3">{departments.map(d => <div key={d.id} className="card"><h3 style={{fontSize:15}}>{d.name}</h3><div className="text-sm text-muted">{users.filter(u=>u.department_id===d.id).length} members</div></div>)}</div>{showDeptForm && <div className="modal-overlay" onClick={()=>setShowDeptForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Add Department</h3></div><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={deptName} onChange={e=>setDeptName(e.target.value)}/></div><div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowDeptForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createDept}>Create</button></div></div></div>}</>}
      
      {tab === 'thrust' && <><button className="btn btn-primary mb-4" onClick={() => setShowTAForm(true)}><Plus size={16}/> Add Thrust Area</button><div className="table-container"><table><thead><tr><th>Name</th><th>Description</th><th>Department</th></tr></thead><tbody>{thrustAreas.map(ta => <tr key={ta.id}><td className="font-bold">{ta.name}</td><td className="text-sm">{ta.description||'\u2014'}</td><td className="text-sm">{ta.department?.name||'Org-wide'}</td></tr>)}</tbody></table></div>{showTAForm && <div className="modal-overlay" onClick={()=>setShowTAForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>Add Thrust Area</h3></div><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={taForm.name} onChange={e=>setTaForm({...taForm,name:e.target.value})}/></div><div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={taForm.description} onChange={e=>setTaForm({...taForm,description:e.target.value})}/></div><div className="form-group"><label className="form-label">Department</label><select className="form-select" value={taForm.department_id} onChange={e=>setTaForm({...taForm,department_id:e.target.value})}><option value="">Org-wide</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div><div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowTAForm(false)}>Cancel</button><button className="btn btn-primary" onClick={createTA}>Create</button></div></div></div>}</>}
    </div>
  );
}
