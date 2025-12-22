import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    Things were harder than <br />
                    they needed to be.
                </h1>

                <div className={styles.introText}>
                    <p>
                        We started this because too many people were struggling with the same problem.
                        Whether it was unclear tools, overcomplicated solutions, or systems that looked good but didn’t actually help, the gap was obvious.
                    </p>
                    <br />
                    <p>
                        So we decided to build something better. Simple, practical, and focused on real outcomes.
                        Our goal is straightforward: <span className={styles.gold}>help people get results without unnecessary friction.</span>
                    </p>
                </div>

                <div className={styles.problemSection}>
                    <h2 className={styles.subTitle}>The Problem We Care About</h2>
                    <p className={styles.text}>
                        Most products and services today try to impress instead of helping. They add features instead of clarity, noise instead of direction.
                    </p>
                    <p className={styles.text}>
                        We’ve been on the other side of that. Wasting time. Feeling stuck. Knowing what we wanted to do, but not having the right support or tools to do it well.
                    </p>
                    <p className={`${styles.text} ${styles.highlight}`}>
                        That frustration is what drives everything we build.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Hero;
