import React from 'react';
import styles from './StockTicker.module.css';

const StockTicker = () => {
    const stocks = [
        { symbol: "NIFTY 50", price: "22,450.30", change: "+120.50", isUp: true },
        { symbol: "SENSEX", price: "73,890.15", change: "+350.20", isUp: true },
        { symbol: "RELIANCE", price: "2,980.45", change: "-15.30", isUp: false },
        { symbol: "HDFCBANK", price: "1,450.10", change: "+12.40", isUp: true },
        { symbol: "TATASTEEL", price: "155.20", change: "+2.10", isUp: true },
        { symbol: "INFY", price: "1,620.75", change: "-8.50", isUp: false },
        { symbol: "ADANIENT", price: "3,250.00", change: "+45.00", isUp: true },
        { symbol: "SBIN", price: "760.30", change: "-3.20", isUp: false },
        { symbol: "ICICIBANK", price: "1,090.50", change: "+5.60", isUp: true },
        { symbol: "BHARTIARTL", price: "1,210.00", change: "+18.20", isUp: true },
        { symbol: "MRF", price: "145,000.00", change: "-120.00", isUp: false },
        { symbol: "ZOMATO", price: "165.40", change: "+4.30", isUp: true }
    ];

    // Duplicate list for seamless loop
    const tickerItems = [...stocks, ...stocks];

    return (
        <div className={styles.tickerContainer}>
            <div className={styles.labelContainer}>
                <span className={styles.pulseDot}></span>
                <span className={styles.labelText}>Market Pulse</span>
            </div>
            <div className={styles.tickerTrack}>
                {tickerItems.map((stock, index) => (
                    <div key={index} className={styles.tickerItem}>
                        <span className={styles.symbol}>{stock.symbol}</span>
                        <span className={styles.price}>₹{stock.price}</span>
                        <span className={`${styles.change} ${stock.isUp ? styles.up : styles.down}`}>
                            {stock.change} {stock.isUp ? '▲' : '▼'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockTicker;
