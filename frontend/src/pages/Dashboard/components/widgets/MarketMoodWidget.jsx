import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MiniGauge = ({ score }) => {
    const getColor = (s) => {
        if (s < 30) return '#00C853'; // Extreme Fear
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
                        innerRadius={6}
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            opacity: isToday ? 1 : 0.6
        }}>
            <MiniGauge score={score} />
            <div style={{
                fontSize: '0.65rem',
                color: isToday ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: isToday ? '700' : '400',
                textTransform: 'uppercase'
            }}>
                {day}
            </div>
        </div>
    );
};

const MarketMoodWidget = () => {
    const navigate = useNavigate();
    const score = 24.42;
    const activeColor = '#00C853';

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
                padding: '1.5rem',
                borderRadius: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column', // Vertical Stack
                justifyContent: 'space-between',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(145deg, rgba(30,30,30,0.8) 0%, rgba(10,10,10,0.95) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <span style={{ fontWeight: '600', letterSpacing: '0.5px' }}>Market Mood Index</span>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
            </div>

            {/* Main Center Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>

                {/* Big Gauge */}
                <div style={{
                    width: '160px', height: '100px', position: 'relative', // Adjusted height for semi-circle aspect
                    filter: `drop-shadow(0 0 25px ${activeColor}30)`,
                    marginBottom: '0.5rem'
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: score }, { value: 100 - score }]}
                                cx="50%"
                                cy="80%"  // Move center down to use more space for top arc
                                startAngle={180}
                                endAngle={0}
                                innerRadius={55}
                                outerRadius={75}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={activeColor} />
                                <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Needle */}
                    <div style={{
                        position: 'absolute', bottom: '20px', left: '79px', // Centered relative to width
                        width: '2px', height: '60px', background: '#fff',
                        transform: 'rotate(-45deg)', transformOrigin: 'bottom center',
                        borderRadius: '2px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    }} />
                    {/* Score Text in Center */}
                    <div style={{
                        position: 'absolute', bottom: '-10px', width: '100%', textAlign: 'center',
                        fontSize: '2rem', fontWeight: '800', color: activeColor
                    }}>
                        {Math.round(score)}
                    </div>
                </div>

                {/* Zone Text */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Current Zone</div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: activeColor,
                        lineHeight: '1',
                        letterSpacing: '-0.5px',
                        textShadow: `0 0 20px ${activeColor}40`
                    }}>
                        Fear
                    </div>
                </div>
            </div>

            {/* Middle Divider */}
            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: '1rem' }} />

            {/* Bottom Section: Historical Dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                {history.map((item, idx) => (
                    <HistoricalDot key={idx} {...item} />
                ))}
            </div>
        </div>
    );
};

export default MarketMoodWidget;
