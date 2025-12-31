import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MiniGauge = ({ score }) => {
    // Tickertape colors
    const getColor = (s) => {
        if (s < 30) return '#00C853'; // Extreme Fear (Green)
        if (s < 50) return '#CDDC39'; // Fear (Lime)
        if (s < 70) return '#FFB300'; // Greed (Gold)
        return '#FF5252'; // Extreme Greed (Red)
    };

    const activeColor = getColor(score);

    return (
        <div style={{ width: '28px', height: '28px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={[{ value: score }, { value: 100 - score }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={8}
                        outerRadius={14}
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
            gap: '6px',
            opacity: isToday ? 1 : 0.7
        }}>
            <MiniGauge score={score} />
            <div style={{
                fontSize: '0.6rem',
                color: isToday ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: isToday ? '700' : '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {day}
            </div>
        </div>
    );
};

const MarketMoodWidget = () => {
    const navigate = useNavigate();
    const score = 24.42;

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
                padding: '0 2rem', // Horizontal padding only, flex handles vertical
                borderRadius: '20px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(145deg, rgba(30,30,30,0.6) 0%, rgba(20,20,20,0.8) 100%)',
                minWidth: '0'
            }}
        >
            {/* Left Section: Current Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>

                {/* Gauge Container */}
                <div style={{
                    width: '70px', height: '70px', position: 'relative', flexShrink: 0,
                    filter: 'drop-shadow(0 0 10px rgba(0, 200, 83, 0.2))'
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: score }, { value: 100 - score }]}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={24}
                                outerRadius={34}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#00C853" />
                                <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Needle */}
                    <div style={{
                        position: 'absolute', bottom: '35px', left: '34px',
                        width: '2px', height: '28px', background: '#fff',
                        transform: 'rotate(-45deg)', transformOrigin: 'bottom center',
                        borderRadius: '2px'
                    }} />
                </div>

                {/* Text Info */}
                <div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-text-secondary)',
                        fontWeight: '500',
                        marginBottom: '4px',
                        letterSpacing: '0.2px'
                    }}>
                        The market is in
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#00C853',
                        lineHeight: '1',
                        letterSpacing: '-0.5px'
                    }}>
                        Fear zone
                    </div>
                </div>
            </div>

            {/* Right Section: Historical Dots */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Divider */}
                <div style={{
                    height: '50px',
                    width: '1px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    marginRight: '2rem'
                }} />

                <div style={{ display: 'flex', gap: '1.5rem', marginRight: '1rem' }}>
                    {history.map((item, idx) => (
                        <HistoricalDot key={idx} {...item} />
                    ))}
                </div>

                <ChevronRight size={20} color="var(--color-text-tertiary)" />
            </div>
        </div>
    );
};

export default MarketMoodWidget;
