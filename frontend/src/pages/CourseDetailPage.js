import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';

const Stars = ({ rating, interactive, onSelect }) => (
  <div className="stars" style={{ cursor: interactive ? 'pointer' : 'default' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}
        style={{ fontSize: interactive ? 24 : 14 }}
        onClick={() => interactive && onSelect && onSelect(i)}>★</span>
    ))}
  </div>
);

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [reviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // New state for the video player modal
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/courses/${id}`);
        setCourse(data);
        if (data.modules?.length) setActiveModule(data.modules[0]._id);
        if (user) {
          const check = await axios.get(`/api/enrollments/check/${id}`);
          setEnrolled(check.data.enrolled);
        }
      } catch { navigate('/courses'); }
      setLoading(false);
    };
    load();
  }, [id, user, navigate]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrollLoading(true);
    try {
      await axios.post(`/api/enrollments/${id}`);
      setEnrolled(true);
      toast.success('🎉 Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
    setEnrollLoading(false);
  };

  const submitReview = async () => {
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      const { data } = await axios.post(`/api/courses/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      setCourse(data);
      setReviewComment('');
      toast.success('✅ Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    }
    setSubmittingReview(false);
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader" />
    </div>
  );
  if (!course) return null;

  const totalItems = course.modules?.reduce((a, m) => a + (m.content?.length || 0), 0) || 0;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      
      {/* Video Player Modal Overlay */}
      {activeVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 900, position: 'relative' }}>
            <button 
              onClick={() => setActiveVideo(null)}
              style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'white', fontSize: 30, cursor: 'pointer' }}
            >✕</button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 50px rgba(124,58,237,0.3)' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`${getEmbedUrl(activeVideo.videoUrl)}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 style={{ color: 'white', marginTop: 20, fontSize: 20 }}>{activeVideo.title}</h3>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.18) 0%, transparent 100%)', padding: '56px 0 48px', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 360px)', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className="badge badge-purple">{course.category}</span>
                <span className={`badge ${course.level === 'beginner' ? 'badge-neon' : course.level === 'advanced' ? 'badge-pink' : 'badge-purple'}`}>{course.level}</span>
                {course.isPublished && <span className="badge badge-gold">✓ Published</span>}
              </div>
              <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>{course.title}</h1>
              <p style={{ fontSize: 17, color: '#b8b0d8', lineHeight: 1.7, marginBottom: 24 }}>{course.shortDescription || course.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                <Stars rating={course.averageRating} />
                <span style={{ fontWeight: 800, color: '#ffd700' }}>{course.averageRating?.toFixed(1) || '0.0'}</span>
                <span style={{ color: '#6b6490' }}>({course.reviews?.length || 0} reviews)</span>
                <span style={{ color: '#6b6490' }}>👥 {course.totalStudents} students</span>
              </div>
            </div>

            <div className="glass" style={{ padding: 28, borderRadius: 20, position: 'sticky', top: 90 }}>
              <div style={{ height: 180, borderRadius: 12, marginBottom: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #0e0b1e, #14112a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {course.thumbnail ? <img src={`http://localhost:5000/${course.thumbnail}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{fontSize: 80}}>🎓</span>}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 20, color: course.price === 0 ? '#00f5d4' : '#c084fc' }}>
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              {enrolled ? (
                <Link to={`/learn/${id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px 0' }}>
                  🎬 Go to Course Player
                </Link>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px 0' }} onClick={handleEnroll} disabled={enrollLoading}>
                  {enrollLoading ? 'Enrolling...' : '🚀 Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 360px)', gap: 48 }}>
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: '#f0eeff' }}>Course Curriculum</h2>
              {course.modules?.map((mod, mi) => (
                <div key={mod._id} className="glass" style={{ marginBottom: 12, borderRadius: 14, overflow: 'hidden' }}>
                  <button onClick={() => setActiveModule(activeModule === mod._id ? null : mod._id)} style={{
                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                    color: '#f0eeff', fontWeight: 700, fontSize: 16,
                    borderBottom: activeModule === mod._id ? '1px solid rgba(124,58,237,0.2)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>{mi + 1}</div>
                      {mod.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#6b6490' }}>{mod.content?.length || 0} items</span>
                      <span style={{ color: '#7c3aed', transform: activeModule === mod._id ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </div>
                  </button>
                  {activeModule === mod._id && (
                    <div>
                      {mod.content?.map((item, li) => (
                        <div 
                          key={item._id} 
                          onClick={() => {
                            if (!enrolled && !item.isFree) return toast.info("Please enroll to view this content");
                            if (item.type === 'video') setActiveVideo(item);
                            else navigate(`/learn/${id}`);
                          }}
                          style={{ 
                            padding: '12px 20px 12px 32px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 12, 
                            cursor: 'pointer',
                            background: activeVideo?._id === item._id ? 'rgba(124,58,237,0.1)' : 'transparent',
                            borderBottom: li < mod.content.length - 1 ? '1px solid rgba(124,58,237,0.08)' : 'none' 
                          }}>
                          <span style={{ fontSize: 16 }}>{item.type === 'video' ? '🎬' : '📝'}</span>
                          <span style={{ fontSize: 14, color: activeVideo?._id === item._id ? '#c084fc' : '#b8b0d8', flex: 1 }}>{item.title}</span>
                          {item.isFree && <span className="badge badge-neon" style={{ fontSize: 10 }}>Free Preview</span>}
                          {item.duration > 0 && <span style={{ fontSize: 12, color: '#6b6490' }}>{item.duration} min</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}