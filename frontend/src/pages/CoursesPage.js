import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';

const categories = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Data Science', 'AI & ML'];
const levels = ['All', 'beginner', 'intermediate', 'advanced'];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      if (level !== 'All') params.set('level', level);
      const { data } = await axios.get(`/api/courses?${params}`);
      setCourses(data.courses || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch { setCourses([]); }
    setLoading(false);
  }, [search, category, level, page]);

  useEffect(() => { setPage(1); }, [search, category, level]);
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const FilterBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      padding: '6px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
      fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
      background: active ? '#8b5cf6' : '#18181b',
      color: active ? '#fff' : '#71717a',
      boxShadow: active ? '0 2px 12px rgba(139,92,246,0.35)' : 'none',
    }}>{children}</button>
  );

  const LevelBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: '100px', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
      border: `1px solid ${active ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
      background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
      color: active ? '#a78bfa' : '#52525b',
      transition: 'all 0.15s', textTransform: 'capitalize',
    }}>{children}</button>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '60px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 0 32px' }}>
        <div className="page-wrap">
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px', animation: 'fadeUp 0.5s ease' }}>
            Explore courses
          </h1>
          <p style={{ color: '#52525b', marginBottom: '28px', fontSize: '15px' }}>{total} courses available</p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '24px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="input" placeholder="Search courses, topics, instructors..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '40px', height: '44px', fontSize: '14px' }} />
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {categories.map(c => (
              <FilterBtn key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterBtn>
            ))}
          </div>

          {/* Level filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#52525b', marginRight: '4px', fontWeight: 500 }}>Level</span>
            {levels.map(l => (
              <LevelBtn key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'All' ? 'All levels' : l}</LevelBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="page-wrap" style={{ padding: '48px 32px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '340px', borderRadius: '16px', background: '#111113', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No courses found</h3>
            <p style={{ color: '#52525b', fontSize: '14px' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid-3">
              {courses.map((c, i) => <CourseCard key={c._id} course={c} index={i} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '48px', alignItems: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ opacity: page === 1 ? 0.4 : 1 }}>Previous</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} style={{
                    width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '13px', transition: 'all 0.15s',
                    background: page === i + 1 ? '#8b5cf6' : '#18181b',
                    color: page === i + 1 ? '#fff' : '#71717a',
                  }}>{i + 1}</button>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
