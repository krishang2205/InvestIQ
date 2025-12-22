import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CTA.module.css';

const CTA = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>What’s Next</h2>

                <p className={styles.text}>
                    If what we’re building resonates with you, we’d love to connect.
                    Explore our work, reach out with questions, or start a conversation.
                    That’s usually how the best things begin.
                </p>

                <div className={styles.actions}>
                    <Link to="/" className={styles.primaryButton}>
                        Explore Platform
                    </Link>
                    <a href="mailto:hello@investiq.com" className={styles.secondaryButton}>
                        Get in Touch
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CTA;
