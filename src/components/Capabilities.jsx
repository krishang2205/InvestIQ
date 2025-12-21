import React from 'react';
import {
    FileText, TrendingUp, PieChart, Calendar, Lightbulb,
    Activity, Cpu, GraduationCap, Search, ShieldCheck,
    LayoutDashboard, ArrowRight
} from 'lucide-react';
import styles from './Capabilities.module.css';

const Capabilities = () => {
    const features = [
        {
            title: "Personalized Intelligence",
            icon: <Cpu size={24} />,
            description: "AI that learns your portfolio and suggests moves tailored to your risk profile."
        },
        {
            title: "Market Prediction",
            icon: <TrendingUp size={24} />,
            description: "Proprietary forecasting models that detect trends before they become headlines."
        },
        {
            title: "Risk Management",
            icon: <ShieldCheck size={24} />,
            description: "Institutional-grade stress testing to protect your wealth from market volatility."
        },
        {
            title: "Natural Language Search",
            icon: <Search size={24} />,
            description: "Find opportunities by asking simple questions like 'Show me high-growth tech stocks'."
        }
    ];

    return (
        <section className={styles.section} id="features">
            <div className={styles.header}>
                <div className={styles.badge}>Platform Capabilities</div>
                <h2 className={styles.heading}>Complete Financial Intelligence</h2>
                <p className={styles.subheading}>
                    Everything you need to analyze, predict, and optimize your investments in one unified system.
                </p>
            </div>

            <div className={styles.grid}>
                {features.map((feature, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <div className={styles.bgIcon}>
                                <TrendingUp size={96} />
                            </div>
                        </div>

                        <h3 className={styles.cardTitle}>{feature.title}</h3>
                        <p className={styles.cardDescription}>{feature.description}</p>

                        <div className={styles.learnMore}>
                            Learn more <ArrowRight size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Capabilities;
