import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CurriculumBuilder from '../components/CurriculumBuilder'; 

export default function InstructorPage() {
  const [courses, setCourses] = useState([]);
  const [view, setView] = useState('list');
  const [editCourse, setEditCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    title: '', description: '', shortDescription: '', category: 'Programming', 
    level: 'beginner', price: 0, language: 'English', whatYouLearn: [''], requirements: [''], tags: '' 
  });
  
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const { data } = await axios.get('/api/courses/instructor/my-courses');
      setCourses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const cleanedModules = (modules || []).map(m => ({
        ...m,
        content: (m.content || []).map((item, idx) => {
          const { isUploading, uploadType, ...rest } = item; 
          return { ...rest, order: rest.order ?? idx + 1 };
        })
      }));

      const payload = { 
        ...form, 
        modules: cleanedModules, 
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags, 
        whatYouLearn: (form.whatYouLearn || []).filter(Boolean), 
        requirements: (form.requirements || []).filter(Boolean) 
      };

      if (editCourse) {
        const { data } = await axios.put(`/api/courses/${editCourse._id}`, payload);
        setCourses(cs => cs.map(c => c._id === data._id ? data : c));
        toast.success('Course updated');
      } else {
        const { data } = await axios.post('/api/courses', payload);
        setCourses(cs => [data, ...cs]);
        toast.success('Course created');
      }
      setView('list'); 
      setEditCourse(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const startEdit = (c) => {
    setEditCourse(c);
    setForm({ 
        ...c, 
        tags: Array.isArray(c.tags) ? c.tags.join(', ') : '', 
        whatYouLearn: c.whatYouLearn?.length ? c.whatYouLearn : [''], 
        requirements: c.requirements?.length ? c.requirements : [''] 
    });
    setModules(c.modules || []); 
    setView('create');
  };

  const togglePublish = async (c) => {
    try {
      const { data } = await axios.put(`/api/courses/${c._id}`, { isPublished: !c.isPublished });
      setCourses(cs => cs.map(course => course._id === data._id ? data : course));
      toast.success(data.isPublished ? 'Course is now Live' : 'Course moved to Drafts');
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', color: '#fff', paddingTop: '90px' }}>
      <div className="page-container" style={{ padding: '40px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Instructor <span style={{ color: '#7c3aed' }}>Studio</span>
            </h1>
          </div>
          {view === 'list' ? (
            <button className="btn btn-primary" onClick={() => { setEditCourse(null); setModules([]); setView('create'); }}>
              Create Course
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => setView('list')}>Back to list</button>
          )}
        </div>

        {view === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? <div className="loader" style={{ margin: '40px auto' }} /> : 
              courses.map(c => (
                <div key={c._id} className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: c.isPublished ? 'rgba(0,245,212,0.1)' : 'rgba(255,184,0,0.1)', color: c.isPublished ? '#00f5d4' : '#ffb800', fontWeight: '700' }}>
                        {c.isPublished ? 'LIVE' : 'DRAFT'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{c.title}</h3>
                    <p style={{ fontSize: '13px', color: '#6b6490', marginTop: '4px' }}>{c.category} • {c.modules?.length || 0} Modules</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => startEdit(c)}>Edit</button>
                    <button 
                      className={`btn btn-sm ${c.isPublished ? 'btn-ghost' : 'btn-primary'}`} 
                      onClick={() => togglePublish(c)}
                      style={{ minWidth: '100px' }}
                    >
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div style={{ maxWidth: '900px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b6490', marginBottom: '8px', textTransform: 'uppercase' }}>Course Title</label>
                <input 
                  className="input" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="e.g. Master Class in Web Development"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b6490', marginBottom: '8px', textTransform: 'uppercase' }}>Description</label>
                <textarea 
                  className="input" 
                  rows={4} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="What will students learn in this course?"
                />
              </div>

              <CurriculumBuilder modules={modules} setModules={setModules} />

              <div style={{ display: 'flex', gap: '16px', marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ flex: '1' }}>
                  Save Course Content
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => setView('list')}>Discard Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}