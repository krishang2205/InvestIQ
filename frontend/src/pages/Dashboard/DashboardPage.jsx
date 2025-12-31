import React from 'react';
import MarketMoodWidget from './components/widgets/MarketMoodWidget';
import MarketIndicesWidget from './components/widgets/MarketIndicesWidget';
import StockMoversWidget from './components/widgets/StockMoversWidget';

const DashboardPage = () => {
    return (
        <div style={{ padding: '0rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Dashboard Overview</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Row 1: Market Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <MarketMoodWidget />
                    </div>
                    <div style={{ flex: 2, minWidth: '350px' }}>
                        <MarketIndicesWidget />
                    </div>
                </div>

                {/* Row 2: Detailed Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <StockMoversWidget />
                    </div>
                    <div className="glass-panel" style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
                        Screener Shortcuts Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
