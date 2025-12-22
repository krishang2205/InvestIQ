import React from 'react';
import styles from './TrustStrip.module.css';

const TrustStrip = () => {
    const brands = [
        { name: 'The Economic Times', opacity: 0.8 },
        { name: 'moneycontrol', opacity: 0.7 },
        { name: 'livemint', opacity: 0.7 },
        { name: 'CNBC-TV18', opacity: 0.8 },
        { name: 'Business Standard', opacity: 0.6 }
    ];

    return (
        <div className={styles.strip}>
            <div className={styles.container}>
                <span className={styles.label}>As seen on</span>
                <div className={styles.brandGrid}>
                    {brands.map((brand, index) => (
                        <div key={index} className={styles.brand} style={{ opacity: brand.opacity }}>
                            {/* Placeholder for Logos - using styled text for now */}
                            {brand.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustStrip;
