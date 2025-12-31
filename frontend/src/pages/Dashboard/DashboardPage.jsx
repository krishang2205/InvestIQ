import React from 'react';
import MarketMoodWidget from './components/widgets/MarketMoodWidget';
import MarketIndicesWidget from './components/widgets/MarketIndicesWidget';

const DashboardPage = () => {
    return (
        <div style={{ padding: '0rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <MarketMoodWidget />
                <div style={{ flex: 2, minWidth: '300px' }}>
                    <MarketIndicesWidget />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
