import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CurriculumBuilder({ modules, setModules }) {
  const safeModules = modules || [];

  const addModule = () => {
    // We add +1 to the length to provide the 'order' field the database requires
    setModules([...safeModules, { title: '', order: safeModules.length + 1, content: [] }]);
  };

  const updateModuleTitle = (mIdx, val) => {
    const newModules = [...safeModules];
    newModules[mIdx].title = val;
    setModules(newModules);
  };

  const addItem = (mIdx, type) => {
    const newModules = [...safeModules];
    const currentContent = newModules[mIdx].content || [];
    const order = currentContent.length + 1;
    const newItem = type === 'video' 
      ? { type: 'video', title: '', videoUrl: '', uploadType: 'url', order }
      : { type: 'quiz', title: '', quizData: { questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }] }, order };
    
    if (!newModules[mIdx].content) newModules[mIdx].content = [];
    newModules[mIdx].content.push(newItem);
    setModules(newModules);
  };

  const updateItem = (mIdx, iIdx, updates) => {
    const newModules = [...safeModules];
    newModules[mIdx].content[iIdx] = { ...newModules[mIdx].content[iIdx], ...updates };
    setModules(newModules);
  };

  const addQuestion = (mIdx, iIdx) => {
    const newModules = [...safeModules];
    const targetItem = newModules[mIdx].content[iIdx];
    if (!targetItem.quizData) targetItem.quizData = { questions: [] };
    if (!targetItem.quizData.questions) targetItem.quizData.questions = [];
    
    targetItem.quizData.questions.push({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setModules(newModules);
  };

  const updateQuestion = (mIdx, iIdx, qIdx, updates) => {
    const newModules = [...safeModules];
    newModules[mIdx].content[iIdx].quizData.questions[qIdx] = { 
      ...newModules[mIdx].content[iIdx].quizData.questions[qIdx], 
      ...updates 
    };
    setModules(newModules);
  };

  const handleFileUpload = async (mIdx, iIdx, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('video', file);
    updateItem(mIdx, iIdx, { isUploading: true });
    try {
      const { data } = await axios.post('/api/upload/video', formData);
      updateItem(mIdx, iIdx, { videoUrl: data.url, uploadType: 'local', isUploading: false });
      toast.success("Upload complete");
    } catch (err) {
      updateItem(mIdx, iIdx, { isUploading: false });
      toast.error("Upload failed");
    }
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>Course Curriculum</h3>
      
      {safeModules.map((mod, mIdx) => (
        <div key={mIdx} style={{ marginBottom: '24px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
             <span style={{ color: '#6b6490', fontWeight: '800' }}>{mIdx + 1}</span>
             <input 
              className="input" 
              placeholder="Module Title" 
              value={mod.title || ''} 
              onChange={e => updateModuleTitle(mIdx, e.target.value)} 
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(124,58,237,0.2)' }}
            />
          </div>

          {(mod.content || []).map((item, iIdx) => (
            <div key={iIdx} style={{ marginBottom: '16px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${item.type === 'video' ? '#7c3aed' : '#00f5d4'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: item.type === 'video' ? '#7c3aed' : '#00f5d4', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {item.type}
                </span>
                <input 
                  className="input-sm" 
                  placeholder="Item Title" 
                  value={item.title || ''} 
                  onChange={e => updateItem(mIdx, iIdx, { title: e.target.value })} 
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                />
              </div>

              {item.type === 'video' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    className="input-sm" 
                    placeholder="YouTube URL" 
                    value={item.videoUrl || ''} 
                    onChange={e => updateItem(mIdx, iIdx, { videoUrl: e.target.value, uploadType: 'url' })} 
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  />
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={e => handleFileUpload(mIdx, iIdx, e.target.files[0])} 
                    style={{ fontSize: '12px', color: '#6b6490' }} 
                  />
                  {item.isUploading && <div style={{ fontSize: '11px', color: '#00f5d4' }}>Uploading...</div>}
                </div>
              )}

              {item.type === 'quiz' && (
                <div style={{ marginTop: '12px' }}>
                  {(item.quizData?.questions || []).map((q, qIdx) => (
                    <div key={qIdx} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                      <input 
                        className="input-sm" 
                        placeholder="Question text" 
                        value={q.questionText || ''} 
                        onChange={e => updateQuestion(mIdx, iIdx, qIdx, { questionText: e.target.value })} 
                        style={{ marginBottom: '10px' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {(q.options || []).map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="radio" 
                              checked={q.correctAnswer === oIdx} 
                              onChange={() => updateQuestion(mIdx, iIdx, qIdx, { correctAnswer: oIdx })} 
                            />
                            <input 
                              className="input-xs" 
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt} 
                              onChange={e => {
                                const newOpts = [...q.options];
                                newOpts[oIdx] = e.target.value;
                                updateQuestion(mIdx, iIdx, qIdx, { options: newOpts });
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="btn-sm" onClick={() => addQuestion(mIdx, iIdx)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Add Question
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn-sm" onClick={() => addItem(mIdx, 'video')} style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}>+ Video</button>
            <button className="btn-sm" onClick={() => addItem(mIdx, 'quiz')} style={{ background: 'rgba(0,245,212,0.1)', color: '#00f5d4' }}>+ Quiz</button>
          </div>
        </div>
      ))}

      <button className="btn" onClick={addModule} style={{ width: '100%', background: '#7c3aed', color: '#fff', height: '48px', fontWeight: '600' }}>
        Add Module
      </button>
    </div>
  );
}