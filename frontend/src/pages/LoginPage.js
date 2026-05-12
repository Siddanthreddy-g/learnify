import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';

function AuthLayout({ children, title, subtitle, link }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, padding: '100px 20px 40px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #00f5d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: 'white', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>L</div>
              <span style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #c084fc, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learnify</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{title}</h1>
          <p style={{ color: '#6b6490', fontSize: 15 }}>{subtitle}</p>
        </div>
        <div className="glass" style={{ padding: '36px 40px', borderRadius: 20 }}>
          {children}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b6490' }}>{link}</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('👋 Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your learning journey"
      link={<>Don't have an account? <Link to="/register" style={{ color: '#c084fc', fontWeight: 700 }}>Create one →</Link></>}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="input" type="password" placeholder="Your password" required
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ justifyContent: 'center', padding: '14px', fontSize: 16 }}>
          {loading ? 'Signing in...' : '🚀 Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('🎉 Account created! Welcome to Learnify!');
      navigate(form.role === 'instructor' ? '/instructor' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Join Learnify" subtitle="Start your learning journey today — it's free"
      link={<>Already have an account? <Link to="/login" style={{ color: '#c084fc', fontWeight: 700 }}>Sign in →</Link></>}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="input" type="text" placeholder="Jane Doe" required
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="input" type="password" placeholder="Min 6 characters" required
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">I am a...</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['student', 'instructor'].map(role => (
              <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))} style={{
                padding: '14px', borderRadius: 12, border: `1px solid ${form.role === role ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
                background: form.role === role ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: form.role === role ? '#c084fc' : '#b8b0d8', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}>
                {role === 'student' ? '🎓' : '👨‍🏫'} {role}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}
          style={{ justifyContent: 'center', padding: '14px', fontSize: 16 }}>
          {loading ? 'Creating account...' : '✨ Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
