import React from 'react';
import styles from './TargetAudience.module.css';

const TargetAudience = () => {
    return (
        <section className={styles.section} id="audience">
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.heading}>Built for the modern investor</h2>
                    <p className={styles.subheading}>Whether you're just starting or managing millions, AI adapts to your needs.</p>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.role}>Retail Investors</div>
                            <p className={styles.desc}>Analyze risk and spot opportunities without a finance degree.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.role}>Traders</div>
                            <p className={styles.desc}>Get real-time sentiment analysis and predictive signals.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.role}>Analysts</div>
                            <p className={styles.desc}>Speed up research with automated data synthesis.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TargetAudience;
