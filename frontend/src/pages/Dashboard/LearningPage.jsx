import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Award, CheckCircle, BarChart, Clock, Target, Shield, Zap, Globe, TrendingUp, BookOpen, Layers, Map } from 'lucide-react';
import api from '../../services/api';

const LearningPage = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await api.getLessons();
                if (Array.isArray(data)) {
                    setLessons(data);
                }
            } catch (err) {
                console.error("Failed to fetch lessons:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, []);

    const masteredCount = Array.isArray(lessons) ? lessons.filter(l => l.status === 'quiz_completed').length : 0;
    const progress = (Array.isArray(lessons) && lessons.length > 0) 
        ? Math.round((masteredCount / lessons.length) * 100) 
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div style={{ padding: '2rem', color: 'var(--color-accent)' }}>Synchronizing Roadmap...</div>
            </div>
        );
    }

    const milestones = [
        { title: "Strategic Foundations", range: [1, 4], icon: <Globe size={20} /> },
        { title: "Advanced Analysis", range: [5, 8], icon: <BarChart size={20} /> },
        { title: "Technical Proficiency", range: [9, 12], icon: <Layers size={20} /> },
        { title: "Execution Logistics", range: [13, 16], icon: <Target size={20} /> },
        { title: "Capital Strategy & Risk", range: [17, 20], icon: <Shield size={20} /> }
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '8rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Executive Header */}
            <header style={{ marginBottom: '4.5rem', display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
                        <span style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Terminal Academy</span>
                        <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.06)' }}></div>
                    </div>
                    <h1 className="text-gradient-gold" style={{ fontSize: '3.6rem', fontWeight: 'bold', marginBottom: '1.2rem', letterSpacing: '-2px' }}>Curriculum Roadmap</h1>
                    <p style={{ color: 'var(--color-secondary)', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '750px' }}>
                        Professional 20-module certification track designed for institutional-grade market mastery.
                    </p>
                </div>

                {/* Progress Radar */}
                <div className="glass-panel" style={{ width: '300px', padding: '2.5rem', borderRadius: '32px', textAlign: 'center', border: '1px solid var(--color-accent-glow)' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle 
                                cx="60" 
                                cy="60" 
                                r="54" 
                                fill="none" 
                                stroke="var(--color-accent)" 
                                strokeWidth="8" 
                                strokeDasharray="339.29" 
                                strokeDashoffset={isNaN(progress) ? 339.29 : 339.29 - (339.29 * progress / 100)} 
                                strokeLinecap="round" 
                                style={{ transition: 'stroke-dashoffset 1s ease-out' }} 
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900' }}>{progress}%</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Mastery</p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{masteredCount}</p>
                            <p style={{ fontSize: '0.6rem', color: 'var(--color-secondary)' }}>MODULES</p>
                        </div>
                        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{Math.floor(progress/5)}</p>
                            <p style={{ fontSize: '0.6rem', color: 'var(--color-secondary)' }}>LEVEL</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Strategic Roadmap List */}
            <div className="space-y-12">
                {milestones.map((milestone, mIdx) => (
                    <section key={mIdx}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-glow)', padding: '0.8rem', borderRadius: '14px' }}>
                                {milestone.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{milestone.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>Phase 0{mIdx + 1} Strategic Track</p>
                            </div>
                            <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: '1rem' }}></div>
                        </div>

                        <div className="space-y-4">
                            {Array.isArray(lessons) && lessons
                                .filter(l => l.order_index >= milestone.range[0] && l.order_index <= milestone.range[1])
                                .map((lesson) => (
                                    <div 
                                        key={lesson.id}
                                        onClick={() => navigate(`/dashboard/learning/lesson/${lesson.id}`)}
                                        className="glass-panel hover:translate-x-3 hover:bg-white/[0.03]"
                                        style={{ 
                                            padding: '1.5rem 2.5rem', 
                                            borderRadius: '24px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '2.5rem',
                                            cursor: 'pointer',
                                            border: lesson.status === 'quiz_completed' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.06)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        <div style={{ 
                                            minWidth: '100px', 
                                            height: '60px', 
                                            borderRadius: '12px', 
                                            overflow: 'hidden',
                                            position: 'relative',
                                            backgroundColor: 'rgba(0,0,0,0.5)'
                                        }}>
                                            {lesson.thumbnail_url && <img src={lesson.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Play size={16} fill="white" />
                                            </div>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{lesson.title}</h4>
                                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                                                <div className="flex items-center gap-1.5" style={{ color: 'var(--color-secondary)', fontSize: '0.8rem' }}>
                                                    <Clock size={12} /> {lesson.duration}
                                                </div>
                                                <div className="flex items-center gap-1.5" style={{ color: 'var(--color-secondary)', fontSize: '0.8rem' }}>
                                                    <Zap size={12} /> {lesson.difficulty || 'Expert'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ minWidth: '150px' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Live Status</p>
                                            <div className="flex items-center gap-2">
                                                {lesson.status === 'quiz_completed' ? (
                                                    <>
                                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-risk-low)', borderRadius: '3px' }}></div>
                                                        <CheckCircle size={18} color="var(--color-risk-low)" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}></div>
                                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Certification Gateway */}
            <div className="glass-panel" style={{ 
                margin: '8rem 0 0', 
                padding: '4rem', 
                borderRadius: '40px', 
                textAlign: 'center', 
                background: 'linear-gradient(135deg, rgba(209, 199, 157, 0.08) 0%, transparent 100%)',
                border: '1px solid var(--color-accent-glow)'
            }}>
                <Award size={64} color="var(--color-accent)" style={{ margin: '0 auto 2rem' }} />
                <h2 style={{ fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>Institutional Mastery</h2>
                <p style={{ color: 'var(--color-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                    Complete the 20-module track to unlock the professional certification examination.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem' }}>
                    <div className="flex items-center gap-2">
                        <Map color="var(--color-accent)" size={20} />
                        <span style={{ fontWeight: 'bold' }}>20 Modules</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="flex items-center gap-2">
                        <TrendingUp color="var(--color-accent)" size={20} />
                        <span style={{ fontWeight: 'bold' }}>80% Passing Score</span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/dashboard/learning/assessment')}
                    disabled={progress < 100}
                    style={{ 
                        padding: '1.2rem 5rem', 
                        borderRadius: '20px', 
                        backgroundColor: progress === 100 ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)', 
                        color: progress === 100 ? 'black' : 'var(--color-secondary)',
                        border: progress === 100 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        fontWeight: '900',
                        fontSize: '1.2rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: progress === 100 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.4s'
                    }}
                >
                    {progress === 100 ? 'Initiate Exam' : `Gateway Locked: ${20 - masteredCount} Left`}
                </button>
            </div>
        </div>
    );
};

export default LearningPage;
