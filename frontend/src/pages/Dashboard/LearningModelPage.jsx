import React, { useEffect, useState } from 'react';
import {
    Brain,
    BookOpen,
    PlayCircle,
    CheckCircle,
    BarChart3,
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5001/api/learning';

const LearningModelPage = () => {
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizResult, setQuizResult] = useState(null);
    const [progress, setProgress] = useState(null);

    const [loadingModules, setLoadingModules] = useState(true);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [loadingLessonDetails, setLoadingLessonDetails] = useState(false);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchModules();
        fetchProgress();
    }, []);

    const fetchModules = async () => {
        try {
            setLoadingModules(true);
            setError('');

            const response = await fetch(`${API_BASE}/modules`);
            if (!response.ok) {
                throw new Error('Failed to fetch learning modules');
            }

            const data = await response.json();
            setModules(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingModules(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await fetch(`${API_BASE}/progress`);
            if (!response.ok) {
                throw new Error('Failed to fetch progress');
            }

            const data = await response.json();
            setProgress(data);
        } catch (err) {
            console.error('Progress fetch error:', err.message);
        }
    };

    const handleModuleClick = async (module) => {
        try {
            setSelectedModule(module);
            setSelectedLesson(null);
            setQuizResult(null);
            setQuizAnswers([]);
            setLoadingLessons(true);
            setError('');

            const response = await fetch(`${API_BASE}/modules/${module.id}/lessons`);
            if (!response.ok) {
                throw new Error('Failed to fetch lessons');
            }

            const data = await response.json();
            setLessons(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingLessons(false);
        }
    };

    const handleLessonClick = async (lessonId) => {
        try {
            setLoadingLessonDetails(true);
            setQuizResult(null);
            setQuizAnswers([]);
            setError('');

            const response = await fetch(`${API_BASE}/lessons/${lessonId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch lesson details');
            }

            const data = await response.json();
            setSelectedLesson(data);
            setQuizAnswers(new Array(data.quiz?.length || 0).fill(''));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingLessonDetails(false);
        }
    };

    const handleAnswerChange = (questionIndex, selectedOption) => {
        const updatedAnswers = [...quizAnswers];
        updatedAnswers[questionIndex] = selectedOption;
        setQuizAnswers(updatedAnswers);
    };

    const handleQuizSubmit = async () => {
        if (!selectedLesson) return;

        try {
            setSubmittingQuiz(true);
            setError('');

            const response = await fetch(`${API_BASE}/quiz/${selectedLesson.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers: quizAnswers }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit quiz');
            }

            const data = await response.json();
            setQuizResult(data);
            fetchProgress();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!selectedLesson) return;

        try {
            setMarkingComplete(true);
            setError('');

            const response = await fetch(`${API_BASE}/progress/complete-lesson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lesson_id: selectedLesson.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark lesson complete');
            }

            await response.json();
            fetchProgress();
            alert('Lesson marked as complete');
        } catch (err) {
            setError(err.message);
        } finally {
            setMarkingComplete(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#000000',
                color: '#ffffff',
                padding: '28px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '28px',
                }}
            >
                <Brain size={34} color="#e2d3a1" />
                <h1
                    style={{
                        fontSize: '42px',
                        fontWeight: '700',
                        margin: 0,
                        color: '#ffffff',
                    }}
                >
                    Learning Model
                </h1>
            </div>

            {error && (
                <div
                    style={{
                        background: '#1a0f0f',
                        color: '#ffb4b4',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid #4d1f1f',
                    }}
                >
                    {error}
                </div>
            )}

            <div style={topPanelStyle}>
                <div style={panelHeaderStyle}>
                    <BarChart3 size={24} color="#e2d3a1" />
                    <h2 style={panelTitleStyle}>Your Progress</h2>
                </div>

                {progress ? (
                    <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                        <div style={progressCardStyle}>
                            <p style={progressLabelStyle}>Completed Lessons</p>
                            <h3 style={progressValueStyle}>
                                {progress.completed_count ?? progress.completed_lessons?.length ?? 0}
                            </h3>
                        </div>

                        <div style={progressCardStyle}>
                            <p style={progressLabelStyle}>Total Lessons</p>
                            <h3 style={progressValueStyle}>{progress.total_lessons ?? 0}</h3>
                        </div>

                        <div style={progressCardStyle}>
                            <p style={progressLabelStyle}>Progress</p>
                            <h3 style={progressValueStyle}>{progress.progress_percent ?? 0}%</h3>
                        </div>

                        <div style={progressCardStyle}>
                            <p style={progressLabelStyle}>Total Quiz Score</p>
                            <h3 style={progressValueStyle}>{progress.total_score ?? progress.score ?? 0}</h3>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#b8b8b8' }}>Loading progress...</p>
                )}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 1fr 1.4fr',
                    gap: '22px',
                    alignItems: 'start',
                }}
            >
                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <BookOpen size={22} color="#e2d3a1" />
                        <h2 style={panelTitleStyle}>Learning Modules</h2>
                    </div>

                    {loadingModules ? (
                        <p style={{ color: '#b8b8b8' }}>Loading modules...</p>
                    ) : modules.length === 0 ? (
                        <p style={{ color: '#b8b8b8' }}>No modules found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {modules.map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => handleModuleClick(module)}
                                    style={{
                                        ...itemButtonStyle,
                                        border:
                                            selectedModule?.id === module.id
                                                ? '1px solid #d4c28a'
                                                : '1px solid #232323',
                                        background:
                                            selectedModule?.id === module.id ? '#141414' : '#090909',
                                        boxShadow:
                                            selectedModule?.id === module.id
                                                ? '0 0 0 1px rgba(212,194,138,0.08)'
                                                : 'none',
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                margin: '0 0 8px 0',
                                                fontSize: '18px',
                                                color: '#ffffff',
                                                fontWeight: '600',
                                            }}
                                        >
                                            {module.title}
                                        </h3>
                                        <p
                                            style={{
                                                margin: '0 0 6px 0',
                                                color: '#b5b5b5',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                            }}
                                        >
                                            {module.description || 'No description available'}
                                        </p>
                                        <span style={{ fontSize: '13px', color: '#d4c28a' }}>
                                            Level: {module.level}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <PlayCircle size={22} color="#e2d3a1" />
                        <h2 style={panelTitleStyle}>Lessons</h2>
                    </div>

                    {!selectedModule ? (
                        <p style={{ color: '#b8b8b8' }}>Select a module to view lessons.</p>
                    ) : loadingLessons ? (
                        <p style={{ color: '#b8b8b8' }}>Loading lessons...</p>
                    ) : lessons.length === 0 ? (
                        <p style={{ color: '#b8b8b8' }}>No lessons available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {lessons.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(lesson.id)}
                                    style={{
                                        ...itemButtonStyle,
                                        border:
                                            selectedLesson?.id === lesson.id
                                                ? '1px solid #d4c28a'
                                                : '1px solid #232323',
                                        background:
                                            selectedLesson?.id === lesson.id ? '#141414' : '#090909',
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                margin: '0 0 6px 0',
                                                fontSize: '17px',
                                                color: '#ffffff',
                                                fontWeight: '600',
                                            }}
                                        >
                                            {lesson.title}
                                        </h3>
                                        <p style={{ margin: 0, color: '#9a9a9a', fontSize: '13px' }}>
                                            Lesson ID: {lesson.id}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <CheckCircle size={22} color="#e2d3a1" />
                        <h2 style={panelTitleStyle}>Lesson Details & Quiz</h2>
                    </div>

                    {!selectedLesson ? (
                        <p style={{ color: '#b8b8b8' }}>
                            Select a lesson to view details and attempt the quiz.
                        </p>
                    ) : loadingLessonDetails ? (
                        <p style={{ color: '#b8b8b8' }}>Loading lesson details...</p>
                    ) : (
                        <div>
                            <h3
                                style={{
                                    fontSize: '24px',
                                    marginBottom: '14px',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                }}
                            >
                                {selectedLesson.title}
                            </h3>

                            <div style={lessonSectionStyle}>
                                <strong style={{ color: '#e2d3a1' }}>Notes:</strong>
                                <p
                                    style={{
                                        marginTop: '10px',
                                        color: '#d0d0d0',
                                        lineHeight: '1.7',
                                    }}
                                >
                                    {selectedLesson.notes}
                                </p>
                            </div>

                            <div style={lessonSectionStyle}>
                                <strong style={{ color: '#e2d3a1' }}>Video:</strong>
                                <p style={{ marginTop: '10px' }}>
                                    <a
                                        href={selectedLesson.video_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            color: '#e2d3a1',
                                            textDecoration: 'none',
                                            borderBottom: '1px solid #5f573b',
                                        }}
                                    >
                                        Open Lesson Video
                                    </a>
                                </p>
                            </div>

                            <div style={lessonSectionStyle}>
                                <strong style={{ color: '#e2d3a1' }}>Quiz:</strong>

                                {selectedLesson.quiz && selectedLesson.quiz.length > 0 ? (
                                    <div style={{ marginTop: '14px' }}>
                                        {selectedLesson.quiz.map((q, index) => (
                                            <div key={index} style={quizCardStyle}>
                                                <p
                                                    style={{
                                                        fontWeight: '600',
                                                        marginBottom: '12px',
                                                        color: '#ffffff',
                                                    }}
                                                >
                                                    Q{index + 1}. {q.question}
                                                </p>

                                                <div style={{ display: 'grid', gap: '10px' }}>
                                                    {q.options.map((option, optIndex) => (
                                                        <label
                                                            key={optIndex}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                cursor: 'pointer',
                                                                color: '#d1d1d1',
                                                            }}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${index}`}
                                                                value={option}
                                                                checked={quizAnswers[index] === option}
                                                                onChange={() => handleAnswerChange(index, option)}
                                                                style={{ accentColor: '#d4c28a' }}
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                flexWrap: 'wrap',
                                                marginTop: '16px',
                                            }}
                                        >
                                            <button
                                                onClick={handleQuizSubmit}
                                                disabled={submittingQuiz}
                                                style={{
                                                    ...primaryButtonStyle,
                                                    background: submittingQuiz ? '#202020' : '#111111',
                                                    border: '1px solid #2c2c2c',
                                                    color: '#ffffff',
                                                }}
                                            >
                                                {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                                            </button>

                                            <button
                                                onClick={handleMarkComplete}
                                                disabled={markingComplete}
                                                style={{
                                                    ...primaryButtonStyle,
                                                    background: markingComplete ? '#1a1a1a' : '#111111',
                                                    border: '1px solid #2f4f39',
                                                    color: '#8df0b0',
                                                }}
                                            >
                                                {markingComplete ? 'Saving...' : 'Mark Lesson Complete'}
                                            </button>
                                        </div>

                                        {quizResult && (
                                            <div
                                                style={{
                                                    marginTop: '18px',
                                                    padding: '14px',
                                                    borderRadius: '12px',
                                                    background: '#070707',
                                                    border: '1px solid #232323',
                                                }}
                                            >
                                                <h4
                                                    style={{
                                                        margin: '0 0 10px 0',
                                                        color: '#e2d3a1',
                                                        fontSize: '18px',
                                                    }}
                                                >
                                                    Your Score: {quizResult.score} /{' '}
                                                    {quizResult.total_questions || quizResult.total}
                                                </h4>

                                                {quizResult.results && quizResult.results.length > 0 && (
                                                    <div style={{ marginTop: '12px' }}>
                                                        {quizResult.results.map((result, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    padding: '12px',
                                                                    marginBottom: '10px',
                                                                    borderRadius: '10px',
                                                                    background: result.is_correct ? '#0d1610' : '#1a1010',
                                                                    border: result.is_correct
                                                                        ? '1px solid #1f5e35'
                                                                        : '1px solid #5f2626',
                                                                }}
                                                            >
                                                                <p
                                                                    style={{
                                                                        margin: 0,
                                                                        fontWeight: 600,
                                                                        color: '#ffffff',
                                                                    }}
                                                                >
                                                                    {result.question}
                                                                </p>
                                                                <p style={{ margin: '6px 0 0 0', color: '#cfcfcf' }}>
                                                                    Your Answer: {result.your_answer || 'Not answered'}
                                                                </p>
                                                                <p style={{ margin: '4px 0 0 0', color: '#cfcfcf' }}>
                                                                    Correct Answer: {result.correct_answer}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p style={{ marginTop: '10px', color: '#b8b8b8' }}>
                                        No quiz available for this lesson.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const topPanelStyle = {
    background: '#0b0b0b',
    borderRadius: '18px',
    padding: '22px',
    marginBottom: '24px',
    border: '1px solid #202020',
};

const panelStyle = {
    background: '#0b0b0b',
    borderRadius: '18px',
    padding: '20px',
    minHeight: '500px',
    border: '1px solid #202020',
};

const panelHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
};

const panelTitleStyle = {
    margin: 0,
    fontSize: '26px',
    color: '#ffffff',
    fontWeight: '700',
};

const itemButtonStyle = {
    width: '100%',
    textAlign: 'left',
    borderRadius: '14px',
    padding: '16px',
    cursor: 'pointer',
    color: '#ffffff',
    transition: 'all 0.2s ease',
};

const lessonSectionStyle = {
    marginBottom: '18px',
    padding: '14px',
    borderRadius: '12px',
    background: '#050505',
    border: '1px solid #232323',
};

const quizCardStyle = {
    marginTop: '14px',
    padding: '14px',
    borderRadius: '12px',
    background: '#080808',
    border: '1px solid #232323',
};

const primaryButtonStyle = {
    padding: '12px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
};

const progressCardStyle = {
    background: '#050505',
    padding: '16px 18px',
    borderRadius: '14px',
    minWidth: '180px',
    border: '1px solid #232323',
};

const progressLabelStyle = {
    margin: 0,
    color: '#a6a6a6',
    fontSize: '14px',
};

const progressValueStyle = {
    margin: '10px 0 0 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
};

export default LearningModelPage;