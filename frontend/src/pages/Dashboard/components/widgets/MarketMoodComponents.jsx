import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const MiniGauge = ({ score }) => {
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

export const HistoricalDot = ({ day, score, isToday }) => {
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
