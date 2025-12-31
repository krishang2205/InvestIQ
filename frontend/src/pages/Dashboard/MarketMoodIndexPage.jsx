import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Ticker from './components/layout/Ticker';
import DashboardFooter from './components/layout/DashboardFooter';

const MarketMoodIndexPage = () => {
    const navigate = useNavigate();
    const score = 42.42; // Fear

    // MMI Gauge Logic
    const getColor = (s) => {
        if (s < 30) return '#00C853'; // Extreme Fear
        if (s < 50) return '#CDDC39'; // Fear
        if (s < 70) return '#FFB300'; // Greed
        return '#FF5252'; // Extreme Greed
    };
    const activeColor = getColor(score);
    const needleRotation = -180 + (score / 100) * 180;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', overflowY: 'auto' }}>
            <Ticker />

            <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem' }}>
                <div
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: '2rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <ChevronLeft size={20} /> Back to Dashboard
                </div>

                {/* Hero Section */}
                <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                            Market Mood Index
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '3rem' }}>
                            Sentiment analysis of the Indian Stock Market
                        </p>

                        <div style={{ width: '400px', height: '220px', margin: '0 auto', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { value: 30, name: 'Extreme Fear' },
                                            { value: 20, name: 'Fear' },
                                            { value: 20, name: 'Greed' },
                                            { value: 30, name: 'Extreme Greed' }
                                        ]}
                                        cx="50%"
                                        cy="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={100}
                                        outerRadius={150}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#00C853" /> {/* Extreme Fear */}
                                        <Cell fill="#CDDC39" /> {/* Fear */}
                                        <Cell fill="#FFB300" /> {/* Greed */}
                                        <Cell fill="#FF5252" /> {/* Extreme Greed */}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Needle */}
                            <div style={{
                                position: 'absolute',
                                width: '4px',
                                height: '90px',
                                background: '#fff',
                                bottom: '0',
                                left: '50%',
                                transformOrigin: 'bottom center',
                                transform: `translateX(-50%) rotate(${needleRotation}deg)`,
                                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderRadius: '4px 4px 0 0',
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{
                                    width: '12px', height: '12px', background: '#fff',
                                    position: 'absolute', bottom: '-6px', left: '-4px', borderRadius: '50%'
                                }} />
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Current MMI</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: activeColor, textShadow: `0 0 30px ${activeColor}50` }}>
                                {score}
                            </div>
                            <div style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: `${activeColor}20`,
                                color: activeColor,
                                display: 'inline-block',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                marginTop: '0.5rem',
                                border: `1px solid ${activeColor}40`
                            }}>
                                Fear Zone
                            </div>
                        </div>
                    </div>

                    {/* Background Blur Effect */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${activeColor}20 0%, transparent 70%)`,
                        filter: 'blur(40px)',
                        zIndex: 0
                    }} />
                </div>
            </div>

            <div style={{ flex: 1 }}></div>

            <DashboardFooter />
        </div>
    );
};

export default MarketMoodIndexPage;
