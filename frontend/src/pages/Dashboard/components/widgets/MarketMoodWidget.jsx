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
                padding: '1.25rem', // Reduced padding
                borderRadius: '16px', // Slightly smaller radius
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
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
                fontSize: '0.85rem', // Smaller header
                color: 'var(--color-text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
            }}>
                <span style={{ fontWeight: '600', letterSpacing: '0.3px' }}>Market Mood Index</span>
                <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
            </div>

            {/* Main Center Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>

                {/* Big Gauge */}
                <div style={{
                    width: '130px', height: '80px', position: 'relative', // Smaller Gauge
                    filter: `drop-shadow(0 0 20px ${activeColor}25)`,
                    marginBottom: '0.25rem'
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: score }, { value: 100 - score }]}
                                cx="50%"
                                cy="80%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={45} // Reduced radii
                                outerRadius={60}
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
                        position: 'absolute', bottom: '16px', left: '64px', // Adjusted for new center
                        width: '2px', height: '45px', background: '#fff',
                        transform: 'rotate(-45deg)', transformOrigin: 'bottom center',
                        borderRadius: '2px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    }} />
                    {/* Score Text in Center */}
                    <div style={{
                        position: 'absolute', bottom: '-8px', width: '100%', textAlign: 'center',
                        fontSize: '1.5rem', fontWeight: '800', color: activeColor // Smaller score
                    }}>
                        {Math.round(score)}
                    </div>
                </div>

                {/* Zone Text */}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0px' }}>Current Zone</div>
                    <div style={{
                        fontSize: '1.5rem', // Smaller Zone Text
                        fontWeight: '700',
                        color: activeColor,
                        lineHeight: '1.2',
                        letterSpacing: '-0.3px',
                        textShadow: `0 0 15px ${activeColor}30`
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
