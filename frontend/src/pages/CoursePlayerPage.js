import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';

// ─── Quiz Panel ─────────────────────────────────────────────────────────────
function QuizPanel({ quiz, onPass, onSkip }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = quiz?.quizData?.questions || quiz?.questions || [];

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions');
      return;
    }
    setSubmitting(true);
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correctCount++;
    });
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= (quiz?.passingScore || 70);
    setResult({ score, passed, correct: correctCount, total: questions.length });
    if (passed) onPass(score);
    setSubmitting(false);
  };

  if (!quiz || questions.length === 0) {
    return (
      <div style={{ padding: '40px', color: '#71717a', textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>No quiz questions found for this section.</p>
        <button className="btn btn-primary" onClick={() => onPass(100)}>Continue to Next Lesson</button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#111113', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '28px', maxWidth: '800px', margin: '20px auto'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 600, textTransform: 'uppercase' }}>Quiz</span>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginTop: 4 }}>{quiz.title || 'Knowledge Check'}</h3>
      </div>

      {!result ? (
        <>
          {questions.map((q, qi) => (
            <div key={qi} style={{ marginBottom: '24px' }}>
              <p style={{ marginBottom: '12px', fontSize: '15px' }}>{qi + 1}. {q.questionText}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(q.options || []).map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    style={{
                      padding: '12px', borderRadius: '8px', textAlign: 'left',
                      background: answers[qi] === oi ? 'rgba(139,92,246,0.2)' : '#18181b',
                      border: `1px solid ${answers[qi] === oi ? '#8b5cf6' : '#27272a'}`,
                      color: answers[qi] === oi ? '#fff' : '#a1a1aa', cursor: 'pointer'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn btn-accent" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Checking...' : 'Submit Quiz'}
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 900, color: result.passed ? '#10b981' : '#f43f5e' }}>
            {result.score}%
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: 20 }}>
            {result.passed ? 'Excellent work!' : 'Try reviewing the material again.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {result.passed ? (
              <button className="btn btn-primary" onClick={() => onPass(result.score)}>Continue to Next Lesson</button>
            ) : (
              <button className="btn btn-ghost" onClick={() => { setResult(null); setAnswers({}); }}>Try Again</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { fetchMe } = useAuth();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const videoRef = useRef(null);

  // Load course + existing progress
  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          axios.get(`/api/courses/${courseId}`),
          axios.get(`/api/progress/course/${courseId}`).catch(() => ({ data: { progress: [] } })),
        ]);
        setCourse(courseRes.data);
        const done = new Set((progressRes.data.progress || [])
          .filter(p => p.isCompleted)
          .map(p => p.lesson?.toString()));
        setCompletedIds(done);
        if (courseRes.data.modules?.[0]?.content?.[0]) {
          setActiveModule(courseRes.data.modules[0]);
          setActiveLesson(courseRes.data.modules[0].content[0]);
        }
      } catch {
        toast.error('Failed to load course');
      }
    };
    load();
  }, [courseId]);

  // Mark a lesson/quiz as complete and award XP
  const markComplete = useCallback(async (lesson, module) => {
    if (!lesson || completedIds.has(lesson._id?.toString())) return;

    try {
      const res = await axios.post('/api/progress/lesson', {
        courseId,
        moduleId: module._id,
        lessonId: lesson._id,
        watchedSeconds: 0,
      });

      setCompletedIds(prev => new Set([...prev, lesson._id?.toString()]));

      const { xpAwarded, completionPercentage, isCompleted } = res.data;
      if (xpAwarded > 0) toast.success(`+${xpAwarded} XP earned!`);

      // Refresh user in context so dashboard/leaderboard update
      await fetchMe();

      // Auto-generate certificate when course is 100% complete
      if (isCompleted) {
        toast.success('🎉 Course Completed!');
        try {
          await axios.post(`/api/certificates/generate/${courseId}`);
          toast.success('🏆 Certificate issued! Check your profile.');
          await fetchMe(); // Refresh again after cert bonus XP
        } catch (e) {
          // Certificate may already exist — that's fine
        }
      }
    } catch (err) {
      console.error('Progress save failed:', err);
    }
  }, [courseId, completedIds, fetchMe]);

  // Move to next lesson
  const handleNext = useCallback((currentLesson, currentModule) => {
    const lesson = currentLesson || activeLesson;
    const module = currentModule || activeModule;

    const modIdx = course.modules.findIndex(m => m._id === module._id);
    const lesIdx = module.content.findIndex(l => l._id === lesson._id);

    if (lesIdx < module.content.length - 1) {
      setActiveLesson(module.content[lesIdx + 1]);
    } else if (modIdx < course.modules.length - 1) {
      const nextMod = course.modules[modIdx + 1];
      setActiveModule(nextMod);
      setActiveLesson(nextMod.content[0]);
    }
  }, [course, activeLesson, activeModule]);

  // Quiz passed: mark complete then advance
  const handleQuizPass = useCallback(async (score) => {
    toast.success(`Passed! +20 XP`);
    await markComplete(activeLesson, activeModule);
    handleNext(activeLesson, activeModule);
  }, [activeLesson, activeModule, markComplete, handleNext]);

  // Video ended: mark complete
  const handleVideoEnd = useCallback(() => {
    markComplete(activeLesson, activeModule);
  }, [activeLesson, activeModule, markComplete]);

  if (!course) return <div className="p-10" style={{ paddingTop: 100, textAlign: 'center', color: '#a1a1aa' }}>Loading course...</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0b', color: '#fff', paddingTop: '70px', boxSizing: 'border-box' }}>

      {/* Sub-header */}
      <div style={{ height: '50px', borderBottom: '1px solid #1f1f23', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px', background: '#0d0d0f', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap', padding: 0 }}
        >
          ← Back
        </button>
        <div style={{ width: '1px', height: '20px', background: '#2a2a2e', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: '14px', color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.title}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeLesson?.type === 'video' ? (
            <div style={{ width: '100%' }}>
              <div style={{ background: '#000', aspectRatio: '16/9' }}>
                {activeLesson.videoUrl && /youtube\.com|youtu\.be/.test(activeLesson.videoUrl) ? (
                  <iframe
                    key={activeLesson._id}
                    src={(() => {
                      const match = activeLesson.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
                      return `https://www.youtube.com/embed/${match ? match[1] : ''}?enablejsapi=1`;
                    })()}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={activeLesson._id}
                    ref={videoRef}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    src={activeLesson.videoUrl?.startsWith('http') ? activeLesson.videoUrl : `http://localhost:5000/${activeLesson.videoUrl}`}
                    onEnded={handleVideoEnd}
                  />
                )}
              </div>
              <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{activeLesson.title}</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                  {/* For YouTube videos, mark complete manually since we can't detect onEnded */}
                  {/youtube\.com|youtu\.be/.test(activeLesson.videoUrl || '') && !completedIds.has(activeLesson._id?.toString()) && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => markComplete(activeLesson, activeModule)}
                      style={{ fontSize: 13 }}
                    >
                      ✓ Mark as Complete
                    </button>
                  )}
                  {completedIds.has(activeLesson._id?.toString()) && (
                    <span style={{ color: '#10b981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px' }}>
              <QuizPanel
                quiz={activeLesson}
                onPass={handleQuizPass}
                onSkip={() => handleNext(activeLesson, activeModule)}
              />
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div style={{ width: '320px', borderLeft: '1px solid #1f1f23', overflowY: 'auto', background: '#0d0d0f', flexShrink: 0 }}>
          {course.modules?.map((mod, mi) => (
            <div key={mi}>
              <div style={{ padding: '14px 16px', background: '#161618', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #1f1f23', color: '#e4e4e7' }}>
                {mi + 1}. {mod.title}
              </div>
              {mod.content?.map((item, ii) => {
                const isActive = activeLesson?._id === item._id;
                const isDone = completedIds.has(item._id?.toString());
                return (
                  <div
                    key={ii}
                    onClick={() => { setActiveModule(mod); setActiveLesson(item); }}
                    style={{
                      padding: '11px 16px', cursor: 'pointer', fontSize: '13px',
                      background: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#8b5cf6' : 'transparent'}`,
                      display: 'flex', alignItems: 'center', gap: '10px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{isDone ? '✅' : item.type === 'video' ? '📺' : '📝'}</span>
                    <span style={{ color: isActive ? '#fff' : isDone ? '#a1a1aa' : '#71717a', flex: 1 }}>{item.title}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
