import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function DashboardPage() {
  const { user, fetchMe } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh user from DB so XP, streak, certificates are always current
    fetchMe().catch(() => {});
    axios.get('/api/enrollments/my')
      .then(r => setEnrollments(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = enrollments.filter(e => e.isCompleted).length;
  const inProgress = enrollments.filter(e => !e.isCompleted && e.completionPercentage > 0).length;
  const avgPct = enrollments.length ? Math.round(enrollments.reduce((a, e) => a + e.completionPercentage, 0) / enrollments.length) : 0;

  const stats = [
    { icon: '⚡', label: 'XP Earned', value: user?.xp || 0, color: '#ffd700' },
    { icon: '🔥', label: 'Day Streak', value: user?.streak || 0, color: '#f72585' },
    { icon: '📚', label: 'Enrolled', value: enrollments.length, color: '#c084fc' },
    { icon: '🏆', label: 'Completed', value: completed, color: '#00f5d4' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 90 }}>
      <div className="page-container" style={{ padding: '40px 24px' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, animation: 'fadeUp 0.5s ease' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #00f5d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 900, color: 'white',
            boxShadow: '0 0 30px rgba(124,58,237,0.4)'
          }}>{user?.name?.charAt(0)}</div>
          <div>
            <div style={{ fontSize: 14, color: '#6b6490', marginBottom: 4 }}>Welcome back 👋</div>
            <h1 style={{ fontSize: 28, fontWeight: 900 }}>{user?.name}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="badge badge-purple">{user?.role}</span>
              <span className="badge badge-gold">⚡ {user?.xp || 0} XP</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <Link to="/courses" className="btn btn-primary btn-sm">+ Enroll New Course</Link>
            <Link to="/profile" className="btn btn-ghost btn-sm">Edit Profile</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="glass" style={{ padding: '24px 20px', borderRadius: 16, textAlign: 'center', animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b6490', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        {enrollments.length > 0 && (
          <div className="glass" style={{ padding: '24px 28px', borderRadius: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Overall Progress</h3>
              <span style={{ fontWeight: 800, color: '#c084fc' }}>{avgPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${avgPct}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 14, fontSize: 13, color: '#6b6490' }}>
              <span style={{ color: '#00f5d4' }}>✓ {completed} completed</span>
              <span style={{ color: '#c084fc' }}>▶ {inProgress} in progress</span>
              <span>📋 {enrollments.length - completed - inProgress} not started</span>
            </div>
          </div>
        )}

        {/* My Courses */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>My Learning</h2>
            <Link to="/courses" className="btn btn-ghost btn-sm">Browse More →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 200, borderRadius: 16, background: 'rgba(124,58,237,0.06)', animation: 'pulse-glow 1.5s infinite' }} />)}
            </div>
          ) : enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(124,58,237,0.05)', borderRadius: 20, border: '1px dashed rgba(124,58,237,0.3)' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No courses yet</h3>
              <p style={{ color: '#6b6490', marginBottom: 24 }}>Start your learning journey today!</p>
              <Link to="/courses" className="btn btn-primary">Explore Courses</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {enrollments.map((e, i) => (
                <div key={e._id} className="glass glass-hover" style={{ borderRadius: 16, overflow: 'hidden', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>
                  <div style={{ height: 130, background: 'linear-gradient(135deg, #0e0b1e, #14112a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                    {e.course?.thumbnail ? (
                      <img src={`http://localhost:5000/${e.course.thumbnail}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : '🎓'}
                    {e.isCompleted && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,245,212,0.9)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#03020a' }}>
                        ✓ Done
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0eeff', marginBottom: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {e.course?.title}
                    </h3>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                        <span style={{ color: '#6b6490' }}>Progress</span>
                        <span style={{ color: '#c084fc', fontWeight: 700 }}>{e.completionPercentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${e.completionPercentage}%` }} />
                      </div>
                    </div>
                    <Link to={`/learn/${e.course?._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      {e.completionPercentage === 0 ? '▶ Start' : e.isCompleted ? '↩ Review' : '▶ Continue'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 40 }}>
          {[
            { to: '/certificates', icon: '🏆', label: 'My Certificates', desc: 'View & download' },
            { to: '/leaderboard', icon: '🏅', label: 'Leaderboard', desc: 'See top learners' },
            { to: '/profile', icon: '👤', label: 'My Profile', desc: 'Edit your info' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <div className="glass glass-hover" style={{ padding: '20px 22px', borderRadius: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f0eeff' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#6b6490', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
