import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MiniGauge = ({ score }) => {
    const data = [
        { value: score, color: score < 30 ? '#00C853' : score < 50 ? '#FFCA28' : score < 70 ? '#FFA726' : '#FF4D4D' }, // Color logic: Fear is Green/Orange usually reversed in MMI? 
        // Tickertape MMI: Extreme Fear (Green), Fear (Lime), Greed (Orange), Extreme Greed (Red).
        { value: 100 - score, color: 'rgba(255,255,255,0.1)' }
    ];

    // Tickertape colors approximation
    const getColor = (s) => {
        if (s < 30) return '#00C853'; // Extreme Fear (Buying opportunity)
        if (s < 50) return '#CDDC39'; // Fear
        if (s < 70) return '#FFB300'; // Greed
        return '#FF5252'; // Extreme Greed
    };

    const activeColor = getColor(score);

    return (
        <div style={{ width: '24px', height: '24px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={[{ value: score }, { value: 100 - score }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={8}
                        outerRadius={12}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={activeColor} />
                        <Cell fill="rgba(255,255,255,0.1)" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const HistoricalDot = ({ day, score, isToday }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <MiniGauge score={score} />
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{day}</div>
            {isToday && (
                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)' }}>2:45pm</div>
            )}
        </div>
    );
};

const MarketMoodWidget = () => {
    const navigate = useNavigate();
    const score = 24.42; // Example "Extreme Fear"

    // Historical Data (Mock)
    const history = [
        { day: 'Wed', score: 45 },
        { day: 'Fri', score: 38 },
        { day: 'Mon', score: 32 },
        { day: 'Tue', score: 28 },
        { day: 'Today', score: 24.42, isToday: true },
    ];

    return (
        <div
            className="glass-panel shadow-soft-lift"
            onClick={() => navigate('/dashboard/market-mood-index')}
            style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                minWidth: '0' // Prevent flex overflow
            }}
        >
            {/* Left Section: Current Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                <div style={{ width: '60px', height: '60px', position: 'relative', flexShrink: 0 }}>
                    {/* Semi Circle Gauge for Main Display */}
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: score }, { value: 100 - score }]}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={22}
                                outerRadius={30}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#00C853" /> {/* Extreme Fear Color */}
                                <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Needle Placeholder (CSS) */}
                    <div style={{
                        position: 'absolute', bottom: '30px', left: '29px',
                        width: '2px', height: '26px', background: '#fff',
                        transform: 'rotate(-45deg)', transformOrigin: 'bottom center'
                    }} />
                </div>
                <div style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: '2px' }}>
                        The market is in
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#00C853', lineHeight: '1' }}>
                        Fear zone
                    </div>
                </div>
            </div>

            {/* Right Section: Historical Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {history.map((item, idx) => (
                        <HistoricalDot key={idx} {...item} />
                    ))}
                </div>
                <div style={{
                    height: '40px',
                    width: '1px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    margin: '0 0.5rem'
                }} />
                <ChevronRight size={24} color="var(--color-text-secondary)" />
            </div>
        </div>
    );
};

export default MarketMoodWidget;
