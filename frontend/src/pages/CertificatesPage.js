import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCerts = async () => {
      try {
        // First check for any completed enrollments that haven't been certified yet
        const enrollRes = await axios.get('/api/enrollments/my').catch(() => ({ data: [] }));
        const completedCourses = (enrollRes.data || []).filter(e => e.isCompleted);
        
        // Auto-generate certs for completed courses (no-op if already exists)
        await Promise.all(
          completedCourses.map(e =>
            axios.post(`/api/certificates/generate/${e.course?._id || e.course}`).catch(() => {})
          )
        );

        // Now fetch all certs
        const certRes = await axios.get('/api/certificates/my');
        setCerts(certRes.data || []);
      } catch {
        // still show empty state
      } finally {
        setLoading(false);
      }
    };
    loadCerts();
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '60px' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0 32px' }}>
        <div className="page-wrap">
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Achievements</p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>My Certificates</h1>
          <p style={{ color: '#52525b', fontSize: '15px' }}>Your verified course completions</p>
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '48px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : certs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#111113', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No certificates yet</h3>
            <p style={{ color: '#52525b', fontSize: '14px', marginBottom: '24px' }}>
              Complete a course to earn your first verified certificate.
            </p>
            <Link to="/courses" className="btn btn-accent">Browse courses</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '20px' }}>
            {certs.map((cert, i) => (
              <div key={cert._id} style={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
              }}>
                {/* Top accent */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />

                <div style={{ padding: '28px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#8b5cf6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Certificate of Completion
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fafafa', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                        {cert.course?.title || 'Course'}
                      </h3>
                    </div>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {[
                      ['Certificate ID', cert.certificateId],
                      ['Issued', new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                      ['Instructor', cert.course?.instructor?.name || 'Learnify'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#52525b' }}>{label}</span>
                        <span style={{ color: '#a1a1aa', fontWeight: label === 'Certificate ID' ? 500 : 400, fontFamily: label === 'Certificate ID' ? 'monospace' : 'inherit', fontSize: label === 'Certificate ID' ? '12px' : '13px' }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`http://localhost:5000/api/certificates/download/${cert.certificateId}`}
                      className="btn btn-primary btn-sm"
                      download
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Download PDF
                    </a>
                    <a
                      href={`http://localhost:5000/api/certificates/verify/${cert.certificateId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      Verify
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
