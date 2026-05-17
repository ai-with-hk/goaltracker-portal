import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Target, ClipboardCheck, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ totalGoals: 0, approved: 0, pending: 0, avgScore: 0 });
  const [recentSheets, setRecentSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) load(); }, [profile]);

  async function load() {
    let query = supabase.from('goal_sheets').select('*, employee:profiles!goal_sheets_employee_id_fkey(full_name), goals(*, quarterly_achievements(progress_score))');
    if (profile.role === 'employee') query = query.eq('employee_id', profile.id);
    const { data: sheets } = await query.order('created_at', { ascending: false }).limit(10);
    const s = sheets || [];
    const allGoals = s.flatMap(sh => sh.goals || []);
    const scores = allGoals.flatMap(g => (g.quarterly_achievements || []).map(qa => qa.progress_score).filter(Boolean));
    setStats({ totalGoals: allGoals.length, approved: s.filter(x => x.status === 'approved' || x.status === 'locked').length, pending: s.filter(x => x.status === 'submitted').length, avgScore: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0 });
    setRecentSheets(s.slice(0, 5));
    setLoading(false);
  }

  if (loading) return <div className="empty-state"><p>Loading dashboard...</p></div>;

  const statCards = [
    { label: 'Total Goals', value: stats.totalGoals, icon: Target, color: 'var(--accent)', bg: 'var(--accent-glow)' },
    { label: 'Approved Sheets', value: stats.approved, icon: ClipboardCheck, color: 'var(--green)', bg: 'var(--green-bg)' },
    { label: 'Pending Review', value: stats.pending, icon: Users, color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
    { label: 'Avg Score', value: `${stats.avgScore.toFixed(0)}%`, icon: TrendingUp, color: 'var(--blue)', bg: 'var(--blue-bg)' },
  ];

  return (
    <div className="animate-slide">
      <div className="page-header"><h2>Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h2><p>Here's your goal tracking overview</p></div>
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        {statCards.map(sc => (
          <div key={sc.label} className="stat-card">
            <div className="stat-icon" style={{ background: sc.bg, color: sc.color }}><sc.icon size={20} /></div>
            <div className="stat-value">{sc.value}</div>
            <div className="stat-label">{sc.label}</div>
          </div>
        ))}
      </div>
      <div className="card"><div className="card-header"><h3>Recent Goal Sheets</h3></div>
        {recentSheets.length === 0 ? <div className="empty-state"><Target size={32} /><h4>No goal sheets yet</h4><p>Create your first goal sheet to get started</p></div> :
          <div className="table-container"><table><thead><tr><th>Employee</th><th>Status</th><th>Goals</th><th>Created</th></tr></thead><tbody>
            {recentSheets.map(s => (<tr key={s.id}><td className="font-bold">{s.employee?.full_name}</td><td><span className={`badge badge-${s.status}`}>{s.status}</span></td><td>{s.goals?.length || 0}</td><td className="text-sm text-muted">{new Date(s.created_at).toLocaleDateString()}</td></tr>))}
          </tbody></table></div>}
      </div>
    </div>
  );
}
