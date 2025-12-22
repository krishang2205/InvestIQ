import React from 'react';
import styles from './Vision.module.css';
import ScrollReveal from '../../../components/ui/ScrollReveal';

const founders = [
    { name: "Krishang Darji", role: "Co-Founder & CEO" },
    { name: "Ishan Jingar", role: "Co-Founder & CTO" },
    { name: "Mohit Dixit", role: "Co-Founder & COO" }
];

const Vision = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <ScrollReveal>
                    <div className={styles.imageContainer}>
                        <div className={`${styles.orb} ${styles.orb1}`}></div>
                        <div className={`${styles.orb} ${styles.orb2}`}></div>

                        <h2 className={styles.teamTitle}>Meet the Minds Behind InvestIQ</h2>
                        <div className={styles.foundersGrid}>
                            {founders.map((founder, idx) => (
                                <div key={idx} className={styles.founderCard}>
                                    <div className={styles.founderImage}>
                                        {founder.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3 className={styles.founderName}>{founder.name}</h3>
                                    <div className={styles.founderRole}>{founder.role}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.content}>
                            <h3 className={styles.quote}>
                                "We don't chase trends. We solve problems. That's the foundation of everything we build at InvestIQ."
                            </h3>
                            <div className={styles.author}>— The InvestIQ Team</div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};

export default Vision;
