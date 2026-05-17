import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: sheets } = await supabase.from('goal_sheets').select('*, employee:profiles!goal_sheets_employee_id_fkey(full_name, email, department:departments(name)), goals(*, quarterly_achievements(*))');
    setData(sheets || []); setLoading(false);
  }

  function exportToExcel() {
    const rows = [];
    data.forEach(sheet => {
      (sheet.goals || []).forEach(goal => {
        const baseRow = { 'Employee': sheet.employee?.full_name, 'Email': sheet.employee?.email, 'Department': sheet.employee?.department?.name || '', 'Status': sheet.status, 'Goal': goal.title, 'UoM': goal.uom_type, 'Target': goal.target_value || goal.target_date || '', 'Weight': `${goal.weightage}%` };
        const qas = goal.quarterly_achievements || [];
        ['Q1','Q2','Q3','Q4'].forEach(q => { const qa = qas.find(a => a.quarter === q); baseRow[`${q} Actual`] = qa?.actual_value || qa?.actual_date || ''; baseRow[`${q} Score`] = qa?.progress_score != null ? `${qa.progress_score.toFixed(1)}%` : ''; });
        rows.push(baseRow);
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Achievement Report');
    XLSX.writeFile(wb, `achievement_report_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header"><div className="flex items-center justify-between"><div><h2><FileText size={20} style={{ display: 'inline', marginRight: 8 }} />Achievement Reports</h2><p>View and export planned vs actual achievement data</p></div><button className="btn btn-primary" onClick={exportToExcel}><Download size={16}/> Export Excel</button></div></div>
      <div className="table-container"><table><thead><tr><th>Employee</th><th>Dept</th><th>Goal</th><th>Target</th><th>Weight</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>
        {data.flatMap(sheet => (sheet.goals || []).map(goal => {
          const qas = goal.quarterly_achievements || [];
          return (<tr key={goal.id}><td className="font-bold text-sm">{sheet.employee?.full_name}</td><td className="text-sm text-muted">{sheet.employee?.department?.name||'\u2014'}</td><td className="text-sm">{goal.title}</td><td className="text-sm">{goal.target_value||goal.target_date||'\u2014'}</td><td className="text-sm">{goal.weightage}%</td>
            {['Q1','Q2','Q3','Q4'].map(q => { const qa = qas.find(a=>a.quarter===q); return (<td key={q} className="text-sm">{qa ? <div><div>{qa.actual_value||qa.actual_date||'\u2014'}</div>{qa.progress_score!=null && <div style={{fontSize:11,fontWeight:600,color:qa.progress_score>=80?'var(--green)':qa.progress_score>=50?'var(--yellow)':'var(--red)'}}>{qa.progress_score.toFixed(0)}%</div>}</div> : '\u2014'}</td>); })}
          </tr>);
        }))}
      </tbody></table></div>
    </div>
  );
}
