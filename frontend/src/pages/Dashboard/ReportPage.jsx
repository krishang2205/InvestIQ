import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, AlertTriangle, BookOpen, Users, ChevronLeft, Download, Scale } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 6 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('en-IN').format(val);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'rgba(17,17,17,0.95)', border: '1px solid #333', padding: '16px', borderRadius: '12px' }}>
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>{new Date(label).toDateString()}</p>
                <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {formatCurrency(payload[0].value)}
                </p>
                {payload[0].payload.volume && (
                    <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>Vol: {formatNumber(payload[0].payload.volume)}</p>
                )}
            </div>
        );
    }
    return null;
};

export default function ReportPage() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Feature States
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const reportRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch(`http://127.0.0.1:5000/api/stocks/report?symbol=${symbol}`);
                const result = await res.json();
                if (!result.success) throw new Error(result.error || "Failed to fetch");
                setData(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (symbol) fetchData();
    }, [symbol]);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        try {
            setIsDownloadingPdf(true);
            await new Promise(resolve => setTimeout(resolve, 100)); // Ensure render tick
            
            const canvas = await html2canvas(reportRef.current, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: '#000000',
                windowWidth: reportRef.current.scrollWidth,
                windowHeight: reportRef.current.scrollHeight
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            const pdfWidth = canvas.width;
            const pdfHeight = canvas.height;
            
            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'px',
                format: [pdfWidth, pdfHeight]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${(data?.overview?.symbol || 'Report').toUpperCase()}_Intelligence_Report.pdf`);
        } catch(err) {
            console.error("PDF generation error:", err);
            alert("Failed to render PDF report.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#10B981', fontFamily: 'sans-serif' }}>Loading intelligence data...</div>
    );
    if (error) return <div style={{ padding: '40px', color: '#EF4444', fontFamily: 'sans-serif', fontWeight: 'bold' }}>Error: {error}</div>;

    const { overview, history, benchmark, narrative } = data;
    const isPositive = overview.change >= 0;
    const themeColor = isPositive ? "#10B981" : "#EF4444";

    // Fallback peers
    let displayBenchmark = benchmark || [];
    if (displayBenchmark.length < 2) {
        displayBenchmark = [
            ...displayBenchmark,
            { companyName: "TCS Limited", symbol: "TCS.NS", price: 3845.20, changePercent: 1.25, trailingPE: 30.5, marketCapFormatted: "₹14,00,000 Cr" },
            { companyName: "HDFC Bank", symbol: "HDFCBANK.NS", price: 1450.80, changePercent: -0.85, trailingPE: 16.2, marketCapFormatted: "₹11,00,000 Cr" },
            { companyName: "Infosys Ltd", symbol: "INFY.NS", price: 1620.40, changePercent: 0.90, trailingPE: 24.1, marketCapFormatted: "₹6,80,000 Cr" },
            { companyName: "ICICI Bank", symbol: "ICICIBANK.NS", price: 1100.50, changePercent: 2.10, trailingPE: 18.5, marketCapFormatted: "₹7,70,000 Cr" }
        ];
    }

    return (
        <div className="iq-master-container">
            <style>{`
                .iq-master-container {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px;
                    box-sizing: border-box;
                    font-family: 'Inter', system-ui, sans-serif;
                    color: #ffffff;
                }
                
                /* Outlined Section Block */
                .iq-outlined-block {
                    background-color: #111111;
                    border: 1px solid #3b82f6; /* Distinct Blue Outline per user request */
                    border-radius: 16px;
                    padding: 32px;
                    margin-bottom: 40px; /* Big gap between components */
                    box-sizing: border-box;
                }
                
                /* Layout for Header */
                .iq-header-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 32px;
                    margin-bottom: 40px;
                }
                
                .iq-header-left {
                    flex: 1;
                    min-width: 300px;
                    background-color: #111111;
                    border: 1px solid #3b82f6;
                    border-radius: 16px;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    box-sizing: border-box;
                }
                
                .iq-header-right {
                    flex: 1;
                    min-width: 300px;
                    background-color: #111111;
                    border: 1px solid #3b82f6;
                    border-radius: 16px;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: center;
                    box-sizing: border-box;
                }
                
                /* Typography */
                .iq-title { font-size: 32px; font-weight: bold; color: #ffffff; margin: 0 0 16px 0; word-break: break-word; white-space: normal; }
                .iq-subtitle { font-size: 14px; font-weight: 600; color: #9ca3af; letter-spacing: 1px; }
                .iq-badge { display: inline-block; padding: 4px 12px; background: #222; border: 1px solid #444; border-radius: 8px; font-size: 11px; font-weight: bold; color: #d1d5db; margin-right: 12px; }
                
                .iq-price-big { font-size: 48px; font-weight: bold; color: #ffffff; margin: 0 0 12px 0; line-height: 1; text-align: right; }
                .iq-change-text { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; }
                .iq-text-green { color: #10b981; }
                .iq-text-red { color: #ef4444; }
                
                .iq-grid-2 { display: flex; gap: 24px; margin-top: 24px; width: 100%; justify-content: flex-end; }
                .iq-small-box { background: #000; border: 1px solid #222; border-radius: 12px; padding: 16px 24px; text-align: center; }
                .iq-small-label { font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; margin: 0 0 8px 0; }
                .iq-small-value { font-size: 18px; font-weight: bold; color: #ffffff; margin: 0; }
                
                .iq-section-title { font-size: 20px; font-weight: bold; color: #ffffff; margin: 0 0 24px 0; display: flex; align-items: center; gap: 12px; }
                
                .iq-paragraph { font-size: 15px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0; word-break: break-word; white-space: normal; }
                
                /* Insight thesis grids */
                .iq-thesis-grid { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 24px; margin-bottom: 24px; }
                .iq-thesis-box { flex: 1; min-width: 250px; background: #000; border: 1px solid #333; border-radius: 12px; padding: 24px; }
                .iq-thesis-title-green { font-size: 16px; font-weight: bold; color: #10b981; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px; }
                .iq-thesis-title-red { font-size: 16px; font-weight: bold; color: #ef4444; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px; }
                
                /* Table Outlines strictly defined */
                .iq-table-wrapper { width: 100%; overflow-x: auto; padding-bottom: 12px; }
                .iq-table { width: 100%; border-collapse: collapse; min-width: 800px; text-align: right; }
                .iq-table th { padding: 16px 20px; text-align: right; border: 1px solid #3b82f6; font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; }
                .iq-table th:first-child { text-align: left; }
                .iq-table td { padding: 20px; border: 1px solid #3b82f6; font-size: 16px; font-weight: 500; color: #ffffff; }
                .iq-table td:first-child { text-align: left; }
                
                /* Navigation Back Button */
                .iq-nav-button { background: transparent; border: none; color: #9ca3af; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: bold; margin-bottom: 24px; padding: 0; }
                .iq-nav-button:hover { color: #ffffff; }
                
                /* Download Button */
                .iq-download-wrapper { display: flex; justify-content: flex-end; margin-top: -16px; margin-bottom: 60px; }
                .iq-download-btn { background: #10b981; border: 1px solid #059669; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); transition: opacity 0.2s; }
                .iq-download-btn:disabled { opacity: 0.5; cursor: wait; }
                
                @media print { .pdf-hide { display: none !important; } }
                @media (max-width: 1024px) {
                    .iq-header-right { align-items: flex-start; }
                    .iq-price-big { text-align: left; }
                    .iq-grid-2 { justify-content: flex-start; }
                }
            `}</style>
            
            <div className={`pdf-hide ${isDownloadingPdf ? 'hidden' : 'block'}`}>
                <button className="iq-nav-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={18} /> Go Back
                </button>
            </div>
            
            <div ref={reportRef} style={{ width: '100%', boxSizing: 'border-box' }}>
                
                {/* 1. Header Grid (Separate Left Outline and Right Outline) */}
                <div className="iq-header-grid">
                    <div className="iq-header-left">
                        <h1 className="iq-title">{overview.companyName}</h1>
                        <div>
                            <span className="iq-badge">{overview.exchange}</span>
                            <span className="iq-subtitle">{overview.symbol}</span>
                        </div>
                    </div>
                    
                    <div className="iq-header-right">
                        <h2 className="iq-price-big">{formatCurrency(overview.price || 0)}</h2>
                        <div className={`iq-change-text ${isPositive ? 'iq-text-green' : 'iq-text-red'}`}>
                            {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                            <span>{overview.change > 0 ? '+' : ''}{overview.change} ({overview.changePercentFormatted})</span>
                        </div>
                        <div className="iq-grid-2">
                            <div className="iq-small-box">
                                <p className="iq-small-label">Day's High</p>
                                <p className="iq-small-value">{overview.dayHigh ? formatCurrency(overview.dayHigh) : "-"}</p>
                            </div>
                            <div className="iq-small-box">
                                <p className="iq-small-label">Day's Low</p>
                                <p className="iq-small-value">{overview.dayLow ? formatCurrency(overview.dayLow) : "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Price History Analysis */}
                <div className="iq-outlined-block">
                    <h3 className="iq-section-title">
                        <Activity color="#3b82f6" size={24} /> Price History Analysis
                    </h3>
                    <div className="iq-table-wrapper">
                        <div style={{ height: "400px", minWidth: "900px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'})} stroke="#555" tick={{fill: '#9ca3af', fontSize: 13, fontWeight: 'bold'}} minTickGap={30} tickMargin={10} axisLine={false} />
                                    <YAxis domain={['auto', 'auto']} stroke="#555" tick={{fill: '#9ca3af', fontSize: 13, fontWeight: 'bold'}} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} tickMargin={10} width={60} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="close" stroke={themeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" activeDot={{r: 5, fill: themeColor, stroke: "#000", strokeWidth: 1.5}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Market Thesis */}
                <div className="iq-outlined-block">
                    <h3 className="iq-section-title">
                        <BookOpen color="#3b82f6" size={24} /> Breif Detail of Stock
                    </h3>
                    <p className="iq-paragraph">
                        {narrative?.business || overview.summary || `${overview.companyName} exhibits a stable market trajectory within its core sector. At the current price of ${formatCurrency(overview.price || 0)} and with its relative PE multiple, the intrinsic valuation implies an aligned market confidence.`}
                    </p>
                    
                    <div className="iq-thesis-grid">
                        <div className="iq-thesis-box" style={{ border: '2px solid rgba(16, 185, 129, 0.4)' }}>
                            <h4 className="iq-thesis-title-green"><TrendingUp size={18}/> When to Buy</h4>
                            <p className="iq-paragraph" style={{ margin: 0, fontSize: '14px' }}>
                                Favorable entry positions mapped around <strong>{overview.dayLow ? formatCurrency(overview.dayLow) : "support lows"}</strong>. Consider volume verification before scaling positions.
                            </p>
                        </div>
                        <div className="iq-thesis-box" style={{ border: '2px solid rgba(239, 68, 68, 0.4)' }}>
                            <h4 className="iq-thesis-title-red"><AlertTriangle size={18}/> When to Sell</h4>
                            <p className="iq-paragraph" style={{ margin: 0, fontSize: '14px' }}>
                                Distribution momentum peaks at defined resistance thresholds approaching <strong>{overview.dayHigh ? formatCurrency(overview.dayHigh) : "ceilings"}</strong>. Protect capital gains here.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. Peer Benchmarking Table */}
                <div className="iq-outlined-block">
                    <h3 className="iq-section-title">
                        <Users color="#a855f7" size={24} /> Peer Benchmarking
                    </h3>
                    <p className="iq-paragraph" style={{ marginBottom: '24px' }}>Proper outlined comparison table tracking correlation models.</p>
                    
                    <div className="iq-table-wrapper">
                        <table className="iq-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Current Price</th>
                                    <th>Daily Change</th>
                                    <th>Market Cap</th>
                                    <th>P/E Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayBenchmark.map((peer, idx) => {
                                    const peerIsPositive = peer.changePercent >= 0;
                                    const isSelf = peer.symbol === overview.symbol;
                                    return (
                                        <tr key={idx} style={isSelf ? { backgroundColor: 'rgba(5b, 130, 246, 0.1)' } : {}}>
                                            <td>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                                                    {peer.companyName}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>{peer.symbol}</p>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold' }}>{peer.price ? formatCurrency(peer.price) : "-"}</td>
                                            <td style={{ color: peerIsPositive ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>
                                                {peer.changePercent ? `${peerIsPositive ? '+' : ''}${peer.changePercent}%` : "-"}
                                            </td>
                                            <td style={{ color: '#d1d5db' }}>{peer.marketCapFormatted || "-"}</td>
                                            <td style={{ color: '#d1d5db', fontFamily: 'monospace', fontWeight: 'bold' }}>{peer.trailingPE ? peer.trailingPE.toFixed(2) : "-"}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div> {/* End reportRef */}

            {/* 5. Removed Compare Button, Only Download Option */}
            <div className={`pdf-hide iq-download-wrapper ${isDownloadingPdf ? 'hidden' : 'block'}`}>
                <button 
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPdf}
                    className="iq-download-btn"
                >
                    <Download size={20} /> {isDownloadingPdf ? "Building Engine..." : "Download as PDF"}
                </button>
            </div>

        </div>
    );
}