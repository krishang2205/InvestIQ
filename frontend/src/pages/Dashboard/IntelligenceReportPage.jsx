import React, { useState } from 'react';
import { FileText, Sparkles, Download } from 'lucide-react';
import StockSearch from './components/StockSearch';

const IntelligenceReportPage = () => {
    const [selectedStock, setSelectedStock] = useState(null);

    return (
        <>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Intelligence <span className="text-gradient-gold">Report</span>
                </h1>
                <p style={{ color: 'var(--color-secondary)' }}>
                    Generate AI-powered insights for your portfolio.
                </p>
            </div>

            <div className="glass-panel" style={{
                padding: '3rem',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
                border: '1px dashed var(--color-accent)',
                background: 'linear-gradient(180deg, rgba(209, 199, 157, 0.05) 0%, rgba(0,0,0,0) 100%)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                    marginBottom: '1.5rem'
                }}>
                    <Sparkles size={40} />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                    {selectedStock ? `Analyze ${selectedStock.name}` : 'Generate New Report'}
                </h2>
                <p style={{ color: 'var(--color-secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
                    {selectedStock
                        ? 'Ready to generate report. This may take a few moments.'
                        : 'Search for a stock to begin the analysis.'}
                </p>

                {!selectedStock && <StockSearch onSelect={setSelectedStock} />}

                {selectedStock && (
                    <button style={{
                        padding: '0.875rem 2rem',
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                        onClick={() => console.log('Generating report for', selectedStock)}
                    >
                        <FileText size={20} />
                        Generate Report
                    </button>
                )}

                {selectedStock && (
                    <button
                        onClick={() => setSelectedStock(null)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-secondary)',
                            marginTop: '1rem',
                            textDecoration: 'underline',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        Select different stock
                    </button>
                )}
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Reports</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel" style={{
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    color: 'var(--color-secondary)'
                                }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Portfolio Analysis - Q{3 - i + 1} 2025</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>Generated on Oct {10 + i}, 2025</p>
                                </div>
                            </div>
                            <button style={{
                                background: 'none',
                                color: 'var(--color-accent)',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Download size={18} />
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default IntelligenceReportPage;
