import React from 'react';
import { Link } from 'react-router-dom';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}>★</span>
    ))}
  </div>
);

// Category → icon path + accent color
function getCategoryStyle(category = '') {
  const map = {
    'Programming':  { color: '#7c3aed', icon: '<text x="120" y="78" text-anchor="middle" font-family="monospace" font-size="36" font-weight="700" fill="#7c3aed">&lt;/&gt;</text>' },
    'Design':       { color: '#ec4899', icon: '<circle cx="100" cy="60" r="22" fill="none" stroke="#ec4899" stroke-width="2.5"/><circle cx="140" cy="60" r="22" fill="none" stroke="#ec4899" stroke-width="2.5"/>' },
    'Business':     { color: '#f59e0b', icon: '<rect x="90" y="48" width="12" height="28" rx="2" fill="#f59e0b"/><rect x="108" y="38" width="12" height="38" rx="2" fill="#f59e0b"/><rect x="126" y="54" width="12" height="22" rx="2" fill="#f59e0b" opacity="0.6"/><rect x="144" y="44" width="12" height="32" rx="2" fill="#f59e0b" opacity="0.8"/>' },
    'Marketing':    { color: '#10b981', icon: '<path d="M88 80 Q108 40 128 55 Q148 70 168 35" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/><circle cx="168" cy="35" r="5" fill="#10b981"/>' },
    'Photography':  { color: '#06b6d4', icon: '<rect x="88" y="44" width="64" height="44" rx="6" fill="none" stroke="#06b6d4" stroke-width="2.5"/><circle cx="120" cy="66" r="14" fill="none" stroke="#06b6d4" stroke-width="2"/><circle cx="145" cy="50" r="4" fill="#06b6d4"/>' },
    'Music':        { color: '#a855f7', icon: '<text x="120" y="80" text-anchor="middle" font-family="serif" font-size="52" fill="#a855f7" opacity="0.9">♪</text>' },
    'Data Science': { color: '#3b82f6', icon: '<circle cx="104" cy="60" r="10" fill="#3b82f6" opacity="0.9"/><circle cx="136" cy="44" r="10" fill="#3b82f6" opacity="0.7"/><circle cx="136" cy="76" r="10" fill="#3b82f6" opacity="0.5"/><line x1="114" y1="60" x2="126" y2="49" stroke="#3b82f6" stroke-width="1.5"/><line x1="114" y1="60" x2="126" y2="71" stroke="#3b82f6" stroke-width="1.5"/>' },
    'AI & ML':      { color: '#8b5cf6', icon: '<circle cx="120" cy="60" r="14" fill="none" stroke="#8b5cf6" stroke-width="2"/><circle cx="92" cy="45" r="7" fill="#8b5cf6" opacity="0.7"/><circle cx="148" cy="45" r="7" fill="#8b5cf6" opacity="0.7"/><circle cx="92" cy="75" r="7" fill="#8b5cf6" opacity="0.7"/><circle cx="148" cy="75" r="7" fill="#8b5cf6" opacity="0.7"/><line x1="99" y1="45" x2="106" y2="54" stroke="#8b5cf6" stroke-width="1.5" opacity="0.6"/><line x1="141" y1="45" x2="134" y2="54" stroke="#8b5cf6" stroke-width="1.5" opacity="0.6"/><line x1="99" y1="75" x2="106" y2="66" stroke="#8b5cf6" stroke-width="1.5" opacity="0.6"/><line x1="141" y1="75" x2="134" y2="66" stroke="#8b5cf6" stroke-width="1.5" opacity="0.6"/>' },
  };
  return map[category] || { color: '#7c3aed', icon: '<text x="120" y="78" text-anchor="middle" font-family="system-ui" font-size="34" font-weight="700" fill="#7c3aed">✦</text>' };
}

function CourseThumbnail({ course }) {
  const { color, icon } = getCategoryStyle(course.category);
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Background */}
      <rect width="240" height="140" fill="#0e0e1a"/>
      {/* Top accent bar */}
      <rect x="0" y="0" width="240" height="3" fill={color}/>
      {/* Framed inner box */}
      <rect x="20" y="18" width="200" height="90" rx="8" fill="#111128"/>
      <rect x="20" y="18" width="200" height="90" rx="8" fill="none" stroke={color} strokeWidth="1" opacity="0.3"/>
      {/* Icon — injected via dangerouslySetInnerHTML trick using foreignObject is blocked, use g tag */}
      <g dangerouslySetInnerHTML={{ __html: icon }} />
      {/* Category label */}
      <text x="120" y="126" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700"
        fill={color} opacity="0.7" letterSpacing="2">
        {(course.category || '').toUpperCase()}
      </text>
    </svg>
  );
}

export default function CourseCard({ course, delay = 0 }) {
  const levelColors = { beginner: 'badge-neon', intermediate: 'badge-purple', advanced: 'badge-pink' };

  return (
    <Link to={`/courses/${course._id}`}
      style={{
        display: 'block', textDecoration: 'none', borderRadius: 16, overflow: 'hidden',
        animation: `fadeUp 0.6s ease ${delay}s both`,
        background: 'rgba(14,11,30,0.7)', border: '1px solid rgba(124,58,237,0.2)',
        transition: 'all 0.35s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(124,58,237,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
        e.currentTarget.style.boxShadow = 'none';
      }}>

      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        {course.thumbnail ? (
          <img src={`http://localhost:5000/${course.thumbnail}`} alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <CourseThumbnail course={course} />
        )}
        {/* Category pill */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
          color: '#c084fc', border: '1px solid rgba(124,58,237,0.3)'
        }}>{course.category}</div>
        {course.price === 0 && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'linear-gradient(135deg, #00f5d4, #7c3aed)',
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, color: 'white'
          }}>FREE</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ marginBottom: 10 }}>
          <span className={`badge ${levelColors[course.level] || 'badge-purple'}`}>{course.level}</span>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0eeff', lineHeight: 1.4, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </h3>

        <p style={{ fontSize: 13, color: '#6b6490', marginBottom: 14, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.shortDescription || course.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
            {course.instructor?.name?.charAt(0) || 'I'}
          </div>
          <span style={{ fontSize: 13, color: '#b8b0d8' }}>{course.instructor?.name || 'Instructor'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Stars rating={course.averageRating || 0} />
          <span style={{ fontSize: 13, color: '#ffd700', fontWeight: 700 }}>{course.averageRating?.toFixed(1) || '0.0'}</span>
          <span style={{ fontSize: 12, color: '#6b6490' }}>({course.reviews?.length || 0})</span>
        </div>

        <div style={{ borderTop: '1px solid rgba(124,58,237,0.1)', paddingTop: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: course.price === 0 ? '#00f5d4' : '#c084fc' }}>
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
