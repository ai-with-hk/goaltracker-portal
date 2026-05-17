import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { calculateProgressScore, UOM_LABELS, QUARTERS } from '../../lib/goalCalculations';
import { ClipboardCheck, Save } from 'lucide-react';

export default function QuarterlyUpdatePage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [sheet, setSheet] = useState(null);
  const [quarter, setQuarter] = useState('Q1');
  const [achievements, setAchievements] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) load(); }, [profile]);

  async function load() {
    const { data } = await supabase.from('goal_sheets').select('*, goals(*, quarterly_achievements(*))').eq('employee_id', profile.id).in('status', ['approved', 'locked']).order('created_at', { ascending: false }).limit(1);
    if (data?.length > 0) {
      setSheet(data[0]);
      const achMap = {};
      data[0].goals?.forEach(g => { const qa = g.quarterly_achievements?.find(a => a.quarter === quarter); achMap[g.id] = { actual_value: qa?.actual_value || '', actual_date: qa?.actual_date || '', comments: qa?.comments || '', id: qa?.id || null }; });
      setAchievements(achMap);
    }
    setLoading(false);
  }

  useEffect(() => { if (sheet) {
    const achMap = {};
    sheet.goals?.forEach(g => { const qa = g.quarterly_achievements?.find(a => a.quarter === quarter); achMap[g.id] = { actual_value: qa?.actual_value || '', actual_date: qa?.actual_date || '', comments: qa?.comments || '', id: qa?.id || null }; });
    setAchievements(achMap);
  }}, [quarter]);

  async function saveAchievements() {
    try {
      for (const goal of sheet.goals) {
        const ach = achievements[goal.id]; if (!ach) continue;
        const score = calculateProgressScore(goal.uom_type, goal.target_value, ach.actual_value ? Number(ach.actual_value) : null, goal.target_date, ach.actual_date || null);
        const row = { goal_id: goal.id, quarter, actual_value: ach.actual_value ? Number(ach.actual_value) : null, actual_date: ach.actual_date || null, comments: ach.comments, progress_score: score, status: score >= 80 ? 'on_track' : score >= 50 ? 'on_track' : 'not_started' };
        if (ach.id) { await supabase.from('quarterly_achievements').update(row).eq('id', ach.id); }
        else { await supabase.from('quarterly_achievements').insert(row); }
      }
      toast.success(`${quarter} achievements saved!`);
      load();
    } catch (err) { toast.error(err.message); }
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;
  if (!sheet) return <div className="empty-state"><ClipboardCheck size={40} /><h4>No approved goal sheet</h4><p>Your goal sheet must be approved before entering achievements</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><h2><ClipboardCheck size={20} style={{ display: 'inline', marginRight: 8 }} />Quarterly Update</h2><p>Enter your actual achievements for each quarter</p></div>
      <div className="tabs">{QUARTERS.map(q => <button key={q} className={`tab ${quarter === q ? 'active' : ''}`} onClick={() => setQuarter(q)}>{q}</button>)}</div>
      {sheet.goals?.map(goal => {
        const ach = achievements[goal.id] || {};
        const score = calculateProgressScore(goal.uom_type, goal.target_value, ach.actual_value ? Number(ach.actual_value) : null, goal.target_date, ach.actual_date || null);
        return (
          <div key={goal.id} className="card mb-4">
            <div className="card-header"><h3>{goal.title}</h3><span className="badge badge-on_track">{goal.weightage}%</span></div>
            <div className="text-sm text-muted mb-2">UoM: {UOM_LABELS[goal.uom_type]} | Target: {goal.target_value || goal.target_date || '0'}</div>
            <div className="form-row">
              {goal.uom_type !== 'timeline' ? <div className="form-group"><label className="form-label">Actual Value</label><input className="form-input" type="number" value={ach.actual_value || ''} onChange={e => setAchievements({ ...achievements, [goal.id]: { ...ach, actual_value: e.target.value } })} /></div> : <div className="form-group"><label className="form-label">Actual Date</label><input className="form-input" type="date" value={ach.actual_date || ''} onChange={e => setAchievements({ ...achievements, [goal.id]: { ...ach, actual_date: e.target.value } })} /></div>}
              <div className="form-group"><label className="form-label">Comments</label><input className="form-input" value={ach.comments || ''} onChange={e => setAchievements({ ...achievements, [goal.id]: { ...ach, comments: e.target.value } })} /></div>
            </div>
            {score !== null && <div className="mt-2"><div className="progress-bar"><div className={`progress-fill ${score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red'}`} style={{ width: `${Math.min(score, 100)}%` }} /></div><div className="text-sm mt-2" style={{ color: score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)' }}>{score.toFixed(1)}% Progress</div></div>}
          </div>
        );
      })}
      <button className="btn btn-primary" onClick={saveAchievements}><Save size={16} /> Save {quarter} Achievements</button>
    </div>
  );
}
