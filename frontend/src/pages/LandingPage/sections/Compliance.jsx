import React from 'react';
import styles from './Compliance.module.css';

const Compliance = () => {
    const items = [
        "InvestIQ is an informational analytics platform",
        "No buy or sell execution capabilities",
        "Aligned with SEBI investor awareness principles",
        "Bank-grade 256-bit encryption",
        "Real-time data processing",
        "Transparent methodology",
        "Secure & Private",
        "Analyst-grade tools"
    ];

    // Duplicate for infinite scroll
    const marqueeItems = [...items, ...items, ...items];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.marqueeWrapper}>
                    {/* Row 1 - Regular Direction */}
                    <div className={styles.marqueeRow}>
                        <div className={styles.marqueeContent}>
                            {marqueeItems.map((item, idx) => (
                                <div key={`r1-${idx}`} className={styles.badge}>
                                    <span className={styles.icon}>✦</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 2 - Reverse Direction */}
                    <div className={`${styles.marqueeRow} ${styles.reverse}`}>
                        <div className={styles.marqueeContent}>
                            {marqueeItems.map((item, idx) => (
                                <div key={`r2-${idx}`} className={styles.badge}>
                                    <span className={styles.icon}>✦</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 3 - Regular Direction */}
                    <div className={styles.marqueeRow}>
                        <div className={styles.marqueeContent}>
                            {marqueeItems.map((item, idx) => (
                                <div key={`r3-${idx}`} className={styles.badge}>
                                    <span className={styles.icon}>✦</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Compliance;
