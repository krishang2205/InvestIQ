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
        description: 'Tata Consultancy Services Ltd. (TCS) is a global leader in IT services, consulting, and business solutions, operating as a critical strategic partner to Fortune 500 enterprises. With a diversified portfolio spanning Banking, Financial Services, Retail, and Life Sciences, the company derives significant revenue stable, long-term digital transformation contracts. TCS is characterized by its best-in-class margins, robust cash conversion cycles, and a defensive business model that provides resilience during macroeconomic downturns.',
        domains: ['IT Services', 'Cloud Computing', 'AI/ML Solutions', 'Enterprise Consulting'],
        keyMetrics: [
            { label: 'P/E Ratio', value: '29.4x' },
            { label: 'Div Yield', value: '1.45%' },
            { label: 'Beta (1Y)', value: '0.82' },
            { label: 'Market Cap', value: '₹14.2T' }
        ]
    },
    executiveSummary: {
        status: [
            { label: 'Trend', value: 'Stable', type: 'positive' },
            { label: 'Momentum', value: 'Moderate', type: 'neutral' },
            { label: 'Sentiment', value: 'Optimistic', type: 'positive' },
            { label: 'Risk', value: 'Low', type: 'positive' }
        ],
        text: 'Over the analyzed period, TCS has exhibited measured price appreciation (+12% YoY), reflecting steady institutional accumulation rather than speculative excess. The stock currently displays high trend stability combined with low beta (0.82), suggesting it is functioning effectively as a defensive growth asset amidst broader sector volatility. While short-term momentum has moderated, the underlying support levels remain robust, supported by consistent earnings visibility and strong deal wins.'
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
        interpretation: 'Price action reveals a classical "Step-Up" structure, characterized by sharp rallies followed by phases of prolonged consolidation that allow for orderly handovers from short-term traders to long-term holders. Notably, the stock has successfully defended the 50-day Moving Average during all three minor corrections this year, confirming strong institutional buying interest at lower valuations. The absence of sharp gaps or capitulation selling further reinforces the controlled nature of the current uptrend.'
    },
    volatility: {
        level: 'Low',
        value: 22, // 0-100 scale
        text: 'Volatility remains compressed with an Implied Volatility Rank (IV Rank) of 15%, indicating a distinct lack of fear-driven positioning in the options market.'
    },
    technicalSignals: [
        { name: 'RSI (14)', status: 'Neutral', text: 'RSI at 58 indicates balanced momentum with ample room for upside before hitting overbought territory.' },
        { name: 'MACD', status: 'Bullish', text: 'Signal line crossover remains valid, confirming the continuance of the broader upward structural trend.' },
        { name: 'Mov. Avg (50D)', status: 'Support', text: 'Price is holding firmly above the 50-Day Moving Average, a key zone for institutional accumulation.' },
        { name: 'Bollinger Bands', status: 'Squeeze', text: 'Bands are narrowing significantly, a classical precursor to potential volatility expansion or a breakout move.' },
        { name: 'Stochastic', status: 'Overbought', text: 'Short-term oscillator is elevated, suggesting a minor pullback or consolidation could occur in the near term.' },
        { name: 'Volume Trend', status: 'Accumulation', text: 'Volume profile shows expansion on up-days and contraction on down-days, a bullish accumulation signature.' }
    ],
    sentiment: {
        score: 75, // 0-100
        text: 'News narratives are predominantly focused on operational stability, large deal wins, and long-term AI positioning. Public market commentary reflects a tone of cautious optimism, with very little evidence of the euphoria typically seen at market tops.'
    },
    riskSignals: [
        { text: 'Heightened sensitivity to global discretionary IT spending trends in the US and Europe.' },
        { text: 'Exposure to USD/INR currency fluctuations affecting reporting margins.' },
        { text: 'Current valuation premium relative to historical 5-year averages warrants caution.' }
    ],
    explainability: {
        factors: [
            { name: 'Trend', value: 40 },
            { name: 'Sentiment', value: 30 },
            { name: 'Vol.', value: 20 },
            { name: 'Macro', value: 10 }
        ],
        text: 'The AI model\'s conclusions were influenced most strongly by the consistency of the medium-term price structure and the stability of the trend. Lesser weight was assigned to short-term momentum fluctuations, which involve noise.'
    },
    industryOverview: {
        title: 'Sector Context: Global IT Services',
        text: 'The Global IT Services sector is currently navigating a transitional phase characterized by a shift from traditional maintenance-based contracts to high-value Digital Transformation assignments. While discretionary spending in North America has softened due to interest rate headwinds, large-deal TCV (Total Contract Value) remains resilient for top-tier players. The "Vendor Consolidation" theme is playing out strongly, benefiting market leaders like TCS who offer end-to-end capabilities. Furthermore, the rapid integration of GenAI into enterprise workflows represents a multi-year tailwind that is expected to arrest margin compression and drive the next leg of revenue growth.'
    },
    financialAnalysis: {
        title: 'Financial Health & Valuation',
        text: 'TCS maintains a fortress balance sheet with best-in-class return ratios. Operating Margins (EBIT) have stabilized at ~24.5%, demonstrating superior cost management despite supply-side wage pressures. Free Cash Flow (FCF) conversion remains robust at >100% of Net Income, supporting a consistent shareholder return policy via buybacks and dividends. While valuations at ~29x P/E are at a premium to the 5-year average (26x), this is justified by the company\'s superior execution track record and lower earnings volatility compared to peers.'
    },
    outlook: {
        shortTerm: 'Tactically, the stock is consolidating in a narrow range. A breakout above ₹4,400 would open the door for a retest of all-time highs. Downside risk appears capped at ₹3,900 given strong institutional support.',
        longTerm: 'Structurally, TCS remains a core portfolio holding. The compnay is well-positioned to capture the $1.5T Digital Transformation market. We expect double-digit earnings growth to resume in FY26 as the macro environment normalizes.'
    },
    peerComparison: [
        { name: 'TCS', price: '₹4,350', pe: '29.4x', roe: '51%', revenue: '₹642B' },
        { name: 'Infosys', price: '₹1,920', pe: '26.1x', roe: '32%', revenue: '₹402B' },
        { name: 'HCL Tech', price: '₹1,650', pe: '24.8x', roe: '28%', revenue: '₹285B' },
        { name: 'Wipro', price: '₹550', pe: '21.5x', roe: '16%', revenue: '₹220B' }
    ]
};
