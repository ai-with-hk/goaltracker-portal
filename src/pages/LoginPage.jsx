import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Target, Lock } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try { 
      await signIn(email, password); 
    } catch (err) { 
      setError(err.message); 
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo" style={{ marginBottom: 40 }}>
          <div className="logo-icon"><Target size={24} /></div>
          <div>
            <h2>GoalTracker</h2>
            <div className="subtitle">Enterprise Performance Management</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Email</label>
            <input 
              className="form-input" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: 11, color: 'var(--accent)' }}>Forgot password?</a>
            </div>
            <input 
              className="form-input" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
            />
          </div>
          
          {error && <div className="form-error" style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--red-bg)', borderRadius: 6 }}>{error}</div>}
          
          <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Authenticating...' : (
              <>
                <Lock size={16} /> Secure Sign In
              </>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          By signing in, you agree to the Company's Terms of Service and Privacy Policy. <br/>
          Internal use only.
        </div>
      </div>
    </div>
  );
}
