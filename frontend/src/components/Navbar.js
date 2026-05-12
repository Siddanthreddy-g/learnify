import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(8,6,20,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none',
    }}>
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #00f5d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: 'white',
            boxShadow: '0 0 20px rgba(124,58,237,0.5)'
          }}>L</div>
          <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #c084fc, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Learnify
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {[['/', 'Home'], ['/courses', 'Explore'], ['/leaderboard', 'Leaderboard']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              color: isActive(path) ? '#c084fc' : 'rgba(240,238,255,0.7)',
              background: isActive(path) ? 'rgba(124,58,237,0.15)' : 'transparent',
            }}>{label}</Link>
          ))}
          {user?.role === 'instructor' && (
            <Link to="/instructor" style={{ padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, color: isActive('/instructor') ? '#00f5d4' : 'rgba(240,238,255,0.7)', background: isActive('/instructor') ? 'rgba(0,245,212,0.1)' : 'transparent', transition: 'all 0.2s' }}>
              Studio
            </Link>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropOpen(!dropOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px',
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #00f5d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white'
                }}>{user.name?.charAt(0).toUpperCase()}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#c084fc' }}>{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: 10, color: '#6b6490' }}>▼</span>
              </button>
              {dropOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0, minWidth: 220,
                  background: 'rgba(10,8,24,0.96)',
                  border: '1px solid rgba(124,58,237,0.18)',
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                  animation: 'fadeUp 0.18s ease',
                  backdropFilter: 'blur(20px)',
                }}>
                  {/* User info header */}
                  <div style={{
                    padding: '16px 16px 14px',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,0,0,0) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>{user.name?.charAt(0)}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0eeff', lineHeight: 1.2 }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: '#52496e', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
                        border: '1px solid rgba(124,58,237,0.3)',
                      }}>{user.role}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                        padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(255,215,0,0.1)', color: '#fbbf24',
                        border: '1px solid rgba(255,215,0,0.2)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>⚡ {user.xp || 0} XP</span>
                    </div>
                  </div>

                  {/* Nav items */}
                  <div style={{ padding: '6px' }}>
                    {[
                      { path: '/dashboard', label: 'Dashboard', icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                      )},
                      { path: '/profile', label: 'Profile', icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      )},
                      { path: '/certificates', label: 'Certificates', icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                      )},
                    ].map(({ path, label, icon }) => (
                      <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                        textDecoration: 'none', borderRadius: 10, color: '#9d93c4', fontSize: 13,
                        fontWeight: 500, transition: 'all 0.15s', letterSpacing: '0.01em',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.color = '#e0d9ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9d93c4'; }}>
                        <span style={{ opacity: 0.7 }}>{icon}</span>
                        {label}
                      </Link>
                    ))}
                  </div>

                  {/* Sign out */}
                  <div style={{ padding: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={handleLogout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', background: 'none', border: 'none',
                      color: '#7a4050', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      borderRadius: 10, transition: 'all 0.15s', textAlign: 'left',
                      letterSpacing: '0.01em',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a4050'; }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
        .loading-screen { display:flex; align-items:center; justify-content:center; min-height:100vh; }
        .loader { width:40px; height:40px; border:3px solid rgba(124,58,237,0.2); border-top-color:#7c3aed; border-radius:50%; animation: spin-slow 0.8s linear infinite; }
      `}</style>
    </nav>
  );
}
