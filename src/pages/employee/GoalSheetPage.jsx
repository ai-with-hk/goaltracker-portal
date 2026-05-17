import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';
import { validateGoalSheet, UOM_LABELS } from '../../lib/goalCalculations';
import { Target, Plus, Trash2, Send, Save } from 'lucide-react';

const emptyGoal = () => ({ title: '', description: '', thrust_area_id: '', uom_type: 'numeric_min', target_value: '', target_date: '', weightage: '' });

export default function GoalSheetPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [sheet, setSheet] = useState(null);
  const [goals, setGoals] = useState([emptyGoal()]);
  const [thrustAreas, setThrustAreas] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) load(); }, [profile]);

  async function load() {
    const [{ data: tas }, { data: cyc }, { data: existing }] = await Promise.all([
      supabase.from('thrust_areas').select('*'),
      supabase.from('goal_cycles').select('*').eq('is_active', true),
      supabase.from('goal_sheets').select('*, goals(*)').eq('employee_id', profile.id).order('created_at', { ascending: false }).limit(1),
    ]);
    setThrustAreas(tas || []);
    setCycles(cyc || []);
    if (existing?.length > 0) {
      setSheet(existing[0]);
      setGoals(existing[0].goals?.length > 0 ? existing[0].goals.map(g => ({ ...g })) : [emptyGoal()]);
    }
    setLoading(false);
  }

  function updateGoal(idx, field, value) {
    const updated = [...goals]; updated[idx] = { ...updated[idx], [field]: value }; setGoals(updated);
  }

  const totalWeightage = goals.reduce((s, g) => s + (Number(g.weightage) || 0), 0);
  const isEditable = !sheet || sheet.status === 'draft' || sheet.status === 'returned';

  async function saveGoals(submit = false) {
    if (submit) {
      const { valid, errors } = validateGoalSheet(goals);
      if (!valid) { errors.forEach(e => toast.error(e)); return; }
    }
    setSaving(true);
    try {
      const activeCycle = cycles[0];
      let sheetId = sheet?.id;
      if (!sheetId) {
        const { data: newSheet, error } = await supabase.from('goal_sheets').insert({ employee_id: profile.id, cycle_id: activeCycle?.id, status: submit ? 'submitted' : 'draft' }).select().single();
        if (error) throw error;
        sheetId = newSheet.id;
        setSheet(newSheet);
      } else {
        await supabase.from('goal_sheets').update({ status: submit ? 'submitted' : 'draft', submitted_at: submit ? new Date().toISOString() : null }).eq('id', sheetId);
      }
      if (sheet?.goals?.length) await supabase.from('goals').delete().eq('goal_sheet_id', sheetId);
      const goalRows = goals.map(g => ({ goal_sheet_id: sheetId, title: g.title, description: g.description, thrust_area_id: g.thrust_area_id || null, uom_type: g.uom_type, target_value: g.target_value ? Number(g.target_value) : null, target_date: g.target_date || null, weightage: Number(g.weightage) }));
      const { error: gError } = await supabase.from('goals').insert(goalRows);
      if (gError) throw gError;
      toast.success(submit ? 'Goals submitted for review!' : 'Goals saved as draft');
      load();
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header">
        <h2><Target size={20} style={{ display: 'inline', marginRight: 8 }} />My Goal Sheet</h2>
        <p>{sheet ? `Status: ` : 'Create your goals for the current cycle'}{sheet && <span className={`badge badge-${sheet.status}`}>{sheet.status}</span>}</p>
        {sheet?.status === 'returned' && sheet?.feedback && <div className="card mt-2" style={{ borderColor: 'var(--red)', background: 'var(--red-bg)', padding: 12 }}><strong>Manager Feedback:</strong> {sheet.feedback}</div>}
      </div>

      <div className="mb-4"><div className="weightage-bar"><div className="weightage-fill" style={{ width: `${Math.min(totalWeightage, 100)}%`, background: totalWeightage === 100 ? 'var(--green)' : totalWeightage > 100 ? 'var(--red)' : 'var(--yellow)' }} /></div><div className="weightage-label" style={{ color: totalWeightage === 100 ? 'var(--green)' : 'var(--red)' }}>{totalWeightage}% / 100%</div></div>

      {goals.map((goal, i) => (
        <div key={i} className="card mb-4" style={{ opacity: isEditable ? 1 : 0.7 }}>
          <div className="card-header"><h3>Goal {i + 1}</h3>{isEditable && goals.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => setGoals(goals.filter((_, j) => j !== i))}><Trash2 size={14} /> Remove</button>}</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={goal.title} onChange={e => updateGoal(i, 'title', e.target.value)} disabled={!isEditable} placeholder="e.g., Increase quarterly sales" /></div>
            <div className="form-group"><label className="form-label">Thrust Area</label><select className="form-select" value={goal.thrust_area_id} onChange={e => updateGoal(i, 'thrust_area_id', e.target.value)} disabled={!isEditable}><option value="">Select...</option>{thrustAreas.map(ta => <option key={ta.id} value={ta.id}>{ta.name}</option>)}</select></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={goal.description} onChange={e => updateGoal(i, 'description', e.target.value)} disabled={!isEditable} rows={2} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Unit of Measurement *</label><select className="form-select" value={goal.uom_type} onChange={e => updateGoal(i, 'uom_type', e.target.value)} disabled={!isEditable}>{Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Weightage (%) *</label><input className="form-input" type="number" min="10" max="100" value={goal.weightage} onChange={e => updateGoal(i, 'weightage', e.target.value)} disabled={!isEditable} /></div>
          </div>
          <div className="form-row">
            {goal.uom_type !== 'timeline' && goal.uom_type !== 'zero_based' && <div className="form-group"><label className="form-label">Target Value *</label><input className="form-input" type="number" value={goal.target_value} onChange={e => updateGoal(i, 'target_value', e.target.value)} disabled={!isEditable} /></div>}
            {goal.uom_type === 'timeline' && <div className="form-group"><label className="form-label">Target Date *</label><input className="form-input" type="date" value={goal.target_date} onChange={e => updateGoal(i, 'target_date', e.target.value)} disabled={!isEditable} /></div>}
          </div>
        </div>
      ))}

      {isEditable && (
        <div className="flex gap-2">
          {goals.length < 8 && <button className="btn btn-secondary" onClick={() => setGoals([...goals, emptyGoal()])}><Plus size={16} /> Add Goal</button>}
          <button className="btn btn-secondary" onClick={() => saveGoals(false)} disabled={saving}><Save size={16} /> Save Draft</button>
          <button className="btn btn-primary" onClick={() => saveGoals(true)} disabled={saving}><Send size={16} /> Submit for Review</button>
        </div>
      )}
    </div>
  );
}
