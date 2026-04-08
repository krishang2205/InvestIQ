import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Activity, Newspaper, BarChart2,
    RefreshCw, Clock, Globe, ChevronUp, ChevronDown
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';

const API = 'http://localhost:5001';

/* ── small helpers ──────────────────────────────────────────── */
const fmt = (n, digits = 2) =>
    n == null ? '—' : Number(n).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const PctBadge = ({ v, size = 14 }) => {
    const up = v >= 0;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            color: up ? 'var(--color-risk-low)' : 'var(--color-risk-high)',
            fontWeight: 700, fontSize: `${size}px`
        }}>
            {up ? <ChevronUp size={size} /> : <ChevronDown size={size} />}
            {Math.abs(v).toFixed(2)}%
        </span>
    );
};

const Spark = ({ data = [] }) => {
    const pts = data.map((p, i) => ({ v: p, i }));
    const up = data.length > 1 && data[data.length - 1] >= data[0];
    return (
        <ResponsiveContainer width={70} height={30}>
            <LineChart data={pts}>
                <Line dataKey="v" dot={false} strokeWidth={1.5}
                    stroke={up ? 'var(--color-risk-low)' : 'var(--color-risk-high)'} />
            </LineChart>
        </ResponsiveContainer>
    );
};

/* ── section header ─────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div style={{ marginBottom: '1.2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            <div style={{ padding: '0.4rem', background: 'rgba(209,199,157,0.1)', borderRadius: '8px' }}>
                <Icon size={20} color="var(--color-accent)" />
            </div>
            {title}
        </h2>
        {subtitle && <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', marginLeft: '2.5rem' }}>{subtitle}</p>}
    </div>
);

/* ── skeleton ───────────────────────────────────────────────── */
const Sk = ({ w = '100%', h = '1rem', r = '6px' }) => (
    <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
const MarketMoodIndexPage = () => {
    const [indices, setIndices] = useState([]);
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [mood, setMood] = useState(null);
    const [news, setNews] = useState([]);
    const [history, setHistory] = useState([]);
    const [moversTab, setMoversTab] = useState('large_cap');
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [idxR, movR, moodR, newsR, histR] = await Promise.allSettled([
                fetch(`${API}/api/market/indices`).then(r => r.json()),
                fetch(`${API}/api/market/movers?category=${moversTab}`).then(r => r.json()),
                fetch(`${API}/api/market/mood`).then(r => r.json()),
                fetch(`${API}/api/market/news`).then(r => r.json()),
                fetch(`${API}/api/market/history?symbol=^NSEI&period=1mo`).then(r => r.json()),
            ]);

            if (idxR.status === 'fulfilled') {
                const d = idxR.value?.indices || idxR.value;
                setIndices(Array.isArray(d) ? d : []);
            }
            if (movR.status === 'fulfilled') {
                const d = movR.value;
                setGainers(Array.isArray(d?.gainers) ? d.gainers : []);
                setLosers(Array.isArray(d?.losers) ? d.losers : []);
            }
            if (moodR.status === 'fulfilled') setMood(moodR.value);
            if (newsR.status === 'fulfilled') {
                const d = newsR.value?.news || newsR.value;
                setNews(Array.isArray(d) ? d.slice(0, 12) : []);
            }
            if (histR.status === 'fulfilled') {
                setHistory(Array.isArray(histR.value) ? histR.value : []);
            }
            
            setLastRefresh(new Date());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => { if (!loading) fetchAll(); }, [moversTab]);

    // Zone helpers
    const zoneColor = (zone = '') => {
        if (zone.includes('Extreme Fear')) return '#00C853';
        if (zone.includes('Fear')) return '#CDDC39';
        if (zone.includes('Greed') && !zone.includes('Extreme')) return '#FFB300';
        if (zone.includes('Extreme Greed')) return '#FF5252';
        return 'var(--color-secondary)';
    };

    const moodScore = mood?.composite_score ?? 50;
    const moodZone = mood?.zone ?? 'Neutral';
    const moodColor = zoneColor(moodZone);
    const needleDeg = -90 + (moodScore / 100) * 180;

    // Nifty limits
    const minNifty = history.length ? Math.min(...history.map(h => h.low)) : 0;
    const maxNifty = history.length ? Math.max(...history.map(h => h.high)) : 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Page Title ─────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.2rem', letterSpacing: '-0.5px' }}>
                        Market <span className="text-gradient-gold">Pulse</span>
                    </h1>
                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.95rem' }}>
                        Real-time NSE & BSE intelligence · AI-driven sentiment · Refreshes every 5 mins
                    </p>
                </div>
                <button onClick={fetchAll}
                    className="glass-panel hover-glow"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.2rem', borderRadius: '10px', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <RefreshCw size={16} className={loading ? "spin" : ""} /> 
                    <span>Refresh</span>
                    {lastRefresh && <span style={{ opacity: 0.5, marginLeft: '6px', fontSize: '0.8rem', fontWeight: 400 }}>{lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                </button>
            </div>

            {/* ── Top Row: Chart, Indices, Sentiment ─────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem' }}>

                {/* Left Col: Nifty Chart & Major Indices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Nifty 50 Chart */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(209,199,157,0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
                        <SectionHeader icon={TrendingUp} title="Nifty 50 Overview (1 Month)" subtitle="Track the benchmark index trend" />
                        
                        <div style={{ height: '240px', width: '100%', marginTop: '1rem' }}>
                            {loading && history.length === 0 ? (
                                <Sk h="100%" />
                            ) : history.length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>No history available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="niftyGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-secondary)', fontSize: 12 }} minTickGap={30} tickFormatter={str => str.split('-').slice(1).join('/')} />
                                        <YAxis domain={[minNifty * 0.99, maxNifty * 1.01]} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-secondary)', fontSize: 12 }} tickFormatter={val => (val / 1000).toFixed(1) + 'k'} />
                                        <Tooltip 
                                            contentStyle={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ color: 'var(--color-text)' }}
                                            labelStyle={{ color: 'var(--color-secondary)' }}
                                            formatter={(value) => [`₹${value.toLocaleString()}`, "Close"]}
                                        />
                                        <Area type="monotone" dataKey="close" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#niftyGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Indices Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                        {loading && indices.length === 0 ? [...Array(4)].map((_, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '16px' }}>
                                <Sk h="0.8rem" w="60%" /><Sk h="1.8rem" w="80%" style={{ margin: '0.6rem 0' }} /><Sk h="1rem" w="50%" />
                            </div>
                        )) : indices.length === 0 ? (
                            <p style={{ color: 'var(--color-secondary)' }}>Unable to load indices.</p>
                        ) : indices.map((idx) => {
                            const up = idx.percentChange >= 0;
                            return (
                                <div key={idx.name} className="glass-panel" style={{ 
                                    padding: '1.2rem', borderRadius: '16px', 
                                    borderTop: `2px solid ${up ? 'rgba(0,200,83,0.5)' : 'rgba(255,82,82,0.5)'}`,
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '10px', background: up ? 'rgba(0,200,83,0.2)' : 'rgba(255,82,82,0.2)', filter: 'blur(10px)' }} />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{idx.name}</span>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.2rem 0 0.4rem 0' }}>{fmt(idx.price, 0)}</div>
                                    <PctBadge v={idx.percentChange ?? 0} size={13} />
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Right Col: Sentiment Gauge */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                    <SectionHeader icon={Activity} title="Sentiment" />

                    {/* Gauge */}
                    <div style={{ position: 'relative', width: '220px', height: '120px', margin: '1rem auto' }}>
                        <svg viewBox="0 0 200 110" width="100%" height="100%" style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.05))' }}>
                            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" strokeLinecap="round" />
                            <path d="M 20 100 A 80 80 0 0 1 76 28" fill="none" stroke="#00C853" strokeWidth="18" strokeLinecap="round" />
                            <path d="M 76 28 A 80 80 0 0 1 124 28" fill="none" stroke="#CDDC39" strokeWidth="18" strokeLinecap="round" />
                            <path d="M 124 28 A 80 80 0 0 1 180 100" fill="none" stroke="#FF5252" strokeWidth="18" strokeLinecap="round" />
                            <line
                                x1="100" y1="100"
                                x2={100 + 70 * Math.cos(((needleDeg - 90) * Math.PI) / 180)}
                                y2={100 + 70 * Math.sin(((needleDeg - 90) * Math.PI) / 180)}
                                stroke="white" strokeWidth="3" strokeLinecap="round"
                            />
                            <circle cx="100" cy="100" r="6" fill="white" />
                        </svg>
                    </div>

                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: moodColor, lineHeight: 1, textShadow: `0 0 20px ${moodColor}44` }}>{moodScore.toFixed(1)}</div>
                    <div style={{ marginTop: '0.8rem', padding: '0.4rem 1.2rem', borderRadius: '30px', background: `${moodColor}15`, color: moodColor, fontWeight: 800, fontSize: '1rem', border: `1px solid ${moodColor}40`, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {moodZone}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {mood?.metrics?.vix && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--color-secondary)' }}>India VIX</span>
                                <span style={{ fontWeight: 700 }}>{mood.metrics.vix.value} <span style={{ opacity: 0.6 }}>({mood.metrics.vix.status})</span></span>
                            </div>
                        )}
                        {mood?.metrics?.momentum && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--color-secondary)' }}>Trend</span>
                                <span style={{ fontWeight: 700, color: mood.metrics.momentum.status === 'Bullish' ? 'var(--color-risk-low)' : 'var(--color-risk-high)' }}>{mood.metrics.momentum.status}</span>
                            </div>
                        )}
                        {mood?.metrics?.rsi && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--color-secondary)' }}>14d RSI</span>
                                <span style={{ fontWeight: 700 }}>{mood.metrics.rsi.value}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Top Movers: Split View ─────────────────────────────── */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <SectionHeader icon={BarChart2} title="Top Movers" subtitle="Biggest volume drivers today" />
                    
                    {/* Tab Selector */}
                    <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '10px' }}>
                        {['large_cap', 'mid_cap', 'small_cap'].map(tab => (
                            <button key={tab} onClick={() => setMoversTab(tab)} style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: moversTab === tab ? 700 : 500,
                                background: moversTab === tab ? 'var(--color-accent)' : 'transparent',
                                color: moversTab === tab ? '#000' : 'var(--color-secondary)',
                                transition: 'all 0.2s'
                            }}>
                                {tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem' }}>
                    
                    {/* Gainers Column */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-risk-low)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,200,83,0.2)' }}>
                            <TrendingUp size={18} /> Top Gainers
                        </h3>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {[...Array(5)].map((_, i) => <Sk key={i} h="60px" r="10px" />)}
                            </div>
                        ) : gainers.length === 0 ? (
                            <p style={{ color: 'var(--color-secondary)', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>No gainers found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {gainers.slice(0, 6).map(stock => (
                                    <div key={stock.symbol} style={{
                                        padding: '0.8rem 1.2rem', borderRadius: '12px',
                                        background: 'linear-gradient(90deg, rgba(0, 200, 83, 0.08) 0%, rgba(0, 200, 83, 0.02) 100%)',
                                        border: '1px solid rgba(0,200,83,0.15)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'transform 0.2s, background 0.2s'
                                    }}
                                    className="hover-lift"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {stock.logoUrl && (
                                                <img src={stock.logoUrl} alt={stock.symbol} onError={(e) => e.target.style.display = 'none'} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', objectFit: 'contain', padding: '2px' }} />
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{stock.name}</div>
                                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', marginTop: '2px', fontWeight: 500 }}>₹{fmt(stock.price)}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <PctBadge v={stock.percentChange} size={15} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Losers Column */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-risk-high)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,82,82,0.2)' }}>
                            <TrendingDown size={18} /> Top Losers
                        </h3>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {[...Array(5)].map((_, i) => <Sk key={i} h="60px" r="10px" />)}
                            </div>
                        ) : losers.length === 0 ? (
                            <p style={{ color: 'var(--color-secondary)', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>No losers found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {losers.slice(0, 6).map(stock => (
                                    <div key={stock.symbol} style={{
                                        padding: '0.8rem 1.2rem', borderRadius: '12px',
                                        background: 'linear-gradient(90deg, rgba(255, 82, 82, 0.08) 0%, rgba(255, 82, 82, 0.02) 100%)',
                                        border: '1px solid rgba(255,82,82,0.15)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'transform 0.2s, background 0.2s'
                                    }}
                                    className="hover-lift"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {stock.logoUrl && (
                                                <img src={stock.logoUrl} alt={stock.symbol} onError={(e) => e.target.style.display = 'none'} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', objectFit: 'contain', padding: '2px' }} />
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{stock.name}</div>
                                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', marginTop: '2px', fontWeight: 500 }}>₹{fmt(stock.price)}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <PctBadge v={stock.percentChange} size={15} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── News Feed ──────────────────────────────────── */}
            <div style={{ padding: '0.5rem', borderRadius: '16px' }}>
                <SectionHeader icon={Newspaper} title="Market News" subtitle="Latest headlines shaping the Indian market" />
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.2rem' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.5rem', borderRadius: '16px' }}>
                                <Sk w="80%" /><Sk w="100%" h="2rem" /><Sk w="40%" h="0.8rem" />
                            </div>
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-secondary)', borderRadius: '16px' }}>
                        <Globe size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '1.1rem' }}>No news available right now.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.2rem' }}>
                        {news.map((item, i) => (
                            <a key={i} href={item.link || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <div style={{
                                    padding: '1.5rem', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    height: '100%',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                    className="hover-card"
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(209,199,157,0.15)', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {item.type || item.source || 'News'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                            <Clock size={12} /> {item.time || 'Recent'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.8rem 0', lineHeight: 1.4 }}>{item.title}</h3>
                                    {item.summary && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                            {item.summary}
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketMoodIndexPage;
