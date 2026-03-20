import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import StockSearch from './components/StockSearch';
import ReportScope from './components/ReportScope';
import AnalysisPreferences from './components/AnalysisPreferences';
import ReportView from './components/ReportView';

const IntelligenceReportPage = () => {
    const [selectedStock, setSelectedStock] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [credits, setCredits] = useState(3);

    const [preferences, setPreferences] = useState({
        fundamental: true,
        technical: true,
        sentiment: true,
        macro: false
    });

    const togglePreference = (id) => {
        setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ✅ Helper: convert "TCS" => "TCS.NS" by default (NSE)
    const normalizeSymbol = (raw, exchange = "NSE") => {
        const s = (raw || "").toString().toUpperCase().trim();
        if (!s) return "";
        if (s.includes(".")) return s;
        const cleaned = s.split(":").pop().trim();
        if (exchange === "BSE") return `${cleaned}.BO`;
        return `${cleaned}.NS`;
    };

    // ✅ Adapter: backend JSON -> ReportView expected shape
    const adaptBackendToReportView = (apiData, selectedStockLocal) => {
        const quote = apiData?.quote || {};
        const candles = apiData?.price_behavior?.candles || apiData?.chart || []; // ✅ support both
        const tech = apiData?.technical_signals || {};
        const risk = apiData?.risk_factors || {};
        const sent = apiData?.market_sentiment || {};
        const weights = apiData?.analytical_weighting || {};
        const outlook = apiData?.outlook || {};

        // ✅ peers might come in 2 formats:
        // 1) apiData.peer_benchmarking.peers (your old shape)
        // 2) apiData.peers (new dynamic service shape)
        const peersRaw =
            apiData?.peer_benchmarking?.peers ||
            apiData?.peers ||
            [];

        const symbol =
            quote.symbol ||
            apiData?.symbol ||
            selectedStockLocal?.symbol ||
            selectedStockLocal?.ticker ||
            "N/A";

        const company = selectedStockLocal?.name || symbol;
        const exchange = quote.exchange || selectedStockLocal?.exchange || "NSE";
        const sector = selectedStockLocal?.sector || apiData?.sector || "—";

        const price = Number(quote.price ?? apiData?.price ?? 0);
        const prevClose = Number(quote.previous_close ?? 0);

        const change =
            quote.day_change !== null && quote.day_change !== undefined
                ? Number(quote.day_change)
                : price && prevClose
                    ? price - prevClose
                    : 0;

        const changePercent =
            quote.day_change_pct !== null && quote.day_change_pct !== undefined
                ? Number(quote.day_change_pct)
                : price && prevClose
                    ? ((price - prevClose) / prevClose) * 100
                    : 0;

        // ✅ Chart: support both candle shapes:
        // - your old candle: {close, high, low}
        // - new chart: {date, close}
        const chartData = (candles || []).slice(-80).map(c => ({
            price: Number(c.close ?? c.Close ?? 0)
        }));

        const lastCandle = (candles && candles.length) ? candles[candles.length - 1] : null;
        const dayHigh = lastCandle ? Number(lastCandle.high ?? lastCandle.High ?? 0) : "—";
        const dayLow = lastCandle ? Number(lastCandle.low ?? lastCandle.Low ?? 0) : "—";

        const trendLabel = tech?.trend?.label || (changePercent >= 0 ? "Bullish" : "Bearish");
        const momentumLabel = tech?.momentum?.label || (changePercent >= 0 ? "Bullish" : "Neutral");
        const sentimentLabel = sent?.label || "Neutral";
        const riskLevel = risk?.risk_level || "Moderate";

        const status = [
            { label: "Trend", value: trendLabel, type: trendLabel === "Bullish" ? "positive" : "negative" },
            { label: "Momentum", value: momentumLabel, type: momentumLabel === "Bullish" ? "positive" : "neutral" },
            { label: "Risk", value: riskLevel, type: riskLevel === "Low" ? "positive" : (riskLevel === "Moderate" ? "neutral" : "negative") },
        ];

        const volPct = Number(risk?.volatility_annual_pct ?? 0);
        const volValue = Number.isFinite(volPct)
            ? Math.max(5, Math.min(100, (volPct / 60) * 100))
            : 30;

        const technicalSignals = [
            { name: "Trend", status: trendLabel, text: tech?.trend?.based_on || "Close vs SMA50" },
            { name: "Momentum", status: momentumLabel, text: tech?.momentum?.based_on || "RSI + MACD Histogram" },
            { name: "Breakout Risk", status: tech?.breakout_risk?.label || "Neutral", text: tech?.breakout_risk?.based_on || "SMA alignment" }
        ];

        // ✅ formatters
        const fmtINR = (v) =>
            v === null || v === undefined || v === "—" ? "—" : `₹${Number(v).toLocaleString("en-IN")}`;

        const fmtNum = (v) =>
            v === null || v === undefined || v === "—" ? "—" : Number(v).toFixed(2);

        const fmtROE = (v) =>
            v === null || v === undefined || v === "—" ? "—" :
                // ROE might be 0.14 OR 14 (handle both)
                `${(Number(v) > 1 ? Number(v) : Number(v) * 100).toFixed(2)}%`;

        // ✅ peer mapping supports both backend formats:
        // Old: {company, price, pe_ratio, roe, revenue_q}
        // New: {symbol, price, pe, roe, revenue}
        const peerComparison = (Array.isArray(peersRaw) && peersRaw.length > 0)
            ? peersRaw.slice(0, 3).map((p, idx) => ({
                name: p.company || p.symbol || `Peer ${idx + 1}`,
                price: fmtINR(p.price),
                pe: p.pe_ratio == null ? (p.pe == null ? "—" : fmtNum(p.pe)) : fmtNum(p.pe_ratio),
                roe: p.roe == null ? "—" : fmtROE(p.roe),
                revenue: fmtINR(p.revenue_q ?? p.revenue),
            }))
            : [
                { name: "Peer 1", price: "—", pe: "—", roe: "—", revenue: "—" },
                { name: "Peer 2", price: "—", pe: "—", roe: "—", revenue: "—" },
                { name: "Peer 3", price: "—", pe: "—", roe: "—", revenue: "—" },
            ];

        const techW = preferences.technical ? Number(weights.technical ?? 40) : 0;
        const fundW = preferences.fundamental ? Number(weights.fundamental ?? 35) : 0;
        const sentW = preferences.sentiment ? Number(weights.sentiment ?? 25) : 0;

        return {
            header: {
                company,
                symbol,
                exchange,
                sector,
                generatedOn: new Date().toLocaleString(),
                dataRange: `${apiData?.meta?.period || "—"} / ${apiData?.meta?.interval || "—"}`
            },

            snapshot: {
                description:
                    `Latest price ${price ? `₹${price.toFixed(2)}` : "—"} (${change >= 0 ? "+" : ""}${change.toFixed(2)} / ${changePercent.toFixed(2)}%).`,
                domains: ["Technical", "Risk", "Sentiment", "Peers"],
                keyMetrics: [
                    { label: "Price", value: price ? `₹${price.toFixed(2)}` : "—" },
                    { label: "Day High", value: dayHigh !== "—" ? `₹${Number(dayHigh).toFixed(2)}` : "—" },
                    { label: "Day Low", value: dayLow !== "—" ? `₹${Number(dayLow).toFixed(2)}` : "—" },
                    { label: "Change", value: `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePercent.toFixed(2)}%)` },
                ]
            },

            executiveSummary: {
                status,
                text:
                    `Trend is ${trendLabel} with ${momentumLabel} momentum. ` +
                    `Risk level is ${riskLevel} (annualized volatility ~${Number.isFinite(volPct) ? volPct.toFixed(2) : "—"}%). ` +
                    `Sentiment is ${sentimentLabel}.`
            },

            priceBehavior: {
                chartData,
                interpretation:
                    candles?.length
                        ? `Chart plotted using historical candles (${candles.length} points).`
                        : `No candle data received.`
            },

            volatility: {
                value: volValue,
                level: riskLevel
            },

            technicalSignals,

            sentiment: {
                score: Math.round((Number(sent?.score ?? 0.5)) * 100),
                text: sent?.note || "Sentiment derived from available signals."
            },

            riskSignals: [
                ...(risk?.drivers?.length ? risk.drivers.map(t => ({ text: t })) : [{ text: "Risk drivers not available." }]),
                ...(risk?.atr14 ? [{ text: `ATR(14): ${Number(risk.atr14).toFixed(2)}` }] : [])
            ],

            explainability: {
                factors: [
                    { name: "Technical", value: techW },
                    { name: "Fundamental", value: fundW },
                    { name: "Sentiment", value: sentW },
                ],
                text: weights?.note || "Weights based on preferences."
            },

            industryOverview: {
                title: "Industry Overview",
                text: "Add sector narrative later (optional)."
            },

            financialAnalysis: {
                title: "Financial Deep Dive",
                text: "Fundamentals require a fundamentals source (can be added later)."
            },

            peerComparison,

            outlook: {
                shortTerm: outlook?.tactical_view
                    ? `${outlook.tactical_view.bias} (${outlook.tactical_view.horizon}) — ${outlook.tactical_view.note}`
                    : "—",
                longTerm: outlook?.structural_view
                    ? `${outlook.structural_view.bias} (${outlook.structural_view.horizon}) — ${outlook.structural_view.note}`
                    : "—"
            }
        };
    };

    const handleGenerate = async () => {
        if (!selectedStock || credits <= 0) return;
        setIsGenerating(true);

        try {
            const rawSymbol =
                selectedStock.symbol || selectedStock.ticker || selectedStock.name || "";

            const exchange = selectedStock.exchange || "NSE";
            const symbol = normalizeSymbol(rawSymbol, exchange);

            if (!symbol) {
                alert("Invalid stock symbol");
                return;
            }

            // ✅ IMPORTANT CHANGE:
            // Only send peers if user has peers explicitly.
            // Otherwise send [] and let backend auto-generate dynamic peers.
            const peers = (Array.isArray(selectedStock.peers) && selectedStock.peers.length > 0)
                ? selectedStock.peers
                : [];

            const res = await fetch("http://localhost:5000/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    period: "6mo",
                    interval: "1d",
                    peers   // ✅ now backend decides when empty
                })
            });

            const apiData = await res.json();
            if (!res.ok) throw new Error(apiData.error || "Failed to generate report");

            const adapted = adaptBackendToReportView(apiData, selectedStock);
            setReportData(adapted);
            setCredits(prev => prev - 1);

        } catch (err) {
            console.error(err);
            alert(err.message || "Something went wrong");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBack = () => {
        setReportData(null);
        setSelectedStock(null);
    };

    if (reportData) {
        return <ReportView data={reportData} onBack={handleBack} />;
    }

    return (
        <>
            <div style={{
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
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
                    gap: '0.5rem'
                }}>
                    <Sparkles size={16} />
                    <span style={{ fontWeight: 600 }}>{credits}</span>
                    <span style={{ fontSize: '0.875rem' }}>credits left</span>
                </div>
            </div>

            <div className="glass-panel" style={{
                padding: '3rem',
                borderRadius: '16px',
                textAlign: 'center'
            }}>
                <h2>
                    {selectedStock
                        ? `Analyze ${selectedStock.name || selectedStock.symbol || selectedStock.ticker}`
                        : 'Generate New Report'}
                </h2>

                {!selectedStock && (
                    <StockSearch onSelect={setSelectedStock} />
                )}

                {selectedStock && (
                    <>
                        <AnalysisPreferences
                            preferences={preferences}
                            onToggle={togglePreference}
                        />

                        <ReportScope />

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || credits <= 0}
                            style={{ marginTop: '1rem' }}
                        >
                            {isGenerating ? 'Analyzing…' : 'Generate Report'}
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

export default IntelligenceReportPage;