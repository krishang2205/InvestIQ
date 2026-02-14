import { useNavigate } from 'react-router-dom';
import { NewsItem } from './NewsComponents';

const NewsWidget = () => {
    const navigate = useNavigate();
    const tabs = ['All', 'News', 'Macro', 'Earnings'];
    const [activeTab, setActiveTab] = useState('All');

    // Fetch real news
    const { data: newsItems, loading, error } = useMarketData('news', 600000); // 10 min refresh

    // Client-side filtering
    const displayNews = (newsItems || []).filter(item => {
        if (activeTab === 'All') return true;
        // Simple heuristic mapping if type isn't perfect, or exact match
        if (activeTab === 'Macro') return item.type === 'Macro' || item.title.includes('RBI') || item.title.includes('inflation');
        if (activeTab === 'Earnings') return item.type === 'Earnings' || item.title.includes('Results') || item.title.includes('Profit');
        return true; // Default to showing all for 'News' tab or if logic misses, to avoid empty
    });

    if (loading && (!newsItems || newsItems.length === 0)) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                borderRadius: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Loading News...</span>
            </div>
        );
    }

    if (error && (!newsItems || newsItems.length === 0)) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                borderRadius: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>News Unavailable</span>
            </div>
        );
    }

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '1.25rem 1.25rem 0 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        Today's news and events
                    </h3>
                    <div
                        onClick={() => navigate('/news')}
                        style={{ fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        View all
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {tabs.map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0 0 0.6rem 0',
                                color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: activeTab === tab ? '600' : '400',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
            </div>

            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                {displayNews.map((item, idx) => (
                    <NewsItem key={idx} {...item} />
                ))}
            </div>
        </div>
    );
};

export default NewsWidget;
