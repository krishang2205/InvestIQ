import React from 'react';
import styles from './Mission.module.css';

const Mission = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.preHeading}>About InvestIQ</div>
                    <h2 className={styles.heading}>
                        Democratizing institutional-grade investment intelligence for every investor.
                    </h2>
                    <p className={styles.description}>
                        InvestIQ is a premium analytics platform that combines <span className={styles.highlight}>advanced AI prediction models</span> with real-time market data to provide clear, actionable insights. We bridge the gap between complex financial algorithms and everyday decision-making, ensuring you have the clarity you need to master the market.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Mission;
