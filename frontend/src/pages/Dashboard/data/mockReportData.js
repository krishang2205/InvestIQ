export const MOCK_REPORT_DATA = {
    header: {
        company: 'Tata Consultancy Services Ltd.',
        symbol: 'TCS',
        exchange: 'NSE',
        sector: 'Information Technology',
        generatedOn: '12 October 2025',
        dataRange: 'Oct 2024 – Oct 2025'
    },
    snapshot: {
        description: 'Tata Consultancy Services Ltd. is a global IT services, consulting, and business solutions company operating across banking, healthcare, and retail. It derives revenue from long-term enterprise contracts and digital transformation.',
        domains: ['IT Services', 'Consulting', 'Business Solutions', 'Digital Transformation']
    },
    executiveSummary: {
        status: [
            { label: 'Trend', value: 'Stable', type: 'positive' },
            { label: 'Momentum', value: 'Moderate', type: 'neutral' },
            { label: 'Sentiment', value: 'Optimistic', type: 'positive' },
            { label: 'Risk', value: 'Low-Medium', type: 'positive' }
        ],
        text: 'TCS has exhibited measured and consistent price appreciation, reflecting steady investor confidence. The stock shows trend stability with moderate short-term sensitivity, driven by broader sector sentiment rather than company-specific disruption.'
    },
    priceBehavior: {
        chartData: [
            { date: 'Oct', price: 3400 }, { date: 'Nov', price: 3550 },
            { date: 'Dec', price: 3480 }, { date: 'Jan', price: 3600 },
            { date: 'Feb', price: 3750 }, { date: 'Mar', price: 3900 },
            { date: 'Apr', price: 3820 }, { date: 'May', price: 4000 },
            { date: 'Jun', price: 4100 }, { date: 'Jul', price: 4050 },
            { date: 'Aug', price: 4200 }, { date: 'Sep', price: 4350 }
        ],
        interpretation: 'Historical price analysis reveals a structured upward movement with sustained periods above trend levels. Gradual recoveries follow minor pullbacks, indicating absence of panic-driven selling.'
    },
    volatility: {
        level: 'Low',
        value: 25, // 0-100 scale
        text: 'A stable baseline level consistent with large-cap IT stocks.'
    },
    technicalSignals: [
        { name: 'RSI (14)', status: 'Neutral', text: 'Momentum is balanced, no overbought signs.' },
        { name: 'MACD', status: 'Bullish', text: 'Signal line crossover confirms upward trend.' },
        { name: 'Moving Averages', status: 'Support', text: 'Price holding above 50-day MA.' }
    ],
    sentiment: {
        score: 75, // 0-100
        text: 'News narratives emphasize operational stability and long-term positioning. Public commentary reflects cautious optimism rather than excessive enthusiasm.'
    },
    riskSignals: [
        { text: 'Sensitivity to global IT spending trends.' },
        { text: 'Exposure to currency fluctuation (USD/INR).' },
        { text: 'Valuation premium relative to historical average.' }
    ],
    explainability: {
        factors: [
            { name: 'Trend', value: 40 },
            { name: 'Sentiment', value: 30 },
            { name: 'Vol.', value: 20 },
            { name: 'Macro', value: 10 }
        ],
        text: 'Conclusions were influenced most strongly by medium-term price structure and trend consistency. Lesser weight was assigned to short-term momentum fluctuations.'
    }
};
