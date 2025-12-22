import React from 'react';
import styles from './SmartSearch.module.css';

const SmartSearch = () => {
    return (
        <section className={styles.container}>
            <div className={styles.searchWrapper}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search a stock, indicator, or investment concept"
                />
                <button className={styles.searchButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>
            <p className={styles.hint}>
                Search routing: Stock reports • Learning content • Portfolio analysis
            </p>
        </section>
    );
};

export default SmartSearch;
