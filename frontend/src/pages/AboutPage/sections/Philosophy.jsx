import React from 'react';
import styles from './Philosophy.module.css';

const Philosophy = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.contentGrid}>
                    <div className={styles.textContent}>
                        <h2 className={styles.title}>Our Approach</h2>

                        <h3 className={styles.mainStatement}>
                            We focus on doing <span className={styles.gold}>fewer things, properly.</span>
                        </h3>

                        <div className={styles.list}>
                            <div className={styles.listItem}>
                                <p>Clear solutions instead of complicated promises</p>
                            </div>
                            <div className={styles.listItem}>
                                <p>Practical decisions backed by real experience</p>
                            </div>
                            <div className={styles.listItem}>
                                <p>Constant improvement based on feedback, not assumptions</p>
                            </div>
                        </div>

                        <p className={styles.conclusion}>
                            We don’t chase trends. We solve problems.
                        </p>
                    </div>

                    <div className={styles.imageContainer}>
                        <img
                            src="/assets/images/philosophy-abstract.png"
                            alt="Abstract representation of strategy"
                            className={styles.abstractImage}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Philosophy;
