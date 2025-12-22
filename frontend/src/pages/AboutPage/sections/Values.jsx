import React from 'react';
import styles from './Values.module.css';

const Values = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>What We Believe In</h2>

                <div className={styles.valuesGrid}>
                    <div className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Clarity over complexity</h3>
                        <p className={styles.valueDesc}>We strip away the noise to find the signal.</p>
                    </div>
                    <div className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Progress over perfection</h3>
                        <p className={styles.valueDesc}>Moving forward is better than standing still.</p>
                    </div>
                    <div className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Honest communication</h3>
                        <p className={styles.valueDesc}>We say what is true, not just what sounds good.</p>
                    </div>
                    <div className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Long-term value</h3>
                        <p className={styles.valueDesc}>We build for the future, not just for today.</p>
                    </div>
                </div>

                <div className={styles.targetSection}>
                    <h2 className={styles.title}>Who This Is For</h2>

                    <div className={styles.splitGrid}>
                        <div>
                            <h3 className={styles.columnTitle}>We’re a good fit if you value:</h3>
                            <div className={styles.list}>
                                <div className={styles.item}>
                                    <span className={styles.iconGood}>✓</span>
                                    <span>Straight answers</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.iconGood}>✓</span>
                                    <span>Thoughtful solutions</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.iconGood}>✓</span>
                                    <span>Work that respects your time</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className={styles.columnTitle}>We’re probably not for you if:</h3>
                            <div className={styles.list}>
                                <div className={styles.item}>
                                    <span className={styles.iconBad}>×</span>
                                    <span>You're looking for hype</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.iconBad}>×</span>
                                    <span>You want shortcuts</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.iconBad}>×</span>
                                    <span>You want one-size-fits-all answers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className={styles.slogan}>
                        "These aren’t slogans. They’re the rules we operate by."
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Values;
