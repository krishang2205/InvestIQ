import React from 'react';
import MarketMoodWidget from './components/widgets/MarketMoodWidget';
import MarketIndicesWidget from './components/widgets/MarketIndicesWidget';
import StockMoversWidget from './components/widgets/StockMoversWidget';
import ScreenerShortcutWidget from './components/widgets/ScreenerShortcutWidget';
import Ticker from './components/layout/Ticker';

const DashboardPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Top Ticker - Full Width */}
            <div style={{ flexShrink: 0, zIndex: 10 }}>
                <Ticker />
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="custom-scrollbar" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {/* Hero Section */}
                <div style={{ marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Good evening :)
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px' }}>
                        EVERYTHING YOU NEED TO INVEST IN ONE PLACE
                    </p>
                </div>

                {/* Row 1: Market Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <MarketMoodWidget />
                    </div>
                    <div style={{ flex: 2, minWidth: '350px' }}>
                        <MarketIndicesWidget />
                    </div>
                </div>

                {/* Row 2: Detailed Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <StockMoversWidget />
                    </div>
                    <div style={{ flex: 1 }}>
                        <ScreenerShortcutWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
