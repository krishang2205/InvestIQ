import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Sparkles, Zap, ShieldAlert, ChevronRight, Info, Loader2 } from 'lucide-react';

const AIChatBot = ({ isOpen, onClose, reportData, jobId }) => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'simulate'
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hi! I'm KIMS AI—your personal Market Saarathi (named after your project creators: Krishang, Ishan, Mohit). I've analyzed the report for ${reportData?.header?.company}. How can I help you understand it today?` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:5001/api/v2/reports/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    message: inputValue,
                    history: messages.slice(-6)
                })
            });
            const data = await res.json();
            if (data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Is the backend running?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSimulate = async (catalyst) => {
        setIsSimulating(true);
        setSimulationResult(null);
        setActiveTab('simulate');

        try {
            const res = await fetch('http://localhost:5001/api/v2/reports/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    catalyst: catalyst
                })
            });
            const data = await res.json();
            setSimulationResult(data);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setIsSimulating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="glass-panel animate-fade-in" style={{
            position: 'fixed',
            bottom: '90px',
            right: '25px',
            width: '400px',
            height: '600px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid var(--color-accent-glow)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem',
                background: 'linear-gradient(90deg, rgba(209, 199, 157, 0.1) 0%, rgba(0,0,0,0) 100%)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-bg)',
                        boxShadow: '0 0 10px var(--color-accent-glow)',
                        animation: 'pulse 2s infinite'
                    }}>
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <h4 style={{ 
                                fontSize: '1rem', 
                                fontWeight: 800, 
                                margin: 0,
                                background: 'linear-gradient(90deg, #fff 0%, var(--color-accent) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.5px'
                            }}>KIMS AI</h4>
                            <span className="shimmer" style={{ 
                                fontSize: '0.6rem', 
                                padding: '2px 6px', 
                                background: 'var(--color-accent)', 
                                color: 'var(--color-bg)', 
                                borderRadius: '4px', 
                                fontWeight: 800,
                                letterSpacing: '1px',
                                textShadow: '0 0 5px rgba(0,0,0,0.3)'
                            }}>PRO</span>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--color-secondary)', margin: 0, fontWeight: 500 }}>Market Saarathi • {reportData?.header?.symbol}</p>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: '4px' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                padding: '0.5rem',
                gap: '0.5rem',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <button 
                    onClick={() => setActiveTab('chat')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: activeTab === 'chat' ? 'rgba(209, 199, 157, 0.1)' : 'transparent',
                        color: activeTab === 'chat' ? 'var(--color-accent)' : 'var(--color-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <MessageSquare size={14} /> Chat
                </button>
                <button 
                    onClick={() => setActiveTab('simulate')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: activeTab === 'simulate' ? 'rgba(209, 199, 157, 0.1)' : 'transparent',
                        color: activeTab === 'simulate' ? 'var(--color-accent)' : 'var(--color-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Zap size={14} /> Simulator
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }} className="custom-scrollbar">
                {activeTab === 'chat' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                marginBottom: '1.25rem',
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {msg.role === 'assistant' ? 'KIMS AI' : 'You'}
                                        </span>
                                        {msg.role === 'assistant' && (
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', color: '#fff' }}>✓</div>
                                        )}
                                    </div>
                                    <div style={{
                                        padding: '0.875rem 1rem',
                                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                        color: msg.role === 'user' ? 'var(--color-bg)' : 'var(--color-primary)',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                                        boxShadow: msg.role === 'assistant' ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                                    }}>
                                        {msg.content}
                                    </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem' }}>
                                <div className="skeleton-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%' }}></div>
                                <div className="skeleton-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%' }}></div>
                                <div className="skeleton-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {!simulationResult && !isSimulating && (
                            <>
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <div style={{ width: '48px', height: '48px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-accent-glow)', borderRadius: '50%', color: 'var(--color-accent)' }}>
                                        <Zap size={24} />
                                    </div>
                                    <h5 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>KIMS Catalyst</h5>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>Predict market impact based on real-world events. High-fidelity intelligence enabled.</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {["Fed Rate Hike by 50bps", "Crude Oil Price Spike", "Regional Supply Chain Crisis", "Major Competitor Merger"].map(s => (
                                        <button key={s} onClick={() => handleSimulate(s)} style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--color-primary)', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {s} <ChevronRight size={14} color="var(--color-secondary)" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {isSimulating && (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-accent)', margin: '0 auto 1rem' }} />
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Analyzing dependencies...</p>
                            </div>
                        )}
                        {simulationResult && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Impact Score</span>
                                    <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0', color: simulationResult.impact_score > 50 ? 'var(--color-risk-low)' : 'var(--color-risk-high)' }}>{simulationResult.impact_score}/100</div>
                                    <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: simulationResult.sentiment === 'Bullish' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: simulationResult.sentiment === 'Bullish' ? 'var(--color-risk-low)' : 'var(--color-risk-high)' }}>{simulationResult.sentiment}</div>
                                </div>
                                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>AI Insights</div>
                                    <p style={{ color: 'var(--color-secondary)' }}>{simulationResult.reasoning}</p>
                                </div>
                                <button onClick={() => setSimulationResult(null)} style={{ padding: '0.75rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontWeight: 600, cursor: 'pointer' }}>Reset Simulator</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Footer (Chat only) */}
            {activeTab === 'chat' && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ 
                        display: 'flex', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '16px', 
                        padding: '0.5rem', 
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s'
                    }}>
                        <input 
                            type="text" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type reaching the Alpha..." 
                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem 0.8rem', outline: 'none', fontSize: '0.9rem' }} 
                        />
                        <button 
                            onClick={handleSendMessage} 
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '12px', 
                                backgroundColor: 'var(--color-accent)', 
                                color: 'var(--color-bg)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px var(--color-accent-glow)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Send size={18} fill="currentColor" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChatBot;
