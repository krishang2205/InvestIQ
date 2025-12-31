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
                width: '100%',
                maxWidth: '1600px', // Max width constraint for ultra-wide screens
                margin: '0 auto',
                padding: '1.5rem', // Reduced from 2rem
                flex: 1
            }}>

                {/* Greeting Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{
                        fontSize: '1.5rem', // Slightly smaller
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.25rem'
                    }}>
                        Good evening, Investor :)
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        Everything you need to invest in one place.
                    </p>
                </div>

                {/* Section 1: Hero (MMI + Indices) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr', // Tighter fit for MMI
                    gap: '1.25rem', // Reduced gap from 1.5rem
                    marginBottom: '1.5rem',
                    minHeight: '340px' // Use min-height instead of fixed
                }}>
                    <MarketMoodWidget />
                    <MarketIndicesWidget />
                </div>

                {/* Section 2: Stocks & News */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', // Slight bias to stock table
                    gap: '1.25rem',
                    marginBottom: '1.5rem',
                    minHeight: '450px', // Changed from height to minHeight
                    alignItems: 'start' // Ensure widgets align at top
                }}>
                    <StockMoversWidget />
                    <NewsWidget />
                </div>

                {/* Section 3: Mutual Funds Carousel */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <MutualFundsCarousel />
                </div>

                {/* Section 4: Curated Screens Shortcut */}
                <div style={{ marginBottom: '3rem', minHeight: 'auto' }}>
                    <ScreenerShortcutWidget />
                </div>

                {/* Footer */}
                <DashboardFooter />

            </div>
        </div>
    );
};

export default DashboardPage;
