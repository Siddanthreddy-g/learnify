import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let frame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.25 + 0.04,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${d.a})`;
        ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.07 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

const stats = [
  { value: '50K+', label: 'Students' },
  { value: '200+', label: 'Courses' },
  { value: '98%', label: 'Completion rate' },
  { value: '4.9', label: 'Avg. rating' },
];

const features = [
  {
    title: 'Structured curriculum',
    desc: 'Courses organized into modules and lessons with clear learning paths designed by domain experts.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6h16M4 10h16M4 14h8M4 18h6"/></svg>,
  },
  {
    title: 'Progress tracking',
    desc: 'Per-lesson completion tracking, XP rewards, and streaks to keep you accountable.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    title: 'Verified certificates',
    desc: 'Auto-generated PDF certificates with unique IDs upon course completion.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  },
  {
    title: 'Embedded quizzes',
    desc: 'Knowledge checks between lessons with auto-grading and instant feedback.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  {
    title: 'Instructor studio',
    desc: 'Full course creation tools — upload videos, write lessons, build quizzes, track enrollment.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  },
  {
    title: 'Gamified learning',
    desc: 'XP system, streak tracking, and a global leaderboard to make learning addictive.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
];

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [wordIdx, setWordIdx] = useState(0);
  const words = ['engineers', 'designers', 'analysts', 'founders'];

  useEffect(() => {
    axios.get('/api/courses?limit=6').then(r => setCourses(r.data.courses || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2800);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <div style={{ position: 'relative' }}>
      <ParticleCanvas />

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '60px', position: 'relative', zIndex: 1 }}>
        <div className="page-wrap" style={{ width: '100%', paddingTop: '80px', paddingBottom: '80px' }}>

          {/* Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px', animation: 'fadeUp 0.5s ease' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px 6px 8px',
              background: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px', fontSize: '12px', fontWeight: 500, color: '#a1a1aa',
            }}>
              <span style={{ background: '#8b5cf6', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', letterSpacing: '0.03em' }}>NEW</span>
              Instructor studio now available for all users
            </div>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(44px,7vw,80px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.0,
            textAlign: 'center', maxWidth: '820px', margin: '0 auto 20px',
            animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}>
            The platform that builds{' '}
            <span key={wordIdx} style={{
              color: '#8b5cf6', display: 'inline-block',
              animation: 'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}>{words[wordIdx]}</span>
          </h1>

          <p style={{
            fontSize: '18px', color: '#71717a', textAlign: 'center',
            maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.65,
            animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}>
            Expert-crafted video courses with progress tracking, embedded quizzes,
            and verified certificates — all in one place.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease 0.15s both' }}>
            <Link to="/courses" className="btn btn-primary btn-xl">Browse courses</Link>
            <Link to="/register" className="btn btn-ghost btn-xl">Create account</Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#3f3f46', marginTop: '16px', animation: 'fadeUp 0.5s ease 0.2s both' }}>
            No credit card required &nbsp;&middot;&nbsp; Free forever for students
          </p>


        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '96px 0', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="page-wrap">
          <div style={{ maxWidth: '560px', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Platform</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '14px' }}>Everything in one place</h2>
            <p style={{ fontSize: '16px', color: '#71717a', lineHeight: 1.65 }}>Built with the tools instructors and students actually need, without the bloat.</p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
            gap: '1px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '24px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {features.map((f, i) => (
              <div key={f.title} style={{
                background: '#111113', padding: '28px',
                transition: 'background 0.2s',
                animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#18181b'}
                onMouseLeave={e => e.currentTarget.style.background = '#111113'}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#1f1f23', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      {courses.length > 0 && (
        <section style={{ padding: '80px 0', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="page-wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Courses</p>
                <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Featured this week</h2>
              </div>
              <Link to="/courses" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="grid-3">
              {courses.map((c, i) => <CourseCard key={c._id} course={c} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section style={{ padding: '96px 0', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="page-wrap">
          <div style={{
            background: '#111113', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: 'clamp(40px,6vw,72px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse,rgba(139,92,246,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '14px' }}>Start learning today</h2>
            <p style={{ fontSize: '17px', color: '#71717a', maxWidth: '420px', margin: '0 auto 36px', lineHeight: 1.65 }}>
              Join thousands of learners building real skills with structured, expert-led courses.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Get started for free</Link>
              <Link to="/courses" className="btn btn-ghost btn-lg">Browse courses</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 0', position: 'relative', zIndex: 1 }}>
        <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 11L7 2L12 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 8H10" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em' }}>Learnify</span>
          </div>
          <p style={{ fontSize: '12px', color: '#3f3f46' }}>&copy; {new Date().getFullYear()} Learnify. Built for conference submission.</p>
        </div>
      </footer>
    </div>
  );
}
