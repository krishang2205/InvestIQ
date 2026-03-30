import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronRight, ChevronLeft, Award, Star, History, Target, ShieldCheck, Download, Printer } from 'lucide-react';
import api from '../../services/api';
import CertificateView from './components/CertificateView';
import { useAuth } from '../../context/AuthContext'; // Assuming we have user info here

const FinalAssessmentPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [viewingCertificate, setViewingCertificate] = useState(false);
    const questionsPerPage = 5;

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await api.getFinalQuestions();
                setQuestions(data);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Failed to fetch questions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers({
            ...answers,
            [questionId]: optionIndex
        });
    };

    const handleSubmit = async () => {
        let currentScore = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_option_index) {
                currentScore++;
            }
        });
        
        setScore(currentScore);
        try {
            await api.submitFinalAssessment(currentScore, questions.length);
            setCompleted(true);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Failed to submit assessment:", err);
        }
    };

    const isPageComplete = () => {
        const start = currentPage * questionsPerPage;
        const end = Math.min(start + questionsPerPage, questions.length);
        for (let i = start; i < end; i++) {
            if (answers[questions[i].id] === undefined) return false;
        }
        return true;
    };

    if (loading) return (
        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '5rem' }}>
            <div className="skeleton-pulse w-full h-80 rounded-3xl mb-10"></div>
            <div className="space-y-6">
                <div className="skeleton-pulse w-full h-24 rounded-2xl"></div>
                <div className="skeleton-pulse w-full h-24 rounded-2xl"></div>
                <div className="skeleton-pulse w-full h-24 rounded-2xl"></div>
            </div>
        </div>
    );

    if (viewingCertificate) {
        return (
            <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
                <button 
                    onClick={() => setViewingCertificate(false)}
                    style={{ 
                        margin: '2rem 0',
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '12px', 
                        backgroundColor: 'transparent', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--color-secondary)',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                    className="no-print"
                >
                    <ArrowLeft size={18} style={{ marginRight: '8px', display: 'inline' }} /> BACK TO RESULTS
                </button>
                <CertificateView 
                    userName={user?.name || "INVESTIQ SCHOLAR"} 
                    score={score} 
                    total={questions.length} 
                    date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                />
            </div>
        );
    }

    if (!started) {
        return (
            <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh] text-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, var(--color-accent-glow) 0%, transparent 100%)', 
                    padding: '2.5rem', 
                    borderRadius: '50%', 
                    marginBottom: '2.5rem',
                    border: '1px solid var(--color-accent-glow)',
                    boxShadow: '0 0 50px rgba(209, 199, 157, 0.1)'
                }}>
                    <Award color="var(--color-accent)" size={80} />
                </div>
                <span style={{ 
                    color: 'var(--color-accent)', 
                    fontWeight: '900', 
                    letterSpacing: '4px', 
                    textTransform: 'uppercase', 
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>InvestIQ Professional Certification</span>
                <h1 className="text-gradient-gold" style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '-2px', lineHeight: '1.1' }}>
                    Final Mastery Assessment
                </h1>
                <p style={{ color: 'var(--color-secondary)', fontSize: '1.3rem', lineHeight: '1.8', marginBottom: '3.5rem', maxWidth: '700px' }}>
                    This comprehensive exam marks the culmination of your studies. 
                    Successfully complete all {questions.length} questions to earn your recognized professional certificate.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full">
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Target color="var(--color-risk-low)" size={32} style={{ margin: '0 auto 15px' }} />
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{questions.length} Questions</h4>
                        <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Expert Difficulty</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(209, 199, 157, 0.1)' }}>
                        <Award color="var(--color-accent)" size={32} style={{ margin: '0 auto 15px' }} />
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>80% Passing</h4>
                        <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Distinction Requirement</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Star color="var(--color-risk-medium)" size={32} style={{ margin: '0 auto 15px' }} />
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Full Merit</h4>
                        <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Lifetime Certification</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <button 
                        onClick={() => navigate('/dashboard/learning')}
                        style={{ padding: '1.2rem 3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        MAYBE LATER
                    </button>
                    <button 
                        onClick={() => setStarted(true)}
                        style={{ 
                            padding: '1.2rem 4rem', 
                            borderRadius: '16px', 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'black', 
                            fontWeight: '900', 
                            fontSize: '1.2rem', 
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(209, 199, 157, 0.3)'
                        }}
                    >
                        LAUNCH ASSESSMENT
                    </button>
                </div>
            </div>
        );
    }

    if (completed) {
        const passed = score >= (questions.length * 0.8);
        return (
            <div className="animate-fade-in flex flex-col items-center justify-center min-h-[85vh] text-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ 
                    padding: '3rem', 
                    borderRadius: '50%', 
                    marginBottom: '2.5rem', 
                    background: passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${passed ? 'var(--color-risk-low)' : 'var(--color-risk-high)'}`,
                    boxShadow: `0 0 50px ${passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                }}>
                    {passed ? <Award color="var(--color-risk-low)" size={100} /> : <Target color="var(--color-risk-high)" size={100} />}
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>{passed ? 'Exceptional Work!' : 'Assessment Cycle Complete'}</h1>
                <h2 className="text-gradient-gold" style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '2rem' }}>
                    Mastery Level: {Math.round((score / questions.length) * 100)}% ({score} / {questions.length})
                </h2>
                <p style={{ color: 'var(--color-secondary)', fontSize: '1.3rem', marginBottom: '4rem', maxWidth: '700px', lineHeight: '1.8' }}>
                    {passed 
                        ? 'Your analytical precision has met the institutional standards for InvestIQ Professional Certification. You have demonstrated a deep understanding of market mechanics, analysis, and risk management.'
                        : 'Your commitment to the curriculum is evident. However, the Mastery Certification requires an 80% consensus. We recommend reviewing the Technical and Strategy modules before your next attempt.'}
                </p>
                
                {passed ? (
                    <div className="flex gap-6">
                        <button 
                            onClick={() => setViewingCertificate(true)}
                            style={{ 
                                padding: '1.2rem 4rem', 
                                borderRadius: '18px', 
                                backgroundColor: 'var(--color-accent)', 
                                color: 'black', 
                                fontWeight: '900', 
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                boxShadow: '0 10px 30px rgba(209, 199, 157, 0.3)'
                            }}
                        >
                            <ShieldCheck size={24} /> VIEW MASTER CERTIFICATE
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard/learning')}
                            style={{ padding: '1.2rem 2.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            CLOSE
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-6">
                        <button 
                            onClick={() => navigate('/dashboard/learning')}
                            style={{ padding: '1.2rem 4rem', borderRadius: '18px', backgroundColor: 'var(--color-accent)', color: 'black', fontWeight: '900', cursor: 'pointer' }}
                        >
                            RETURN TO DASHBOARD
                        </button>
                        <button 
                            onClick={() => {
                                setStarted(false);
                                setCompleted(false);
                                setCurrentPage(0);
                                setAnswers({});
                            }}
                            style={{ padding: '1.2rem 3rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            RETAKE ASSESSMENT
                        </button>
                    </div>
                )}
            </div>
        );
    }

    const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);
    const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '10rem' }}>
            <div className="sticky top-24 z-20 glass-panel" style={{ padding: '2rem 2.5rem', borderRadius: '28px', marginBottom: '3.5rem', border: '1px solid var(--color-accent-glow)', background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '0.5px' }}>EXAM PROGRESS</h2>
                        <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem' }}>Answering all 50 indicators is required</p>
                    </div>
                    <span style={{ color: 'var(--color-accent)', fontWeight: '900', fontSize: '1.2rem' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-accent)', borderRadius: '4px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px var(--color-accent)' }}></div>
                </div>
            </div>

            <div className="space-y-12">
                {currentQuestions.map((q, qIdx) => (
                    <div key={q.id} className="glass-panel" style={{ padding: '3rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                        <div className="flex gap-6 mb-8">
                            <span style={{ minWidth: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                                {currentPage * questionsPerPage + qIdx + 1}
                            </span>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.4', paddingRight: '1rem' }}>{q.question}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-16">
                            {q.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(q.id, idx)}
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        borderRadius: '16px',
                                        textAlign: 'left',
                                        backgroundColor: answers[q.id] === idx ? 'rgba(209, 199, 157, 0.08)' : 'rgba(255,255,255,0.02)',
                                        border: `2px solid ${answers[q.id] === idx ? 'var(--color-accent)' : 'transparent'}`,
                                        color: answers[q.id] === idx ? 'white' : 'var(--color-secondary)',
                                        fontWeight: answers[q.id] === idx ? '700' : '400',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    className="hover:bg-white/[0.05]"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="fixed bottom-0 left-[var(--sidebar-width)] right-0 glass-panel" style={{ 
                padding: '2rem 4rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                backdropFilter: 'blur(30px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                zIndex: 100
            }}>
                <button 
                    onClick={() => {
                        window.scrollTo(0, 0);
                        setCurrentPage(p => Math.max(0, p - 1));
                    }}
                    disabled={currentPage === 0}
                    style={{ 
                        opacity: currentPage === 0 ? 0.3 : 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.6rem', 
                        backgroundColor: 'transparent', 
                        color: 'white',
                        fontWeight: '700',
                        cursor: currentPage === 0 ? 'default' : 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    <ChevronLeft size={22} /> PREVIOUS PAGE
                </button>

                <div style={{ color: 'var(--color-secondary)', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                    PAGE {currentPage + 1} <span style={{ opacity: 0.3 }}>/</span> {Math.ceil(questions.length / questionsPerPage)}
                </div>

                {currentPage < Math.ceil(questions.length / questionsPerPage) - 1 ? (
                    <button 
                        onClick={() => {
                            window.scrollTo(0, 0);
                            setCurrentPage(p => p + 1);
                        }}
                        disabled={!isPageComplete()}
                        style={{ 
                            padding: '1rem 3rem', 
                            borderRadius: '16px', 
                            backgroundColor: isPageComplete() ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)', 
                            color: isPageComplete() ? 'black' : 'var(--color-secondary)',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            cursor: isPageComplete() ? 'pointer' : 'not-allowed',
                            fontSize: '1rem'
                        }}
                    >
                        NEXT PAGE <ChevronRight size={22} />
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={!isPageComplete()}
                        style={{ 
                            padding: '1rem 4rem', 
                            borderRadius: '16px', 
                            backgroundColor: isPageComplete() ? 'var(--color-risk-low)' : 'rgba(255,255,255,0.05)', 
                            color: isPageComplete() ? 'white' : 'var(--color-secondary)',
                            fontWeight: '900',
                            fontSize: '1.1rem',
                            letterSpacing: '1px',
                            cursor: isPageComplete() ? 'pointer' : 'not-allowed',
                            boxShadow: isPageComplete() ? '0 10px 30px rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                    >
                        SUBMIT FINAL ASSESSMENT
                    </button>
                )}
            </footer>
        </div>
    );
};

export default FinalAssessmentPage;
