import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Target, ClipboardCheck, Users, Calendar, FileText, BarChart3, Shield, AlertTriangle, LogOut, Unlock, Share2 } from 'lucide-react';

const overviewNav = { section: 'Overview', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }, { to: '/analytics', icon: BarChart3, label: 'Analytics' }, { to: '/reports', icon: FileText, label: 'Reports' }] };
const personalNav = { section: 'My Workspace', items: [{ to: '/goals', icon: Target, label: 'My Goals' }, { to: '/goals/update', icon: ClipboardCheck, label: 'Quarterly Update' }] };
const teamNav = { section: 'Team Workspace', items: [{ to: '/team', icon: Users, label: 'Team Goals' }, { to: '/team/shared', icon: Share2, label: 'Shared Goals' }, { to: '/team/checkin', icon: ClipboardCheck, label: 'Check-ins' }] };
const adminNav = { section: 'Administration', items: [{ to: '/admin/cycles', icon: Calendar, label: 'Cycle Management' }, { to: '/admin/unlock', icon: Unlock, label: 'Goal Unlock' }, { to: '/admin/escalation', icon: AlertTriangle, label: 'Escalation' }, { to: '/admin/audit', icon: Shield, label: 'Audit Logs' }, { to: '/admin/users', icon: Users, label: 'User Management' }] };

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const role = profile?.role || 'employee';
  
  let sections = [overviewNav];
  if (role === 'employee' || role === 'manager') sections.push(personalNav);
  if (role === 'manager' || role === 'admin') sections.push(teamNav);
  if (role === 'admin') sections.push(adminNav);
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: 'transparent', padding: 0 }}>
          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
        <div><h1>GoalTracker</h1><span>Performance Portal</span></div>
      </div>
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
