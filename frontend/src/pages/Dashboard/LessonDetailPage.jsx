import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronRight, PlayCircle, Star, FileText, Info, Award, List, Layout, Maximize2, Minimize2, BookOpen, Clock, BarChart, Zap } from 'lucide-react';
import api from '../../services/api';

const LessonDetailPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [allLessons, setAllLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lessonData, lessonsList] = await Promise.all([
                    api.getLesson(lessonId),
                    api.getLessons()
                ]);
                setLesson(lessonData);
                if (Array.isArray(lessonsList)) {
                    setAllLessons(lessonsList);
                }
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        setQuizStarted(false);
        setQuizCompleted(false);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
    }, [lessonId]);

    const handleVideoEnd = async () => {
        try {
            await api.completeLesson(lessonId);
            const updatedList = await api.getLessons();
            if (Array.isArray(updatedList)) setAllLessons(updatedList);
        } catch (err) {
            console.error("Failed to update watched status:", err);
        }
    };

    const handleOptionSelect = (index) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        if (index === lesson.quizzes[currentQuestionIndex].correct_option_index) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < lesson.quizzes.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        } else {
            setQuizCompleted(true);
            submitQuizScore();
        }
    };

    const submitQuizScore = async () => {
        try {
            await api.submitQuiz(lessonId, score);
            const updatedList = await api.getLessons();
            if (Array.isArray(updatedList)) setAllLessons(updatedList);
        } catch (err) {
            console.error("Failed to submit quiz score:", err);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '90vh', backgroundColor: 'var(--color-bg)', color: 'white' }}>
            <div style={{ width: '360px', height: '100%', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
                Initializing Terminal...
            </div>
        </div>
    );

    if (!lesson) return <div className="text-center p-20">Lesson synchronization error</div>;

    const lessonsData = Array.isArray(allLessons) ? allLessons : [];
    const completedCount = lessonsData.filter(l => l.status === 'quiz_completed').length;
    const progressPerc = Math.round((completedCount / (lessonsData.length || 1)) * 100);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', height: 'calc(100vh - 84px)', overflow: 'hidden', margin: '-1.5rem', marginLeft: '-2.5rem' }}>
            {/* Sidebar: Navigation Roadmap */}
            <aside style={{ 
                width: sidebarCollapsed ? '0px' : '360px', 
                backgroundColor: 'rgba(5, 5, 5, 0.4)', 
                borderRight: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(30px)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>EXECUTIVE PATH</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>{progressPerc}%</span>
                    </div>
                    <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPerc}%`, height: '100%', backgroundColor: 'var(--color-accent)', transition: 'width 0.8s ease' }}></div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
                    {lessonsData.map((l, idx) => (
                        <div 
                            key={l.id}
                            onClick={() => navigate(`/dashboard/learning/lesson/${l.id}`)}
                            style={{ 
                                padding: '1.2rem', 
                                borderRadius: '16px', 
                                marginBottom: '0.6rem',
                                cursor: 'pointer',
                                border: l.id === lessonId ? '1px solid var(--color-accent)' : '1px solid transparent',
                                backgroundColor: l.id === lessonId ? 'rgba(209, 199, 157, 0.08)' : 'transparent',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '8px', 
                                backgroundColor: l.id === lessonId ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)', 
                                color: l.id === lessonId ? 'black' : 'var(--color-secondary)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                            }}>
                                {idx + 1}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: l.id === lessonId ? 'white' : 'var(--color-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <Clock size={12} color="var(--color-secondary)" />
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)' }}>{l.duration}</span>
                                    {l.status === 'quiz_completed' && (
                                        <CheckCircle size={12} color="var(--color-risk-low)" style={{ marginLeft: 'auto' }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Workplace: Video & Intelligence */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                <button 
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{ position: 'absolute', left: '1rem', top: '1.5rem', zIndex: 30, padding: '0.6rem', backgroundColor: 'rgba(5, 5, 5, 0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                >
                    {sidebarCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>

                <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }} className="custom-scrollbar">
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {/* Compact Player with Loading Intelligence */}
                        <div className="glass-panel" style={{ 
                            borderRadius: '32px', 
                            overflow: 'hidden', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            boxShadow: '0 30px 60px rgba(0,0,0,0.6)', 
                            marginBottom: '3rem',
                            position: 'relative' 
                        }}>
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#050505' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    width: '100%', 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    backgroundColor: '#050505',
                                    zIndex: 1,
                                    opacity: 1,
                                    transition: 'opacity 0.5s ease',
                                    pointerEvents: 'none',
                                    gap: '1rem'
                                }} id="player-loading">
                                    <div className="animate-pulse" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent' }}></div>
                                    <span style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--color-accent)', fontWeight: 'bold' }}>SYNCHRONIZING STREAM...</span>
                                </div>
                                <iframe
                                    src={`${lesson.video_url}?rel=0&origin=${window.location.origin}&modestbranding=1&showinfo=0`}
                                    title={lesson.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                                    onLoad={() => {
                                        const loader = document.getElementById('player-loading');
                                        if (loader) loader.style.opacity = '0';
                                    }}
                                    onEnded={handleVideoEnd}
                                ></iframe>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <span style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)', padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Module {lesson.order_index}</span>
                                    <span style={{ color: 'var(--color-secondary)', fontSize: '0.8rem' }}>• {lesson.difficulty || 'Expert'} Proficiency</span>
                                </div>
                                <h1 style={{ fontSize: '2.4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{lesson.title}</h1>
                                <p style={{ color: 'var(--color-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem' }}>{lesson.description}</p>

                                {/* Quiz System */}
                                {!quizStarted ? (
                                    <div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px', border: '1px solid var(--color-accent-glow)', background: 'linear-gradient(135deg, rgba(209, 199, 157, 0.05) 0%, transparent 100%)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{ backgroundColor: 'var(--color-accent-glow)', padding: '1.2rem', borderRadius: '50%' }}>
                                                <Star color="var(--color-accent)" size={32} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Strategic Assessment</h3>
                                                <p style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>Verify your mastery of this module's core strategic insights.</p>
                                            </div>
                                            <button onClick={() => setQuizStarted(true)} style={{ padding: '1rem 2.5rem', borderRadius: '16px', backgroundColor: 'var(--color-accent)', color: 'black', fontWeight: '900', cursor: 'pointer' }}>INITIATE</button>
                                        </div>
                                    </div>
                                ) : quizCompleted ? (
                                    <div className="glass-panel scale-in" style={{ padding: '3rem', borderRadius: '32px', textAlign: 'center' }}>
                                        <Award color="var(--color-accent)" size={48} style={{ margin: '0 auto 1rem' }} />
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Mastery Level: {Math.round((score / (lesson.quizzes?.length || 1)) * 100)}%</h2>
                                        <div className="flex gap-4 justify-center mt-6">
                                            <button onClick={() => { setQuizStarted(false); setQuizCompleted(false); }} style={{ padding: '0.8rem 2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>REVIEW</button>
                                            <button 
                                                onClick={() => {
                                                    const currentIdx = lessonsData.findIndex(l => l.id === lessonId);
                                                    if (currentIdx < lessonsData.length - 1) navigate(`/dashboard/learning/lesson/${lessonsData[currentIdx+1].id}`);
                                                }} 
                                                style={{ padding: '0.8rem 2rem', borderRadius: '12px', backgroundColor: 'var(--color-accent)', color: 'black', fontWeight: 'bold' }}
                                            >
                                                NEXT MODULE
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px' }}>
                                        <p style={{ color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '2rem' }}>QUESTION {currentQuestionIndex + 1} / {lesson.quizzes?.length}</p>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2rem' }}>{lesson.quizzes[currentQuestionIndex].question}</h3>
                                        {lesson.quizzes[currentQuestionIndex].options?.map((option, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleOptionSelect(idx)}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '1.2rem', 
                                                    borderRadius: '16px', 
                                                    textAlign: 'left', 
                                                    marginBottom: '0.75rem',
                                                    border: `1px solid ${selectedOption === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)'}`,
                                                    backgroundColor: selectedOption === idx ? 'rgba(209, 199, 157, 0.05)' : 'transparent',
                                                    color: selectedOption === idx ? 'white' : 'var(--color-secondary)'
                                                }}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                        {selectedOption !== null && (
                                            <button onClick={handleNextQuestion} style={{ width: '100%', padding: '1.2rem', borderRadius: '16px', backgroundColor: 'var(--color-accent)', color: 'black', fontWeight: '900', marginTop: '1.5rem' }}>CONTINUE</button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Intelligence Box */}
                            <div className="space-y-8">
                                <section className="glass-panel" style={{ padding: '2.5rem', borderRadius: '28px' }}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <BarChart color="var(--color-accent)" size={20} />
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>METRICS</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm"><span className="opacity-60">Strategic Rank</span><strong>Expert</strong></div>
                                        <div className="flex justify-between text-sm"><span className="opacity-60">Live Potential</span><strong className="text-gold">+150 XP</strong></div>
                                        <div className="flex justify-between text-sm"><span className="opacity-60">Assessment</span><strong className={lesson.status === 'quiz_completed' ? 'text-green' : 'text-gold'}>{lesson.status === 'quiz_completed' ? 'MASTERED' : 'REQUIRED'}</strong></div>
                                    </div>
                                </section>
                                <section className="glass-panel" style={{ padding: '2.5rem', borderRadius: '28px' }}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <FileText color="var(--color-accent)" size={20} />
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>RESOURCES</h3>
                                    </div>
                                    <button style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}><BookOpen size={16}/> Strategic Summary PDF</button>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LessonDetailPage;
