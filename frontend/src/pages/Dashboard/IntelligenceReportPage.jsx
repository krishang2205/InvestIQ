import React, { useState, useEffect, useRef } from 'react';
import { FileText, Sparkles, Download, Loader2, AlertTriangle } from 'lucide-react';
import StockSearch from './components/StockSearch';
import ReportScope from './components/ReportScope';
import AnalysisPreferences from './components/AnalysisPreferences';
import ReportView from './components/ReportView';

const IntelligenceReportPage = () => {
    const [selectedStock, setSelectedStock] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [credits, setCredits] = useState(5);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loadingStage, setLoadingStage] = useState('');
    const [preferences, setPreferences] = useState({
        fundamental: true,
        technical: true,
        sentiment: true,
        macro: false
    });

    const pollIntervalRef = useRef(null);

    useEffect(() => {
        fetchHistory();
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/v2/reports/history');
            const data = await res.json();
            if (data.status === 'success') {
                setHistory(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const togglePreference = (id) => {
        setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleGenerate = async () => {
        if (credits <= 0 || !selectedStock) return;

        setIsGenerating(true);
        setError(null);
        setLoadingStage('Initiating Analysis Engine...');

        try {
            // Using a dummy user_id for demonstration (replace with actual auth context in prod)
            const payload = { 
                symbol: selectedStock.symbol || selectedStock.name, 
                preferences,
                user_id: "00000000-0000-0000-0000-000000000000" 
            };

            const res = await fetch('http://localhost:5001/api/v2/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const jobId = data.job_id;
            setLoadingStage('Processing Multi-Agent Synthesis...');
            setCredits(prev => prev - 1);
            startPolling(jobId);
        } catch (err) {
            setError(err.message);
            setIsGenerating(false);
        }
    };

    const startPolling = (jobId) => {
        let attempts = 0;
        pollIntervalRef.current = setInterval(async () => {
            attempts++;
            if (attempts > 20) { // 60s timeout
                clearInterval(pollIntervalRef.current);
                setError('Report generation timed out.');
                setIsGenerating(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:5001/api/v2/reports/status/${jobId}`);
                const data = await res.json();

                if (data.status === 'completed') {
                    clearInterval(pollIntervalRef.current);
                    // Inject job_id for the chat context
                    setReportData({ ...data.report_data, job_id: jobId });
                    setIsGenerating(false);
                    fetchHistory();
                } else if (data.status === 'failed') {
                    clearInterval(pollIntervalRef.current);
                    setError(data.error || 'Generation failed. Please try again later.');
                    setIsGenerating(false);
                } else {
                    setLoadingStage(prev => 
                        prev.includes('Synthesis') ? 'Finalizing Output JSON Format...' : 'Processing Multi-Agent Synthesis...'
                    );
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    };

    const handleBack = () => {
        setReportData(null);
        setSelectedStock(null);
        setError(null);
    };

    const loadHistoricalReport = (data, id) => {
        if (data) setReportData({ ...data, job_id: id });
    };

    if (reportData) {
        return <ReportView data={reportData} onBack={handleBack} />;
    }

    return (
        <>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Intelligence <span className="text-gradient-gold">Report</span>
                    </h1>
                    <p style={{ color: 'var(--color-secondary)' }}>
                        Generate AI-powered insights for your portfolio.
                    </p>
                </div>

                <div className="glass-panel" style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    border: credits > 0 ? '1px solid var(--color-accent)' : '1px solid var(--color-risk-high)'
                }}>
                    <Sparkles size={16} color={credits > 0 ? "var(--color-accent)" : "var(--color-risk-high)"} />
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{credits}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>credits left</span>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-risk-high)', borderRadius: '8px', color: 'var(--color-risk-high)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

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
                    {isGenerating ? <Loader2 className="animate-spin" size={40} /> : <Sparkles size={40} />}
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                    {isGenerating ? loadingStage : (selectedStock ? `Analyze ${selectedStock.name}` : 'Generate New Report')}
                </h2>
                <p style={{ color: 'var(--color-secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
                    {isGenerating ? 'Please wait while our models cross-reference data. This usually takes 10-20 seconds.' :
                     (selectedStock ? 'Customize your analysis preferences below.' : 'Search for a stock to begin the analysis.')}
                </p>

                {!selectedStock && !isGenerating && <StockSearch onSelect={setSelectedStock} />}

                {selectedStock && !isGenerating && (
                    <>
                        <AnalysisPreferences preferences={preferences} onToggle={togglePreference} />
                        <ReportScope />
                    </>
                )}

                {selectedStock && (
                    <button style={{
                        padding: '0.875rem 2rem',
                        backgroundColor: (isGenerating || credits <= 0) ? 'var(--color-surface-hover)' : 'var(--color-accent)',
                        color: (isGenerating || credits <= 0) ? 'var(--color-secondary)' : 'var(--color-bg)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        cursor: (isGenerating || credits <= 0) ? 'not-allowed' : 'pointer',
                        marginTop: '1rem',
                        minWidth: '200px',
                        justifyContent: 'center'
                    }}
                        onClick={handleGenerate}
                        disabled={isGenerating || credits <= 0}
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                        {isGenerating ? 'Analyzing...' : (credits > 0 ? 'Generate Report' : 'No Credits')}
                    </button>
                )}

                {selectedStock && !isGenerating && (
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
                    {history.length > 0 ? history.map((item) => (
                        <div key={item.id} className="glass-panel" style={{
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
                                    color: item.status === 'failed' ? 'var(--color-risk-high)' : 'var(--color-secondary)'
                                }}>
                                    {item.status === 'processing' || item.status === 'pending' ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 500 }}>{item.symbol} Analysis</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>Status: {item.status.toUpperCase()}</p>
                                </div>
                            </div>
                            {item.status === 'completed' && (
                                <button onClick={() => loadHistoricalReport(item.report_data, item.id)} style={{
                                    background: 'none',
                                    color: 'var(--color-accent)',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }}>
                                    View Report
                                </button>
                            )}
                        </div>
                    )) : (
                        <p style={{ color: 'var(--color-secondary)', textAlign: 'center' }}>No historical reports found.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default IntelligenceReportPage;

