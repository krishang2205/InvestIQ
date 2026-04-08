import React from 'react';
import { motion } from 'framer-motion';
import MarketMoodWidget from './components/widgets/MarketMoodWidget';
import MarketIndicesWidget from './components/widgets/MarketIndicesWidget';
import StockMoversWidget from './components/widgets/StockMoversWidget';
import ScreenerShortcutWidget from './components/widgets/ScreenerShortcutWidget';
import NewsWidget from './components/widgets/NewsWidget';
import MutualFundsCarousel from './components/widgets/MutualFundsCarousel';
import DashboardFooter from './components/layout/DashboardFooter';
import Ticker from './components/layout/Ticker';

const DashboardPage = () => {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 16) greeting = "Good afternoon";
    if (hour >= 16) greeting = "Good evening";

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
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '2rem', // Reverted to 2rem
                flex: 1
            }}>

                {/* Greeting Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ marginBottom: '2rem' }}
                > {/* Reverted to 2rem */}
                    <h1 style={{
                        fontSize: '1.75rem', // Reverted font size
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        {greeting}, Investor :)
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}> {/* Reverted font size */}
                        Everything you need to invest in one place.
                    </p>
                </motion.div>

                {/* Section 1: Hero (MMI + Indices) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(340px, 1fr) 2.5fr', // Wider MMI
                        gap: '1.5rem', // Reduced gap slightly
                        marginBottom: '1.5rem',
                        minHeight: '280px' // Reduced height to remove empty space
                    }}
                >
                    <MarketMoodWidget />
                    <MarketIndicesWidget />
                </motion.div>

                {/* Section 2: Stocks & News */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr', // Wider stock section
                        gap: '2rem', // Reverted gap
                        marginBottom: '2rem', // Reverted margin
                        height: '720px', // Further increased height

                    }}
                >
                    <StockMoversWidget />
                    <NewsWidget />
                </motion.div>

                {/* Section 3: Mutual Funds Carousel */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ marginBottom: '1.5rem' }}
                >
                    <MutualFundsCarousel />
                </motion.div>

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
