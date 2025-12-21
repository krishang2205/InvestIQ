import React from 'react';
import { CheckCircle } from 'lucide-react';
import styles from './Workflow.module.css';

const Workflow = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.badge}>How It Works</div>
                    <h2 className={styles.heading}>
                        From Raw Data to <br />
                        <span className={styles.highlight}>Actionable Alpha</span>
                    </h2>
                    <p className={styles.description}>
                        Our pipeline ingests millions of data points, processes them through our XAI engine, and delivers SEBI-compliant insights directly to your dashboard.
                    </p>
                    <ul className={styles.list}>
                        {[
                            'Data cleaning & normalization of historical prices',
                            'Sentiment analysis on global news streams',
                            'Hybrid AI model aggregation for high accuracy',
                            'Automated risk & compliance checking'
                        ].map((item, i) => (
                            <li key={i} className={styles.listItem}>
                                <CheckCircle className={styles.checkIcon} size={24} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.visual}>
                    <div className={styles.glow}></div>
                    <div className={styles.dashboard}>
                        <div className={styles.dashHeader}>
                            <div className={styles.dots}>
                                <div className={`${styles.dot} ${styles.red}`}></div>
                                <div className={`${styles.dot} ${styles.yellow}`}></div>
                                <div className={`${styles.dot} ${styles.green}`}></div>
                            </div>
                            <div className={styles.dashTitle}>InvestIQ Terminal v2.0</div>
                        </div>

                        <div className={styles.dashGrid}>
                            <div className={styles.dashCard}>
                                <div className={styles.dashLabel}>Portfolio Risk</div>
                                <div className={styles.dashValue}>Low (12%)</div>
                            </div>
                            <div className={styles.dashCard}>
                                <div className={styles.dashLabel}>Prediction</div>
                                <div className={`${styles.dashValue} ${styles.dashAccent}`}>Bullish ▲</div>
                            </div>
                        </div>

                        <div className={styles.chartArea}>
                            <svg width="100%" height="100%" viewBox="0 0 400 150" fill="none" preserveAspectRatio="none">
                                <path d="M0,150 L0,120 C50,120 50,80 100,90 C150,100 150,130 200,110 C250,90 250,50 300,60 C350,70 350,20 400,10 L400,150 Z" fill="rgba(31, 182, 170, 0.1)" />
                                <path d="M0,120 C50,120 50,80 100,90 C150,100 150,130 200,110 C250,90 250,50 300,60 C350,70 350,20 400,10" stroke="var(--color-accent)" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Workflow;
