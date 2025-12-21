import React from 'react';
import styles from './Pricing.module.css';

const Pricing = () => {
    return (
        <section className={styles.section} id="pricing">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.heading}>Invest in a better future</h2>
                    <p className={styles.subheading}>Simple pricing. No hidden fees.</p>
                </div>

                <div className={styles.grid}>
                    {/* Monthly Plan */}
                    <div className={styles.card}>
                        <div className={styles.planName}>Monthly</div>
                        <div className={styles.price}>₹99<span className={styles.period}>/mo</span></div>
                        <ul className={styles.features}>
                            <li>AI-Powered Search</li>
                            <li>Basic Risk Analysis</li>
                            <li>Daily Alerts</li>
                        </ul>
                        <button className={styles.buttonWhite}>Get Started</button>
                    </div>

                    {/* Annual Plan (Highlighted) */}
                    <div className={`${styles.card} ${styles.highlighted}`}>
                        <div className={styles.badge}>Most Popular</div>
                        <div className={styles.planName}>Annual</div>
                        <div className={styles.price}>₹999<span className={styles.period}>/yr</span></div>
                        <div className={styles.savings}>Save 15%</div>
                        <ul className={styles.features}>
                            <li>Everything in Monthly</li>
                            <li>Advanced Portfolio Stress Test</li>
                            <li>Tax-Loss Harvesting</li>
                        </ul>
                        <button className={styles.buttonGold}>Get Annual Plan</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
