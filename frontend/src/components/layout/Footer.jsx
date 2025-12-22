import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Column */}
                    <div className={styles.column}>
                        <div className={styles.brand}>
                            <div className={styles.logoIcon}>
                                <TrendingUp size={20} />
                            </div>
                            <span className={styles.logoText}>InvestIQ</span>
                        </div>
                        <p className={styles.description}>
                            Empowering investors with AI-driven insights, transparent analysis, and comprehensive education.
                        </p>
                    </div>

                    {/* Platform Column */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Platform</h4>
                        <ul className={styles.list}>
                            <li><a href="#" className={styles.link}>Stock Prediction</a></li>
                            <li><a href="#" className={styles.link}>Portfolio Analysis</a></li>
                            <li><a href="#" className={styles.link}>Learning Center</a></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Company</h4>
                        <ul className={styles.list}>
                            <li><Link to="/about" className={styles.link}>About Us</Link></li>
                            <li><a href="#" className={styles.link}>Contact</a></li>
                            <li><a href="#" className={styles.link}>Careers</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Legal</h4>
                        <ul className={styles.list}>
                            <li><a href="#" className={styles.link}>Privacy Policy</a></li>
                            <li><a href="#" className={styles.link}>Terms of Service</a></li>
                            <li><a href="#" className={styles.link}>SEBI Compliance</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} InvestIQ. All rights reserved.</p>
                    <p>Investment in securities market are subject to market risks. Read all related documents carefully before investing.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
