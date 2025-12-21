import React, { useState, useEffect, useRef } from 'react';
import styles from './Hero.module.css';

const useCounter = (end, duration = 2000, start = 0) => {
    const [count, setCount] = useState(start);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                    setCount(start); // Reset count when out of view
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [start]);

    useEffect(() => {
        if (!isVisible) return;

        let startTime = null;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // EaseOutQuart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(ease * (end - start) + start));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, start, isVisible]);

    return { count, elementRef };
};

const StatItem = ({ label, value }) => {
    const isNumber = /^[0-9]/.test(value);

    // Parse number and suffix if it starts with a number
    let numberPart = 0;
    let suffix = value;

    if (isNumber) {
        const match = value.match(/^(\d+)(.*)$/);
        if (match) {
            numberPart = parseInt(match[1], 10);
            suffix = match[2];
        }
    }

    const { count, elementRef } = useCounter(isNumber ? numberPart : 0, 2000);

    return (
        <div className={styles.statItem} ref={elementRef}>
            <div className={styles.statValue}>
                {isNumber ? `${count}${suffix}` : value}
            </div>
            <div className={styles.statLabel}>{label}</div>
        </div>
    );
};

const Stats = () => {
    const stats = [
        { label: 'Prediction Accuracy', value: '94%+' },
        { label: 'Data Points/Day', value: '1M+' },
        { label: 'Active Portfolios', value: '10k+' },
        { label: 'Security Level', value: 'Enterprise' },
    ];

    return (
        <div className={styles.statsGrid}>
            {stats.map((stat, idx) => (
                <StatItem key={idx} label={stat.label} value={stat.value} />
            ))}
        </div>
    );
};

export default Stats;
