import React from 'react';
import styles from './Compliance.module.css';

const Compliance = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.badges}>
                    <div className={styles.badge}>
                        <span className={styles.check}>✓</span>
                        InvestIQ is an informational analytics platform
                    </div>
                    <div className={styles.badge}>
                        <span className={styles.check}>✓</span>
                        No buy or sell execution
                    </div>
                    <div className={styles.badge}>
                        <span className={styles.check}>✓</span>
                        Aligned with SEBI investor awareness principles
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Compliance;
