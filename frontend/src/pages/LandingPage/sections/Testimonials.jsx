import React from 'react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
    const reviews = [
        {
            initials: "JS",
            quote: "InvestIQ gave me the confidence to handle my own portfolio. The risk analysis is a game changer.",
            role: "Retail Investor"
        },
        {
            initials: "MK",
            quote: "Finally, an AI that explains *why* a stock is moving. No more black box predictions.",
            role: "Analysis Pro"
        },
        {
            initials: "AL",
            quote: "The personalized suggestions saved me from a major downturn last quarter. Highly recommended.",
            role: "Early Adopter"
        }
    ];

    return (
        <section className={styles.section} id="testimonials">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.heading}>Trusted by investors</h2>
                </div>
                <div className={styles.grid}>
                    {reviews.map((review, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.avatar}>{review.initials}</div>
                            <div className={styles.stars}>★★★★★</div>
                            <p className={styles.quote}>"{review.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
