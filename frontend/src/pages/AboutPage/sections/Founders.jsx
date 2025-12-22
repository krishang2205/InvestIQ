import React from 'react';
import styles from './Founders.module.css';

const Founders = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>About the Founders</h2>

                <div className={styles.content}>
                    <p className={styles.text}>
                        This company was founded by people who’ve been in the trenches.
                    </p>
                    <p className={styles.text}>
                        We’ve worked on projects where timelines were tight, expectations were high, and resources were limited.
                        We’ve made mistakes, learned fast, and figured out what actually works in real-world conditions.
                    </p>
                    <p className={styles.text}>
                        That experience shapes how we think and how we build.
                    </p>

                    <div className={styles.highlightBox}>
                        <h4 className={styles.boxTitle}>We care deeply about:</h4>
                        <div className={styles.valueList}>
                            <div className={styles.valueItem}>
                                <span className={styles.check}>✦</span>
                                <span>Building things we’d personally use</span>
                            </div>
                            <div className={styles.valueItem}>
                                <span className={styles.check}>✦</span>
                                <span>Being honest about what we can and can’t do</span>
                            </div>
                            <div className={styles.valueItem}>
                                <span className={styles.check}>✦</span>
                                <span>Treating users like partners, not metrics</span>
                            </div>
                        </div>
                        <p className={styles.closing}>
                            "This isn’t a side experiment for us. It’s the work we stand behind."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Founders;
