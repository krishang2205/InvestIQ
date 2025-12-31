import React from 'react';
import MarketMoodWidget from './components/widgets/MarketMoodWidget';

const DashboardPage = () => {
    return (
        <div style={{ padding: '0rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <MarketMoodWidget />
                {/* Placeholders for other widgets */}
                <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Indices Widget Placeholder
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
