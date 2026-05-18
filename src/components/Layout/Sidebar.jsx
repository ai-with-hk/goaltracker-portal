import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Target, ClipboardCheck, Users, Calendar, FileText, BarChart3, Shield, AlertTriangle, LogOut, Unlock, Share2 } from 'lucide-react';

const employeeNav = [{ section: 'Goals', items: [{ to: '/goals', icon: Target, label: 'My Goals' }, { to: '/goals/update', icon: ClipboardCheck, label: 'Quarterly Update' }] }];
const managerNav = [{ section: 'Team', items: [{ to: '/team', icon: Users, label: 'Team Goals' }, { to: '/team/checkin', icon: ClipboardCheck, label: 'Check-ins' }, { to: '/team/shared', icon: Share2, label: 'Shared Goals' }] }];
const adminNav = [{ section: 'Administration', items: [{ to: '/admin/cycles', icon: Calendar, label: 'Cycle Management' }, { to: '/admin/users', icon: Users, label: 'User Management' }, { to: '/admin/unlock', icon: Unlock, label: 'Goal Unlock' }, { to: '/admin/audit', icon: Shield, label: 'Audit Logs' }, { to: '/admin/escalation', icon: AlertTriangle, label: 'Escalation' }] }];
const commonNav = [{ section: 'Insights', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }, { to: '/reports', icon: FileText, label: 'Reports' }, { to: '/analytics', icon: BarChart3, label: 'Analytics' }] }];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const role = profile?.role || 'employee';
  let sections = [...commonNav];
  if (role === 'employee' || role === 'manager') sections = [...employeeNav, ...sections];
  if (role === 'manager') sections = [...managerNav, ...sections];
  if (role === 'admin') sections = [...managerNav, ...adminNav, ...sections];
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><div className="sidebar-brand-icon">G</div><div><h1>GoalTracker</h1><span>Performance Portal</span></div></div>
      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map(item => (<NavLink key={item.to} to={item.to} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><item.icon size={18} />{item.label}</NavLink>))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer"><div className="user-card"><div className="user-avatar">{initials}</div><div className="user-info"><div className="name">{profile?.full_name || 'User'}</div><div className="role">{role}</div></div><button className="btn btn-ghost btn-icon" onClick={signOut} title="Sign out"><LogOut size={16} /></button></div></div>
    </aside>
  );
}
