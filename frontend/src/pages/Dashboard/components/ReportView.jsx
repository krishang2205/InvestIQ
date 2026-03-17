import React, { useState } from 'react';
import { ArrowLeft, Download, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
const reportStyles = `
  .rv-root { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 8rem 1.5rem; }
  .rv-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem; }
  .rv-header-meta { text-align: right; }
  .rv-snapshot-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem; align-items: start; }
  .rv-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
  .rv-outlook-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 4rem; }
  .rv-alpha-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
  .rv-alpha-full { grid-column: 1 / -1; }
  .rv-profile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
  .rv-chart-height { height: 380px; }
  .rv-alt-data-grid { display: grid; grid-template-columns: minmax(220px,1fr) 2fr; gap: 2rem; align-items: center; }
  .rv-peers-table th, .rv-peers-table td { padding: 1rem 1.25rem; }
  
  @media print {
    @page { margin: 1cm; size: A4; }
    
    /* 1. Global Print Reset */
    * { background: transparent !important; color: black !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; }
    html, body { background: white !important; width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; }
    
    /* 2. Hide all non-report elements (Sidebars, Navs, Buttons) */
    nav, aside, header, .sidebar, .navbar, .rv-action-bar, .rv-back-btn, .rv-interactive-tabs, button { 
      display: none !important; 
    }
    
    /* 3. Explicitly show the report and its necessary parents */
    #root, .main-content, .sidebar-layout, .rv-root {
      display: block !important;
      visibility: visible !important;
      background: white !important;
      width: 100% !important;
      height: auto !important;
      padding: 0 !important;
      margin: 0 !important;
      position: static !important;
    }

    /* 4. Card Styling for Printed Reports */
    .glass-panel { 
      background: white !important; 
      color: black !important; 
      border: 1px solid #111 !important; 
      margin-bottom: 25px !important;
      break-inside: avoid !important;
      padding: 20px !important;
      border-radius: 0 !important; /* Professional flat look for print */
    }

    /* 5. Chart & Text Fidelity */
    .rv-chart-height { height: 400px !important; width: 100% !important; }
    h1, h2, h3, h4 { color: black !important; border-bottom: none !important; }
    h3 { border-left: 5px solid black !important; padding-left: 10px !important; margin-top: 20px !important; }
    .rv-header { border-bottom: 2px solid black !important; padding-bottom: 15px !important; }
    
    /* Force specific section visibility */
    .rv-snapshot-grid, .rv-two-col, .rv-outlook-grid { display: grid !important; }
  }

  @media (max-width: 900px) {
    .rv-root { padding: 0 1rem 8rem 1rem; }
    .rv-snapshot-grid { grid-template-columns: 1fr; }
    .rv-two-col { grid-template-columns: 1fr; }
    .rv-outlook-grid { grid-template-columns: 1fr; }
    .rv-alpha-grid { grid-template-columns: 1fr; }
    .rv-alpha-full { grid-column: 1; }
    .rv-profile-grid { grid-template-columns: repeat(2, 1fr); }
    .rv-chart-height { height: 280px; }
    .rv-header-meta { display: none; }
    .rv-alt-data-grid { grid-template-columns: 1fr; }
    .rv-peers-table th, .rv-peers-table td { padding: 0.75rem 0.5rem; font-size: 0.8rem; }
  }
  @media (max-width: 480px) {
    .rv-profile-grid { grid-template-columns: 1fr 1fr; }
    .rv-alpha-grid { grid-template-columns: 1fr; }
  }
`;

const ReportView = ({ data, onBack }) => {
    const [activeTab, setActiveTab] = useState('1Y');

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        document.title = `InvestIQ_Capstone_Report_${data.header.symbol}_${new Date().toISOString().split('T')[0]}`;
        window.print();
        document.title = originalTitle;
    };

    // Helper for Status Pills
    const StatusPill = ({ label, value, type }) => {
        const colors = {
            positive: 'rgba(16, 185, 129, 0.2)', // Green
            neutral: 'rgba(234, 179, 8, 0.2)',   // Yellow
            negative: 'rgba(239, 68, 68, 0.2)'    // Red
        };
        const textColors = {
            positive: '#34d399',
            neutral: '#facc15',
            negative: '#f87171'
        };

        return (
            <div style={{
                background: colors[type] || colors.neutral,
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px'
            }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: textColors[type] || textColors.neutral }}>{value}</span>
            </div>
        );
    };

    // Google Finance Style Metrics & Interactive Timeline Filtering
    const rawChartData = data.priceBehavior?.chartData || [];
    const ratioMap = { '1D': 0.05, '5D': 0.1, '1M': 0.25, '6M': 0.5, 'YTD': 0.75, '1Y': 1.0, '5Y': 1.0, 'Max': 1.0 };
    const sliceLength = Math.max(2, Math.floor(rawChartData.length * ratioMap[activeTab]));
    const chartData = rawChartData.slice(-sliceLength); // Take exactly the N most recent points

    const startPrice = chartData.length > 0 ? chartData[0].price : 0;
    const endPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
    const priceChange = endPrice - startPrice;
    const priceChangePerc = startPrice !== 0 ? ((priceChange / startPrice) * 100).toFixed(2) : 0;
    const isPositive = priceChange >= 0;
    const changeColor = isPositive ? '#10b981' : '#ef4444'; // Green/Red
    const changePrefix = isPositive ? '+' : '';
    const currencyLabel = 'INR';


    return (
        <>
        <style>{reportStyles}</style>
        <div className="rv-root">

            {/* 1. TOP HEADER */}
            <div className="rv-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} className="rv-back-btn" style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{data.header.company}</h1>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600 }}>{data.header.symbol}</span> •
                            <span style={{ padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>{data.header.exchange}</span> •
                            <span style={{ padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>{data.header.sector}</span>
                        </div>
                    </div>
                </div>
                <div className="rv-header-meta">
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{data.header.generatedOn}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>Range: {data.header.dataRange}</p>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-secondary)', border: '1px solid var(--glass-border)' }}>INFORMATIONAL REPORT</span>
                </div>
            </div>

            {/* 2. SNAPSHOT CARD */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <div className="rv-snapshot-grid">
                    <div>
                        <p style={{ color: 'var(--color-text)', lineHeight: '1.6', marginBottom: '1rem' }}>{data.snapshot.description}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {data.snapshot.domains.map(d => (
                                <span key={d} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', border: '1px solid var(--color-secondary)', borderRadius: '1rem', color: 'var(--color-secondary)' }}>
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Key Metrics Grid */}
                    {data.snapshot.keyMetrics && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            {data.snapshot.keyMetrics.map(m => (
                                <div key={m.label}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block' }}>{m.label}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{m.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2.5 CORPORATE METADATA */}
            {data.companyProfile && (
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Corporate Profile</h3>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <div className="rv-profile-grid">
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Executive / Owner</span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0' }}>{data.companyProfile.ceo}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Founded</span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0' }}>{data.companyProfile.founded}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Headquarters</span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0' }}>{data.companyProfile.headquarters}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employees</span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0' }}>{data.companyProfile.employees}</span>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* 3. EXECUTIVE SUMMARY */}
            <div className="glass-panel" style={{ background: 'linear-gradient(180deg, rgba(209, 199, 157, 0.1) 0%, rgba(0,0,0,0) 100%)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    {data.executiveSummary.status.map(s => <StatusPill key={s.label} {...s} />)}
                </div>
                <p style={{ textAlign: 'center', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
                    {data.executiveSummary.text}
                </p>
            </div>

            {/* 4. PRICE BEHAVIOR (Google Finance Clone) */}
            <div style={{ marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(15, 20, 25, 0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 400, letterSpacing: '-1px', lineHeight: 1 }}>₹{endPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            <span style={{ fontSize: '1.25rem', color: 'var(--color-secondary)', fontWeight: 500 }}>{currencyLabel}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem', color: changeColor, fontWeight: 500 }}>
                                {changePrefix}{priceChange.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                ({changePrefix}{priceChangePerc}%)
                            </span>
                            <span style={{ fontSize: '1rem', color: 'var(--color-secondary)' }}>this period</span>
                        </div>
                    </div>

                    <div className="rv-interactive-tabs" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                        {['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'].map(tab => (
                            <span key={tab} 
                                onClick={() => setActiveTab(tab)}
                                style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: tab === activeTab ? 600 : 500, 
                                cursor: 'pointer',
                                color: tab === activeTab ? '#8ab4f8' : 'var(--color-secondary)', 
                                borderBottom: tab === activeTab ? '3px solid #8ab4f8' : 'none',
                                paddingBottom: '0.8rem',
                                marginBottom: '-0.8rem',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}>
                                {tab}
                            </span>
                        ))}
                    </div>

                    <div className="rv-chart-height" style={{ width: '100%', position: 'relative', zIndex: 10 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPriceGF" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={changeColor} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={changeColor} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--color-secondary)" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} tickMargin={10} />
                                <YAxis stroke="var(--color-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString()} domain={['auto', 'auto']} orientation="right" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#202124', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}
                                    labelStyle={{ color: 'var(--color-secondary)', marginBottom: '0.25rem' }}
                                    formatter={(value) => [`₹${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, "Price"]}
                                />
                                <Area type="monotone" dataKey="price" stroke={changeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorPriceGF)" activeDot={{ r: 6, fill: '#202124', stroke: changeColor, strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-secondary)', lineHeight: 1.6, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <span style={{color: 'var(--color-text)', fontWeight: 600}}>AI Interpretation: </span> 
                        {data.priceBehavior.interpretation}
                    </p>
                </div>
            </div>

            {/* 5. VOLATILITY STRIP */}
            <div className="glass-panel" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <span style={{ width: '100px', fontSize: '0.875rem', fontWeight: 600 }}>Volatility</span>
                <div style={{ flex: 1, height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${data.volatility.value}%`, height: '100%', background: 'linear-gradient(90deg, #34d399 0%, #facc15 100%)' }}></div>
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{data.volatility.level}</span>
                <Info size={16} color="var(--color-secondary)" />
            </div>

            {/* 6. TECHNICAL SIGNALS */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Technical Signals</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {data.technicalSignals.map(sig => (
                        <div key={sig.name} className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sig.name}</span>
                                <span style={{ fontSize: '0.75rem', color: sig.status === 'Bullish' ? '#34d399' : '#facc15' }}>{sig.status}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{sig.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7. SENTIMENT & 8. RISK (Side by Side) */}
            <div className="rv-two-col">
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Market Sentiment</h3>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem' }}>Negative</span>
                            <div style={{ flex: 1, height: '4px', background: '#333' }}>
                                <div style={{ marginLeft: `${data.sentiment.score}%`, width: '8px', height: '8px', borderRadius: '50%', background: '#fff', marginTop: '-2px' }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem' }}>Positive</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{data.sentiment.text}</p>
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Risk Factors</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data.riskSignals.map((risk, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                <AlertTriangle size={16} color="#f87171" style={{ marginTop: '2px' }} />
                                <span style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{risk.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 9. EXPLAINABILITY */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Analytical Weighting</h3>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100px', gap: '1rem' }}>
                        {data.explainability.factors.map(f => {
                            const rawVal = typeof f.value === 'string' ? parseFloat(f.value.replace('%', '')) : f.value;
                            const safeHeight = isNaN(rawVal) ? 10 : Math.min(100, Math.max(5, rawVal));
                            return (
                            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ width: '36px', height: `${safeHeight}%`, background: 'linear-gradient(180deg, #60a5fa 0%, rgba(96, 165, 250, 0.1) 100%)', borderRadius: '6px 6px 0 0', border: '1px solid rgba(96, 165, 250, 0.3)', borderBottom: 'none' }}></div>
                                <span style={{ fontSize: '0.7rem', marginTop: '0.75rem', textAlign: 'center', color: '#cbd5e1', fontWeight: 500 }}>{f.name}</span>
                            </div>
                        )})}
                    </div>
                    <p style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                        {data.explainability.text}
                    </p>
                </div>
            </div>

            {/* 9.5 PROPRIETARY ALPHA (SaaS MOAT FEATURES) */}
            {data.proprietaryAlpha && (
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Proprietary AI Alpha</h3>
                    <div style={{ padding: '0.2rem 0.6rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-accent)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', border: '1px solid var(--color-accent)' }}>QUANTITATIVE EDGE</div>
                </div>

                <div className="rv-alpha-grid">
                    
                    {/* 1. EXECUTIVE SENTIMENT */}
                    <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Executive Sentiment</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Conviction Score</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{data.proprietaryAlpha.executiveSentiment.confidenceScore}/100</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${data.proprietaryAlpha.executiveSentiment.confidenceScore}%`, height: '100%', background: 'var(--color-accent)' }}></div>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Volatility Index</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{data.proprietaryAlpha.executiveSentiment.volatilityIndex}/100</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${data.proprietaryAlpha.executiveSentiment.volatilityIndex}%`, height: '100%', background: '#ef4444' }}></div>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.6, fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                            "{data.proprietaryAlpha.executiveSentiment.summary}"
                        </p>
                    </div>

                    {/* 2. INSIDER HEATMAP */}
                    <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Insider Telemetry</span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem' }}>Net Flow (30d)</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: data.proprietaryAlpha.insiderHeatmap.netBuyingPercent >= 0 ? '#10b981' : '#ef4444' }}>
                                    {data.proprietaryAlpha.insiderHeatmap.netBuyingPercent > 0 ? '+' : ''}{data.proprietaryAlpha.insiderHeatmap.netBuyingPercent}%
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem' }}>Volume Traded</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {(data.proprietaryAlpha.insiderHeatmap.sharesTradedLast30Days / 1000).toFixed(1)}k
                                </span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', lineHeight: 1.6 }}>{data.proprietaryAlpha.insiderHeatmap.analysis}</p>
                    </div>

                    {/* 3. SUPPLY CHAIN RISK */}
                    <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Supply Chain Risk</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: data.proprietaryAlpha.supplyChainRisk.overallRiskScore > 70 ? '#ef4444' : 'var(--color-accent)' }}>
                                {data.proprietaryAlpha.supplyChainRisk.overallRiskScore}
                            </span>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            {Array.isArray(data.proprietaryAlpha.supplyChainRisk.criticalDependencies) && data.proprietaryAlpha.supplyChainRisk.criticalDependencies.map(dep => (
                                <div key={dep.country || '(Unknown)'} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text)', width: '60px' }}>{dep.country}</span>
                                    <div style={{ flex: 1, height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${dep.dependencyScore}%`, height: '100%', background: 'var(--color-secondary)' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{dep.dependencyScore}%</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', lineHeight: 1.6 }}>{data.proprietaryAlpha.supplyChainRisk.overview}</p>
                    </div>

                    {/* 4. DISRUPTION MATRIX */}
                    <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Disruption Matrix</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Threat Probability</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{data.proprietaryAlpha.killSwitchThreats.threatProbability}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Impact Horizon</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{data.proprietaryAlpha.killSwitchThreats.timelineToImpact}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Primary Rival</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>{data.proprietaryAlpha.killSwitchThreats.competitor}</span>
                            </div>
                        </div>
                    </div>

                    {/* 5. ALTERNATIVE DATA */}
                    <div className="glass-panel rv-alpha-full" style={{ borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Alternative Data Telemetry</span>
                        </div>
                        <div className="rv-alt-data-grid">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Web Traffic (MoM)</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: data.proprietaryAlpha.alternativeData.webTrafficGrowth >= 0 ? '#10b981' : '#ef4444' }}>
                                        {data.proprietaryAlpha.alternativeData.webTrafficGrowth > 0 ? '+' : ''}{data.proprietaryAlpha.alternativeData.webTrafficGrowth}%
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Employee Morale</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{data.proprietaryAlpha.alternativeData.employeeMoraleScore}/100</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Repo Activity</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{data.proprietaryAlpha.alternativeData.githubRepoActivity} commits/day</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.7, background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', fontStyle: 'italic' }}>
                                {data.proprietaryAlpha.alternativeData.summary}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
            )}

            {/* 10. INDUSTRY & FINANCIAL DEEP DIVE (New Sections) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>{data.industryOverview.title}</h3>
                <p style={{ color: 'var(--color-text)', lineHeight: '1.7', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {data.industryOverview.text}
                </p>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>{data.financialAnalysis.title}</h3>
                <p style={{ color: 'var(--color-text)', lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {data.financialAnalysis.text}
                </p>
            </div>

            {/* 11. PEER COMPARISON (New Section) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Peer Benchmarking</h3>
                <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Company</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>P/E Ratio</th>
                                <th style={{ padding: '1rem' }}>ROE</th>
                                <th style={{ padding: '1rem' }}>Revenue (Q)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.peerComparison.map((peer, i) => (
                                <tr key={peer.name} style={{ borderBottom: i !== data.peerComparison.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{peer.name}</td>
                                    <td style={{ padding: '1rem' }}>{peer.price}</td>
                                    <td style={{ padding: '1rem', color: peer.name === 'TCS' ? 'var(--color-primary)' : 'inherit' }}>{peer.pe}</td>
                                    <td style={{ padding: '1rem' }}>{peer.roe}</td>
                                    <td style={{ padding: '1rem' }}>{peer.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 12. STRATEGIC OUTLOOK (New Section) */}
            <div className="rv-outlook-grid">
                <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#60a5fa', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Tactical View (0-3 Months)</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.outlook.shortTerm}</p>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Structural View (12+ Months)</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.outlook.longTerm}</p>
                </div>
            </div>

            {/* 13. COMPLIANCE */}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-secondary)', margin: '4rem 0' }}>
                <p>This report is for informational purposes only. InvestIQ does not provide investment advice.</p>
                <p>Regulatory Awareness: Data is based on historical patterns and AI analysis.</p>
            </div>

            {/* 11. ACTION BAR (Sticky Bottom) */}
            <div className="rv-action-bar" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                padding: '1rem 2rem', borderTop: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'flex-end', gap: '1rem',
                zIndex: 100
            }}>
                <button style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-text)', borderRadius: '8px', cursor: 'pointer' }}>
                    Compare
                </button>
                <button onClick={handleDownloadPDF} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-text)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} /> PDF
                </button>
                <button style={{
                    padding: '0.5rem 1.5rem', background: 'var(--color-accent)', border: 'none',
                    color: 'var(--color-bg)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    View Outlook <ChevronRight size={16} />
                </button>
            </div>
        </div>
        </>
    );
};

export default ReportView;
