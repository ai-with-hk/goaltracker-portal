import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell } from 'lucide-react';

export default function TopBar({ onToggleSidebar }) {
  const { profile, switchRole } = useAuth();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName = pathParts.length > 0 ? pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Dashboard';
  return (
    <header className="topbar">
      <div className="topbar-left"><div className="breadcrumb"><span>Home</span><span>/</span><span>{pageName}</span></div></div>
      <div className="topbar-right">
        <div className="role-switcher">{['employee', 'manager', 'admin'].map(r => (<button key={r} className={profile?.role === r ? 'active' : ''} onClick={() => switchRole(r)}>{r}</button>))}</div>
        <button className="btn btn-ghost btn-icon"><Bell size={18} /></button>
      </div>
    </header>
  );
}
