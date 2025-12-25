import React from 'react';
import { Settings2 } from 'lucide-react';

const PREFERENCE_OPTIONS = [
    { id: 'fundamental', label: 'Fundamental Analysis', desc: 'Financial health, ratios, and growth.' },
    { id: 'technical', label: 'Technical Indicators', desc: 'Moving averages, RSI, and trends.' },
    { id: 'sentiment', label: 'Market Sentiment', desc: 'News aggregation and social volume.' },
    { id: 'macro', label: 'Macro Environment', desc: 'Sector trends and economic impact.' },
];

const AnalysisPreferences = ({ preferences, onToggle }) => {
    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '2rem auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Settings2 size={18} color="var(--color-secondary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Analysis Preferences
                </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {PREFERENCE_OPTIONS.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => onToggle(option.id)}
                        className="glass-panel"
                        style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: preferences[option.id]
                                ? '1px solid var(--color-accent)'
                                : '1px solid var(--glass-border)',
                            background: preferences[option.id]
                                ? 'rgba(209, 199, 157, 0.05)'
                                : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div>
                            <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                                {option.label}
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                                {option.desc}
                            </p>
                        </div>

                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            border: preferences[option.id]
                                ? 'none'
                                : '2px solid var(--color-secondary)',
                            backgroundColor: preferences[option.id]
                                ? 'var(--color-accent)'
                                : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {preferences[option.id] && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnalysisPreferences;
