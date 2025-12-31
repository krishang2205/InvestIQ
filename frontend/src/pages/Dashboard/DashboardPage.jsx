import React from 'react';
import MarketMoodWidget from './components/widgets/MarketMoodWidget';
import MarketIndicesWidget from './components/widgets/MarketIndicesWidget';
import StockMoversWidget from './components/widgets/StockMoversWidget';
import ScreenerShortcutWidget from './components/widgets/ScreenerShortcutWidget';
import NewsWidget from './components/widgets/NewsWidget';
import MutualFundsCarousel from './components/widgets/MutualFundsCarousel';
import DashboardFooter from './components/layout/DashboardFooter';
import Ticker from './components/layout/Ticker';

const DashboardPage = () => {
    return (
        <div style={{
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg)'
        }}>

            {/* Top Ticker - Sticky */}
            <Ticker />

            {/* Main Content Area */}
            <div style={{
                maxWidth: '1280px',
                width: '100%',
                margin: '0 auto',
                padding: '2rem',
                flex: 1
            }}>

                {/* Greeting Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Good evening, Investor :)
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Everything you need to invest in one place.
                    </p>
                </div>

                {/* Section 1: Hero (MMI + Indices) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '320px 1fr',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    height: '380px' // Fixed height for alignment
                }}>
                    <MarketMoodWidget />
                    <MarketIndicesWidget />
                </div>

                {/* Section 2: Stocks & News */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    height: '500px'
                }}>
                    <StockMoversWidget />
                    <NewsWidget />
                </div>

                {/* Section 3: Mutual Funds Carousel */}
                <div style={{ marginBottom: '2rem' }}>
                    <MutualFundsCarousel />
                </div>

                {/* Section 4: Curated Screens Shortcut */}
                <div style={{ marginBottom: '2rem', height: '350px' }}>
                    <ScreenerShortcutWidget />
                </div>

                {/* Footer */}
                <DashboardFooter />

            </div>
        </div>
    );
};

export default DashboardPage;
