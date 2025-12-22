import React, { useState } from 'react';
import styles from './FeatureSwitcher.module.css';

const FeatureSwitcher = () => {
    const [activeTab, setActiveTab] = useState('analyze');

    const features = {
        discover: {
            title: "Discover hidden opportunities",
            description: "Ask InvestIQ to find stocks matching your unique criteria using natural language.",
            image: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)",
            stats: "15,000+ Stocks Scanned",
            content: (
                <>
                    <div className={styles.chatMessage}>
                        <div className={styles.avatar}>AI</div>
                        <div className={styles.messageBubble}>
                            <p>I analyzed <strong>15,000+</strong> stocks. Here are 3 high-growth opportunities matching your risk profile:</p>
                            <ul className={styles.stockList}>
                                <li><strong>NVDA</strong> (NVIDIA) <span className={styles.up}>+2.4%</span></li>
                                <li><strong>AMD</strong> (Advanced Micro) <span className={styles.up}>+1.8%</span></li>
                                <li><strong>MSFT</strong> (Microsoft) <span className={styles.flat}>0.0%</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.chatInput}>
                        <div className={styles.inputPlaceholder}>Ask me anything...</div>
                        <div className={styles.sendButton}>↑</div>
                    </div>
                </>
            )
        },
        analyze: {
            title: "Analyze Portfolio Risk",
            description: "Instantly stress-test your holdings against inflation, volatility, and market crashes.",
            image: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
            stats: "Institutional Grade Analysis",
            content: (
                <>
                    <div className={styles.chatMessage}>
                        <div className={styles.avatar}>AI</div>
                        <div className={styles.messageBubble}>
                            <p>Monte Carlo Simulation complete. Your portfolio has a <strong>88%</strong> survival rate in a 2008-style crash.</p>
                            <ul className={styles.stockList}>
                                <li><strong>Inflation Shock</strong> <span className={styles.up}>-2.4% (Resilient)</span></li>
                                <li><strong>Tech Bubble</strong> <span className={styles.down} style={{ color: '#EF4444' }}>-15.8% (Risk)</span></li>
                                <li><strong>Rate Hike</strong> <span className={styles.flat}>-0.5% (Stable)</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.chatInput}>
                        <div className={styles.inputPlaceholder}>Run stress test...</div>
                        <div className={styles.sendButton}>↑</div>
                    </div>
                </>
            )
        },
        manage: {
            title: "Manage with Confidence",
            description: "Get daily rebalancing alerts and tax-loss harvesting suggestions automatically.",
            image: "linear-gradient(135deg, #312E81 0%, #4338CA 100%)",
            stats: "Automated Rebalancing",
            content: (
                <>
                    <div className={styles.chatMessage}>
                        <div className={styles.avatar}>AI</div>
                        <div className={styles.messageBubble}>
                            <p>Portfolio drift detected (&gt;5%). Recommended actions to optimize tax efficiency:</p>
                            <ul className={styles.stockList}>
                                <li><strong>Sell SPY</strong> <span className={styles.up}>+12% Gain</span></li>
                                <li><strong>Buy TLT</strong> <span className={styles.up}>Undervalued</span></li>
                                <li><strong>Harvest NVDA</strong> <span className={styles.flat}>Save $1,200</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.chatInput}>
                        <div className={styles.inputPlaceholder}>Review suggestions...</div>
                        <div className={styles.sendButton}>↑</div>
                    </div>
                </>
            )
        }
    };

    return (
        <section className={styles.section} id="features">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.mainHeading}>Your AI edge at every step</h2>
                    <div className={styles.tabs}>
                        {['discover', 'analyze', 'manage'].map((tab) => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={`${styles.textContent} ${styles.animating}`} key={`${activeTab}-text`}>
                        <div className={styles.featureBadge}>{features[activeTab].stats}</div>
                        <h3 className={styles.title}>{features[activeTab].title}</h3>
                        <p className={styles.description}>{features[activeTab].description}</p>
                        <button className={styles.learnMore}>
                            Learn about {activeTab} <span className={styles.arrow}>→</span>
                        </button>
                    </div>

                    <div className={`${styles.visualContent} ${styles.animating}`} style={{ background: features[activeTab].image }} key={`${activeTab}-visual`}>
                        <div className={styles.mockWindow}>
                            <div className={styles.windowHeader}>
                                <div className={styles.dots}>
                                    <span></span><span></span><span></span>
                                </div>
                                <div className={styles.windowTitle}>InvestIQ Assistant</div>
                            </div>
                            <div className={styles.windowBody}>
                                {features[activeTab].content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureSwitcher;
