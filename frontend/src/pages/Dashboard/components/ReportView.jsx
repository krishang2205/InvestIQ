import React from 'react';
import { CheckCircle2, AlertCircle, ArrowLeft, Download, Share2 } from 'lucide-react';

const ReportView = ({ data, onBack }) => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none', color: 'var(--color-secondary)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} /> Back to Search
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="icon-btn"><Download size={20} /></button>
                    <button className="icon-btn"><Share2 size={20} /></button>
                </div>
            </div>

            {/* Title Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {data.company.name}
                </h1>
                <div style={{
                    display: 'flex', gap: '1rem', justifyContent: 'center',
                    color: 'var(--color-secondary)', fontSize: '0.875rem'
                }}>
                    <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                        {data.company.symbol}
                    </span>
                    <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                        {data.company.sector}
                    </span>
                    <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                        {data.company.marketCap}
                    </span>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-secondary)', fontStyle: 'italic' }}>
                    Generated: {data.meta.generatedOn} | Period: {data.meta.dataPeriod}
                </p>
            </div>

            {/* Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {data.sections.map((section, index) => (
                    <div key={index} className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-primary)' }}>
                            {section.title}
                        </h3>

                        {section.content && (
                            <p style={{ lineHeight: '1.6', color: 'var(--color-secondary)', marginBottom: '1rem' }}>
                                {section.content}
                            </p>
                        )}

                        {/* Special Layout: Key Points */}
                        {section.keyPoints && (
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-secondary)', lineHeight: '1.8' }}>
                                {section.keyPoints.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        )}

                        {/* Special Layout: Consistency Check */}
                        {section.type === 'consistency' && (
                            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                {section.points.map((point, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 600, display: 'block' }}>{point.label}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{point.desc}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            color: point.status === 'Aligned' ? 'var(--color-risk-low)' : 'var(--color-accent)'
                                        }}>
                                            <CheckCircle2 size={16} />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{point.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Special Layout: Highlight Box */}
                        {(section.insight || section.highlight || section.takeaway) && (
                            <div style={{
                                marginTop: '1.5rem', padding: '1rem',
                                background: 'rgba(209, 199, 157, 0.1)',
                                borderLeft: '4px solid var(--color-accent)',
                                borderRadius: '0 8px 8px 0',
                                color: 'var(--color-primary)',
                                fontStyle: 'italic'
                            }}>
                                <strong>Insight: </strong>
                                {section.insight || section.highlight || section.takeaway}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                {data.meta.disclaimer}
            </div>
        </div>
    );
};

export default ReportView;
