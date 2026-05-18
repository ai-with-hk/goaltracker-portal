import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } } } };

export default function AnalyticsPage() {
  const [sheets, setSheets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: s } = await supabase.from('goal_sheets').select('*, employee:profiles!goal_sheets_employee_id_fkey(full_name, department:departments(name)), goals(*, thrust_area:thrust_areas(name), quarterly_achievements(*))');
    setSheets(s || []); setGoals((s || []).flatMap(sh => sh.goals || [])); setLoading(false);
  }

  const exportPDF = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, backgroundColor: '#0a0e1a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('GoalTracker_Board_Report.pdf');
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  };

  const statusCounts = { draft: 0, submitted: 0, approved: 0, returned: 0, locked: 0 };
  sheets.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
  const statusData = { labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)), datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#64748b', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'], borderWidth: 0 }] };

  const qScores = { Q1: [], Q2: [], Q3: [], Q4: [] };
  goals.forEach(g => { (g.quarterly_achievements || []).forEach(qa => { if (qa.progress_score != null) qScores[qa.quarter]?.push(qa.progress_score); }); });
  const avgScores = Object.entries(qScores).map(([q, scores]) => ({ q, avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0 }));
  const trendData = { labels: avgScores.map(s => s.q), datasets: [{ label: 'Avg Progress (%)', data: avgScores.map(s => s.avg.toFixed(1)), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 6, pointBackgroundColor: '#6366f1' }] };

  const taCounts = {};
  goals.forEach(g => { const name = g.thrust_area?.name || 'Unassigned'; taCounts[name] = (taCounts[name] || 0) + 1; });
  const taData = { labels: Object.keys(taCounts), datasets: [{ label: 'Goals', data: Object.values(taCounts), backgroundColor: '#6366f1', borderRadius: 6, borderWidth: 0 }] };

  const deptStats = {};
  sheets.forEach(s => { const dept = s.employee?.department?.name || 'Unknown'; if (!deptStats[dept]) deptStats[dept] = { total: 0, completed: 0 }; deptStats[dept].total++; if (s.status === 'approved' || s.status === 'locked') deptStats[dept].completed++; });
  const deptData = { labels: Object.keys(deptStats), datasets: [{ label: 'Completed', data: Object.values(deptStats).map(d => d.completed), backgroundColor: '#10b981', borderRadius: 6 }, { label: 'Pending', data: Object.values(deptStats).map(d => d.total - d.completed), backgroundColor: '#f59e0b', borderRadius: 6 }] };

  if (loading) return <div className="empty-state"><p>Loading analytics...</p></div>;

  return (
    <div className="animate-slide">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2><BarChart3 size={20} style={{ display: 'inline', marginRight: 8 }} />Analytics Dashboard</h2>
          <p>Goal achievement trends, distributions, and organizational insights</p>
        </div>
        <button className="btn btn-primary" onClick={exportPDF} disabled={exporting}>
          <Download size={16} /> {exporting ? 'Generating PDF...' : 'Export Board Report'}
        </button>
      </div>
      <div ref={exportRef} style={{ padding: '20px 0' }}>
      <div className="card-grid card-grid-2" style={{ marginBottom: 20 }}>
        <div className="card"><div className="card-header"><h3>Goal Sheet Status</h3></div><div style={{ height: 250, display: 'flex', justifyContent: 'center' }}><Doughnut data={statusData} options={{ ...chartOpts, scales: undefined, cutout: '60%' }} /></div></div>
        <div className="card"><div className="card-header"><h3>QoQ Achievement Trend</h3></div><div style={{ height: 250 }}><Line data={trendData} options={chartOpts} /></div></div>
      </div>
      <div className="card-grid card-grid-2">
        <div className="card"><div className="card-header"><h3>Goals by Thrust Area</h3></div><div style={{ height: 250 }}><Bar data={taData} options={{ ...chartOpts, indexAxis: 'y' }} /></div></div>
        <div className="card"><div className="card-header"><h3>Department Completion</h3></div><div style={{ height: 250 }}><Bar data={deptData} options={chartOpts} /></div></div>
      </div>
      </div>
    </div>
  );
}
