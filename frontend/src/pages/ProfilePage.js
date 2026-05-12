import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', form);
      await fetchMe();
      toast.success('✅ Profile updated!');
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 90 }}>
      <div className="page-container" style={{ padding: '40px 24px', maxWidth: 680 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>
          My <span style={{ background: 'linear-gradient(135deg, #7c3aed, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Profile</span>
        </h1>

        <div className="glass" style={{ padding: 36, borderRadius: 20, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #00f5d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: 'white', boxShadow: '0 0 30px rgba(124,58,237,0.4)', flexShrink: 0 }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f0eeff' }}>{user?.name}</div>
              <div style={{ fontSize: 14, color: '#6b6490', marginBottom: 8 }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-purple">{user?.role}</span>
                <span className="badge badge-gold">⚡ {user?.xp || 0} XP</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="input" rows={3} placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="input" value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '📚', label: 'Courses Enrolled', value: user?.enrolledCourses?.length || 0 },
            { icon: '🏆', label: 'Certificates', value: user?.certificates?.length || 0 },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '20px 24px', borderRadius: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#c084fc' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b6490' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
