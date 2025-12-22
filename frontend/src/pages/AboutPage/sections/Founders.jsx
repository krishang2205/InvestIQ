import React from 'react';
import styles from './Founders.module.css';

const founders = [
    {
        name: "Krishang Darji",
        role: "Co-Founder & CEO",
        bio: "Visionary leader focused on bridging the gap between complex financial data and actionable user insights.",
        image: ""
    },
    {
        name: "Ishan Jingar",
        role: "Co-Founder & CTO",
        bio: "Engineering architect building the robust AI infrastructure that powers our real-time predictions.",
        image: ""
    },
    {
        name: "Mohit Dixit",
        role: "Co-Founder & COO",
        bio: "Operations strategist ensuring our product delivers tangible value and seamless experiences.",
        image: ""
    }
];

const Founders = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Meet the Founders</h2>
                    <p className={styles.subtitle}>
                        Built by a team that’s been in the trenches. We combine deep technical expertise with real-world financial experience.
                    </p>
                </div>

                <div className={styles.grid}>
                    {founders.map((founder, idx) => (
                        <div key={idx} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                {founder.image ? (
                                    <div className={styles.imagePlaceholder} style={{ backgroundImage: `url(${founder.image})` }}></div>
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        {/* Placeholder Initials */}
                                        {founder.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                            </div>
                            <h3 className={styles.name}>{founder.name}</h3>
                            <div className={styles.role}>{founder.role}</div>
                            <p className={styles.bio}>{founder.bio}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Founders;
