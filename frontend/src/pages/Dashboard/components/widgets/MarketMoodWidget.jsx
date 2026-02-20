import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useMarketData from '../../../../hooks/useMarketData';

import { MiniGauge, HistoricalDot } from './MarketMoodComponents';

const MarketMoodWidget = () => {
    const navigate = useNavigate();
    // 5 minute refresh for Mood
    const { data, loading, error } = useMarketData('mood', 300000); // Refresh every 5 mins

    // Default/Fallback values
    const score = data?.score || 50;
    const label = data?.label || 'Neutral';
    const zoneColor = data?.zone === 'green' ? '#00C853' :
        data?.zone === 'lightgreen' ? '#B2FF59' :
            data?.zone === 'yellow' ? '#FFEB3B' :
                data?.zone === 'orange' ? '#FF9800' :
                    '#FF5252'; // red

    // Calculate accumulation for needle rotation (0 to 180 degrees)
    // Score 0 -> -90deg (left), Score 100 -> 90deg (right)
    // But our start angle is 180, end is 0. 
    // Recharts Pie start 180 (left) to 0 (right).
    // Needle rotation needs to map 0-100 score to angles.
    // Let's simplify: visually align needle based on score percentage.
    const needleRotation = (score / 100) * 180 - 90;

    if (loading && !data) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                padding: '1.25rem', borderRadius: '16px', height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(145deg, rgba(30,30,30,0.8) 0%, rgba(10,10,10,0.95) 100%)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="skeleton-pulse" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
                    <div className="skeleton-pulse" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="skeleton-pulse" style={{ width: '140px', height: '80px', borderRadius: '70px 70px 0 0', opacity: 0.3 }} />
                    <div className="skeleton-pulse" style={{ width: '60px', height: '24px', marginTop: '1rem', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-pulse" style={{ width: '24px', height: '36px', borderRadius: '4px' }} />)}
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                padding: '1.25rem', borderRadius: '16px', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,50,50,0.1)',
                background: 'linear-gradient(145deg, rgba(40,20,20,0.8) 0%, rgba(20,10,10,0.95) 100%)'
            }}>
                <div style={{ color: '#FF5252', marginBottom: '0.5rem' }}>⚠️</div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Mood Unavailable</span>
                <span style={{ color: 'var(--color-text-dim)', fontSize: '0.75rem', marginTop: '4px' }}>Check connection</span>
            </div>
        );
    }

    return (
        <div
            className="glass-panel shadow-soft-lift"
            onClick={() => navigate('/dashboard/market-mood-index')}
            style={{
                padding: '1.25rem',
                borderRadius: '16px',
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
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <span style={{ fontWeight: '600', letterSpacing: '0.4px' }}>Market Mood Index</span>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
            </div>

            {/* Main Center Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>

                {/* Gauge - Medium Size */}
                <div
                    title="Score derived from India VIX (60%) and Nifty 50 Trend (40%)"
                    style={{
                        width: '100%', maxWidth: '140px', height: '80px', position: 'relative',
                        filter: `drop-shadow(0 0 20px ${zoneColor}25)`,
                        marginBottom: '0.25rem',
                        cursor: 'help'
                    }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: score }, { value: 100 - score }]}
                                cx="50%"
                                cy="90%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={50}
                                outerRadius={70}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={zoneColor} />
                                <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Needle */}
                    <div style={{
                        position: 'absolute', bottom: '10px', left: '69px',
                        width: '2px', height: '50px', background: '#fff',
                        transform: `rotate(${needleRotation}deg)`, transformOrigin: 'bottom center',
                        borderRadius: '2px',
                        transition: 'transform 1s ease-out',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    }} />
                    {/* Score Text in Center */}
                    <div style={{
                        position: 'absolute', bottom: '-15px', width: '100%', textAlign: 'center',
                        fontSize: 'clamp(1.5rem, 5vw, 1.75rem)', fontWeight: '800', color: zoneColor
                    }}>
                        {Math.round(score)}
                    </div>
                </div>

                {/* Zone Text */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0px' }}>Current Zone</div>
                    <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: zoneColor,
                        lineHeight: '1.2',
                        letterSpacing: '-0.3px',
                        textShadow: `0 0 15px ${zoneColor}30`
                    }}>
                        {label}
                    </div>
                </div>
            </div>

            {/* Middle Divider */}
            <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: '1rem' }} />

            {/* Bottom Section: Historical Dots (Static for now, but could be fetched) */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                    Based on market volatility
                </span>
            </div>
        </div>
    );
};

export default MarketMoodWidget;
