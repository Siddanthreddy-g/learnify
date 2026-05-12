import React, { useState, useEffect } from 'react';
import axios from 'axios';

const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('xp');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  const fetchLeaders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch real users sorted by xp from backend
      const { data } = await axios.get('/api/leaderboard');
      setLeaders(data);
      if (silent) {
        setPulse(true);
        setLastUpdated(new Date());
        setTimeout(() => setPulse(false), 1000);
      }
    } catch {
      // Fallback static data if endpoint not ready
      setLeaders([
        { name: 'Emma Thompson', xp: 3400, streak: 30, completedCourses: 6, role: 'student' },
        { name: 'Fatima Hassan', xp: 2100, streak: 21, completedCourses: 4, role: 'student' },
        { name: 'Alex Rivera', xp: 1240, streak: 14, completedCourses: 3, role: 'student' },
        { name: 'Yuki Tanaka', xp: 980, streak: 9, completedCourses: 2, role: 'student' },
        { name: 'Carlos Mendez', xp: 760, streak: 5, completedCourses: 2, role: 'student' },
      ]);
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchLeaders();
    // Live updates every 30 seconds
    const interval = setInterval(() => fetchLeaders(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...leaders].sort((a, b) => b[filter] - a[filter]);
  const top3 = sorted.slice(0, 3);
  const maxVal = sorted[0]?.[filter] || 1;

  const FilterBtn = ({ val, label }) => (
    <button onClick={() => setFilter(val)} style={{
      padding: '6px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
      fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
      background: filter === val ? '#8b5cf6' : '#18181b',
      color: filter === val ? '#fff' : '#71717a',
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '60px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0 32px' }}>
        <div className="page-wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Rankings</p>
              <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>Leaderboard</h1>
              <p style={{ color: '#52525b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block',
                  animation: pulse ? 'pulse 0.5s ease' : 'none',
                  boxShadow: '0 0 6px rgba(16,185,129,0.6)',
                }} />
                Live &nbsp;&middot;&nbsp; Updates every 30s &nbsp;&middot;&nbsp; Last: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <FilterBtn val="xp" label="XP" />
              <FilterBtn val="streak" label="Streak" />
              <FilterBtn val="completedCourses" label="Completed" />
            </div>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '48px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* TOP 3 PODIUM */}
            {top3.length >= 3 && (
              <div style={{ marginBottom: '48px' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr',
                  gap: '12px', maxWidth: '600px', margin: '0 auto',
                  alignItems: 'flex-end',
                }}>
                  {[1, 0, 2].map((rank) => {
                    const person = top3[rank];
                    const podiumHeights = [140, 180, 110];
                    const actualRank = rank;
                    return (
                      <div key={rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `fadeUp 0.5s ease ${rank * 0.1}s both` }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '50%',
                          background: `${medals[actualRank]}22`,
                          border: `2px solid ${medals[actualRank]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px', fontWeight: 800, color: medals[actualRank],
                          marginBottom: '8px',
                        }}>{person.name.charAt(0)}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa', marginBottom: '4px', textAlign: 'center' }}>
                          {person.name.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '12px', color: medals[actualRank], fontWeight: 700, marginBottom: '10px' }}>
                          {filter === 'xp' ? `${person.xp} XP` : filter === 'streak' ? `${person.streak}d` : `${person.completedCourses || 0}`}
                        </div>
                        <div style={{
                          width: '100%', height: `${podiumHeights[rank === 0 ? 1 : rank === 1 ? 0 : 2]}px`,
                          borderRadius: '10px 10px 0 0',
                          background: `${medals[actualRank]}14`,
                          border: `1px solid ${medals[actualRank]}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', fontWeight: 900, color: medals[actualRank],
                        }}>#{actualRank + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FULL RANKINGS TABLE */}
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 80px', gap: '12px', alignItems: 'center' }}>
                {['Rank', 'Learner', 'XP', 'Streak', 'Done'].map(h => (
                  <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                ))}
              </div>

              {sorted.map((person, i) => {
                const barWidth = Math.max(4, (person[filter] / maxVal) * 100);
                const isTop3 = i < 3;
                return (
                  <div key={person.name || i} style={{
                    padding: '14px 20px',
                    borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 80px',
                    gap: '12px', alignItems: 'center',
                    background: isTop3 ? `${medals[i]}06` : 'transparent',
                    transition: 'background 0.15s',
                    animation: `fadeUp 0.4s ease ${i * 0.04}s both`,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#18181b'}
                    onMouseLeave={e => e.currentTarget.style.background = isTop3 ? `${medals[i]}06` : 'transparent'}
                  >
                    {/* Rank */}
                    <div style={{ fontSize: '14px', fontWeight: 700, color: isTop3 ? medals[i] : '#3f3f46', textAlign: 'center' }}>
                      #{i + 1}
                    </div>

                    {/* Name + bar */}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', marginBottom: '6px' }}>{person.name}</div>
                      <div style={{ height: '3px', background: '#1f1f23', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${barWidth}%`,
                          background: isTop3 ? medals[i] : '#8b5cf6',
                          borderRadius: '2px',
                          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                        }} />
                      </div>
                    </div>

                    {/* XP */}
                    <div style={{ fontSize: '13px', fontWeight: filter === 'xp' ? 700 : 400, color: filter === 'xp' ? '#fbbf24' : '#71717a' }}>
                      {(person.xp || 0).toLocaleString()}
                    </div>

                    {/* Streak */}
                    <div style={{ fontSize: '13px', fontWeight: filter === 'streak' ? 700 : 400, color: filter === 'streak' ? '#f43f5e' : '#71717a' }}>
                      {person.streak || 0}d
                    </div>

                    {/* Completed */}
                    <div style={{ fontSize: '13px', fontWeight: filter === 'completedCourses' ? 700 : 400, color: filter === 'completedCourses' ? '#10b981' : '#71717a' }}>
                      {person.completedCourses || 0}
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#3f3f46' }}>
              Rankings update automatically as students complete lessons and quizzes
            </p>
          </>
        )}
      </div>
    </div>
  );
}
