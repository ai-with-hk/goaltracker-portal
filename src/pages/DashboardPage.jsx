import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Target, ClipboardCheck, Users, TrendingUp } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({ totalGoals: 0, approved: 0, pending: 0, avgScore: 0 });
  const [recentSheets, setRecentSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTourBtn, setShowTourBtn] = useState(localStorage.getItem('tourDismissed') !== 'true');

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

  function startTour() {
    if (!window.driver) return toast.info('Tour is loading, please try again in a moment.');
    const driverObj = window.driver.js.driver({
      showProgress: true,
      allowClose: true,
      steps: [
        { popover: { title: 'Welcome to GoalTracker! 🎉', description: 'This portal is designed to help you align your personal objectives with company goals. Let\'s take a quick tour to get you started!', align: 'center' } },
        { element: '.sidebar', popover: { title: 'Navigation Hub', description: 'Your main menu. From here, you can access your Goals, submit Quarterly Updates, and view insights.', side: "right", align: 'start' } },
        { element: '.page-header', popover: { title: 'Your Dashboard', description: 'This is your command center. It provides a real-time snapshot of your performance and goal statuses.', side: "bottom", align: 'start' } },
        { element: '.card-grid-4', popover: { title: 'Key Metrics', description: 'Track how many goals you have, how many are approved, and your average progress score across all quarters.', side: "bottom", align: 'start' } },
        { element: '.table-container', popover: { title: 'Recent Activity', description: 'Your most recent goal sheets will appear here along with their current status (e.g., Draft, Submitted, Approved, or Returned).', side: "top", align: 'center' } },
        { popover: { title: 'Ready to Start?', description: 'Click on "My Goals" in the sidebar to create your first Goal Sheet and submit it to your manager for approval. Good luck!', align: 'center' } }
      ]
    });
    driverObj.drive();
  }

  const badges = [];
  if (stats.approved > 0) badges.push({ icon: '🚀', name: 'Fast Starter', desc: 'First goal sheet approved' });
  if (stats.avgScore >= 90) badges.push({ icon: '🔥', name: 'Overachiever', desc: 'Avg progress above 90%' });
  if (stats.avgScore > 0 && stats.avgScore < 90) badges.push({ icon: '🎯', name: 'On Track', desc: 'Making steady progress' });

  return (
    <div className="animate-slide">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h2>
          <p>Here's your goal tracking overview</p>
        </div>
        {profile?.role === 'employee' && showTourBtn && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={startTour} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              🧭 Start Guided Tour
            </button>
            <button className="btn btn-ghost" onClick={() => { localStorage.setItem('tourDismissed', 'true'); setShowTourBtn(false); }} title="Dismiss Tour Button" style={{ padding: '8px', color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>
        )}
      </div>

      {badges.length > 0 && profile?.role === 'employee' && (
        <div className="card" style={{ marginBottom: 24, padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 12 }}>YOUR ACHIEVEMENTS</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: 24 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
