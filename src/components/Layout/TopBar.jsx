import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Bell, Moon, Sun, Clock, Target, CheckCircle } from 'lucide-react';

export default function TopBar({ onToggleSidebar }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName = pathParts.length > 0 ? pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Dashboard';
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (profile) loadNotifications();
  }, [profile]);

  async function loadNotifications() {
    let query = supabase.from('goal_sheets').select('id, status, created_at, updated_at, employee:profiles!goal_sheets_employee_id_fkey(full_name)');
    
    if (profile.role === 'employee') {
      query = query.eq('employee_id', profile.id);
    } else if (profile.role === 'manager') {
      query = query.eq('manager_id', profile.id);
    }
    
    const { data } = await query.order('updated_at', { ascending: false }).limit(5);
    
    if (data) {
      setNotifications(data.map(sheet => ({
        id: sheet.id,
        title: profile.role === 'employee' ? `Goal sheet ${sheet.status}` : `${sheet.employee?.full_name}'s sheet is ${sheet.status}`,
        time: new Date(sheet.updated_at).toLocaleString(),
        status: sheet.status
      })));
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left"><div className="breadcrumb"><span>Home</span><span>/</span><span>{pageName}</span></div></div>
      <div className="topbar-right">
        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {notifications.length > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--red)', borderRadius: '50%' }}></span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown card" style={{ position: 'absolute', top: '100%', right: 0, width: 320, padding: 0, marginTop: 8, zIndex: 100, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600 }}>Notifications</h4>
                <button className="btn btn-ghost" style={{ padding: 4, fontSize: 11 }} onClick={() => setShowNotifications(false)}>Close</button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: n.status === 'approved' ? 'var(--green)' : n.status === 'submitted' ? 'var(--yellow)' : 'var(--blue)' }}>
                        {n.status === 'approved' ? <CheckCircle size={16} /> : n.status === 'submitted' ? <Clock size={16} /> : <Target size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
