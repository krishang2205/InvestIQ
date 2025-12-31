import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MarketMoodWidget = () => {
    const score = 72;
    // Animation state
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Animate score on mount
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            setAnimatedScore(Math.round(score * ease));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [score]);

    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];

    const getColor = (val) => {
        if (val < 30) return '#FF4D4D';
        if (val < 50) return '#FFCA28';
        if (val < 70) return '#66BB6A';
        return '#00C853';
    };

    const activeColor = getColor(score);
    // Darker inactive part for "premium" feel
    const COLORS = [activeColor, 'rgba(255,255,255,0.1)'];

    // Needle rotation calculation
    // -90deg is left (0), 90deg is right (100)
    // Formula: (value / 100) * 180 - 90
    const rotation = (animateScore) => (animateScore / 100) * 180 - 90;

    return (
        <div className="glass-panel shadow-soft-lift"
            style={{
                padding: '1.5rem',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>

            {/* Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', zIndex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Market Mood Index
                </h3>
                <div style={{
                    fontSize: '0.75rem',
                    color: activeColor,
                    backgroundColor: `${activeColor}15`,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '500'
                }}>
                    Live
                </div>
            </div>

            {/* Gauge Area */}
            <div style={{ width: '100%', height: '160px', position: 'relative', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={85}
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="cell-0" fill={COLORS[0]} style={{ filter: `drop-shadow(0 0 8px ${activeColor}40)` }} />
                            <Cell key="cell-1" fill={COLORS[1]} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Needle */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    width: '4px',
                    height: '90px',
                    backgroundColor: '#fff',
                    transformOrigin: 'bottom center',
                    transform: `translateX(-50%) rotate(${rotation(animatedScore)}deg)`,
                    zIndex: 2,
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }} />

                {/* Center Hub */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    zIndex: 3,
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }} />

                {/* Score Label inside arch */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    width: '100%',
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: activeColor,
                        lineHeight: '1',
                        textShadow: `0 0 20px ${activeColor}30`
                    }}>
                        {animatedScore}
                    </div>
                </div>
            </div>

            {/* Status Text */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', zIndex: 1 }}>
                <div style={{
                    color: activeColor,
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    marginBottom: '0.25rem'
                }}>
                    Extreme Greed
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: '200px', margin: '0 auto' }}>
                    Markets are overbought. Exercise caution.
                </p>
            </div>

            {/* Background Glow Mesh */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `radial-gradient(circle at 50% 100%, ${activeColor}10 0%, transparent 60%)`,
                pointerEvents: 'none',
                zIndex: 0
            }} />
        </div>
    );
};

export default MarketMoodWidget;
