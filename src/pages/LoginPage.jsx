import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Target, User, Users, Shield } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'employee@demo.com', password: 'demo123456', role: 'Employee', desc: 'Create & track goals', icon: User, color: 'var(--blue)' },
  { email: 'manager@demo.com', password: 'demo123456', role: 'Manager', desc: 'Review & approve goals', icon: Users, color: 'var(--green)' },
  { email: 'admin@demo.com', password: 'demo123456', role: 'Admin / HR', desc: 'Configure & oversee', icon: Shield, color: 'var(--purple)' },
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await signIn(email, password); } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handleDemoLogin(account) {
    setError(''); setLoading(true);
    try { await signIn(account.email, account.password); } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo"><div className="logo-icon"><Target size={24} /></div><div><h2>GoalTracker</h2><div className="subtitle">Performance Management Portal</div></div></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="login-divider">Quick Demo Access</div>
        <div className="demo-roles">
          {DEMO_ACCOUNTS.map(acc => (
            <button key={acc.role} className="demo-role-btn" onClick={() => handleDemoLogin(acc)} disabled={loading}>
              <div className="role-icon" style={{ background: `${acc.color}20`, color: acc.color }}><acc.icon size={18} /></div>
              <div><div className="role-name">{acc.role}</div><div className="role-desc">{acc.desc}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
