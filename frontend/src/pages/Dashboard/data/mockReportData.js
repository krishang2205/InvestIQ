export const MOCK_REPORT_DATA = {
    meta: {
        generatedOn: '12 October 2025',
        dataPeriod: 'October 2024 – October 2025',
        disclaimer: 'This report provides AI-assisted analytical insights derived from historical market behavior. It is for informational use only.'
    },
    company: {
        name: 'Tata Consultancy Services Ltd.',
        symbol: 'TCS',
        exchange: 'NSE',
        sector: 'Information Technology – IT Services',
        marketCap: 'Large Cap'
    },
    sections: [
        {
            title: 'Company Overview & Business Context',
            content: 'Tata Consultancy Services Ltd. is a global IT services, consulting, and business solutions company. It derives revenue from long-term enterprise contracts and digital transformation.',
            keyPoints: [
                'Relatively stable cash flows',
                'Lower earnings volatility compared to cyclical sectors',
                'Sensitivity to global IT spending trends'
            ],
            insight: 'Price movements reflect macroeconomic confidence and enterprise demand rather than speculation.'
        },
        {
            title: 'Executive Market Intelligence Summary',
            content: 'TCS has exhibited measured and consistent price appreciation, reflecting steady investor confidence. The stock shows trend stability with moderate short-term sensitivity.',
            status: 'positive', // positive, neutral, caution
            highlight: 'Controlled growth dynamics with manageable risk exposure.'
        },
        {
            title: 'Price Behavior & Positioning',
            content: 'Historical price analysis reveals a structured upward movement with sustained periods above medium-term trend levels.',
            details: [
                'Gradual recoveries following minor pullbacks',
                'Absence of sharp price dislocations',
                'Lower relative volatility vs broader indices'
            ]
        },
        {
            title: 'Momentum & Technical Signals',
            content: 'Technical signals indicate trend support with moderating momentum. No major divergence observed between price and momentum.',
            signal: 'Trend Support',
            strength: 'Moderate'
        },
        {
            title: 'Sentiment Alignment',
            content: 'News narratives emphasize operational stability. Public commentary reflects cautious optimism rather than excessive enthusiasm.',
            sentiment: 'Neutral-to-Positive'
        },
        {
            title: 'Cross-Signal Consistency Check',
            type: 'consistency',
            points: [
                { label: 'Price Structure', status: 'Aligned', desc: 'Matches trend indicators' },
                { label: 'Momentum', status: 'Aligned', desc: 'Does not contradict direction' },
                { label: 'Sentiment', status: 'Supportive', desc: 'Supports observed specific behavior' }
            ]
        },
        {
            title: 'Investor Implications',
            content: 'The stock is behaving in line with its historical risk profile. Market participants are responding rationally to available information.',
            takeaway: 'Suitable for risk-monitoring investors seeking stability.'
        }
    ]
};
