import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GoalSheetPage from './pages/employee/GoalSheetPage';
import QuarterlyUpdatePage from './pages/employee/QuarterlyUpdatePage';
import TeamGoalsPage from './pages/manager/TeamGoalsPage';
import CheckinPage from './pages/manager/CheckinPage';
import SharedGoalsPage from './pages/manager/SharedGoalsPage';
import CycleManagementPage from './pages/admin/CycleManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import GoalUnlockPage from './pages/admin/GoalUnlockPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import EscalationPage from './pages/admin/EscalationPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page"><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="goals" element={<GoalSheetPage />} />
        <Route path="goals/update" element={<QuarterlyUpdatePage />} />
        <Route path="team" element={<TeamGoalsPage />} />
        <Route path="team/checkin" element={<CheckinPage />} />
        <Route path="team/shared" element={<SharedGoalsPage />} />
        <Route path="admin/cycles" element={<CycleManagementPage />} />
        <Route path="admin/users" element={<UserManagementPage />} />
        <Route path="admin/unlock" element={<GoalUnlockPage />} />
        <Route path="admin/audit" element={<AuditLogPage />} />
        <Route path="admin/escalation" element={<EscalationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
