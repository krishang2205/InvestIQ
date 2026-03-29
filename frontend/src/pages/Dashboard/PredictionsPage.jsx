import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Check, X, Repeat, List, Lock, Crown } from 'lucide-react';

const PredictionsPage = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedStocks, setLikedStocks] = useState([]);
    const [passedStocks, setPassedStocks] = useState([]);
    const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
    
    // Premium Features State
    const [isPremium, setIsPremium] = useState(false); // Toggle true to test Premium mode
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [rightSwipes, setRightSwipes] = useState(() => {
        const saved = localStorage.getItem('daily_right_swipes');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (new Date(parsed.date).toDateString() === new Date().toDateString()) {
                    return parsed.count;
                }
            } catch (e) {
                console.error("Error parsing local storage", e);
            }
        }
        return 0;
    });

    useEffect(() => {
        localStorage.setItem('daily_right_swipes', JSON.stringify({
            date: new Date().toISOString(),
            count: rightSwipes
        }));
    }, [rightSwipes]);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/DxtMhit/nifty100-api/main/predictions.json');
                const data = await response.json();
                
                // Shuffle data to make it feel more discovery-focused
                const shuffled = data.sort(() => 0.5 - Math.random());
                setPredictions(shuffled);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching predictions:", error);
                setLoading(false);
            }
        };

        fetchPredictions();
    }, []);

    const handleSwipe = (direction, prediction) => {
        if (direction === 'right') {
            if (!isPremium && rightSwipes >= 5) {
                setShowPremiumModal(true);
                return; // Prevent swipe action and keep the card
            }
            setRightSwipes(prev => prev + 1);
            setLikedStocks([...likedStocks, prediction]);
        } else {
            setPassedStocks([...passedStocks, prediction]);
        }
        
        // Remove top card
        setPredictions((prev) => prev.slice(1));
    };

    const handleReset = () => {
        setPredictions([...likedStocks, ...passedStocks]);
        setLikedStocks([]);
        setPassedStocks([]);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="skeleton-pulse" style={{ width: '100%', maxWidth: '400px', height: '600px', borderRadius: '24px' }}></div>
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
                <div style={{ backgroundColor: 'var(--glass-bg)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>All Caught Up!</h2>
                    <p style={{ color: 'var(--color-secondary)', marginBottom: '2rem' }}>You've reviewed all available predictions.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--color-risk-low)', fontSize: '1.5rem', fontWeight: 'bold' }}>{likedStocks.length}</div>
                            <div style={{ color: 'var(--color-secondary)', fontSize: '0.875rem' }}>Liked</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--color-risk-high)', fontSize: '1.5rem', fontWeight: 'bold' }}>{passedStocks.length}</div>
                            <div style={{ color: 'var(--color-secondary)', fontSize: '0.875rem' }}>Passed</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        style={{ marginTop: '2rem', padding: '0.75rem 2rem', borderRadius: '999px', backgroundColor: 'var(--color-accent)', color: '#000', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Repeat size={18} /> Reset Stack
                    </button>
                </div>
            </div>
        );
    }

    // Top card is the first item in the array
    const activeCard = predictions[0];

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', overflow: 'hidden', position: 'relative' }}>
            
            {/* Watchlist Toggle Button */}
            <button 
                onClick={() => {
                    if (!isPremium) {
                        setShowPremiumModal(true);
                    } else {
                        setIsWatchlistOpen(true);
                    }
                }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 40, backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary)' }}
                className="shadow-soft-lift hover-glow-gold"
            >
                <List size={24} />
                {likedStocks.length > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#10B981', color: 'black', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--color-bg)' }}>
                        {likedStocks.length}
                    </span>
                )}
            </button>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }} className="text-gradient-gold">Discovery</h1>
                <p style={{ color: 'var(--color-secondary)' }}>Swipe Right to Watch, Left to Pass</p>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '600px', perspective: '1000px' }}>
                <AnimatePresence>
                    {predictions.map((prediction, index) => {
                        // Only render the top few cards for performance and visual effect
                        if (index > 2) return null;
                        
                        return (
                            <SwipeableCard 
                                key={prediction.Ticker} 
                                prediction={prediction} 
                                index={index} 
                                onSwipe={(dir) => handleSwipe(dir, prediction)} 
                                isPremium={isPremium}
                                onPremiumClick={() => setShowPremiumModal(true)}
                            />
                        );
                    }).reverse()}
                </AnimatePresence>
            </div>
            
            {/* Premium Indicator */}
            {!isPremium && (
                <div style={{ marginTop: '1rem', color: 'var(--color-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={14} color="var(--color-accent)" />
                    Free Tier: {5 - rightSwipes > 0 ? `${5 - rightSwipes} Right Swipes Left` : '0 Right Swipes Left'}
                </div>
            )}

            {/* Control buttons below cards */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', zIndex: 10 }}>
                <button 
                    onClick={() => handleSwipe('left', activeCard)}
                    className="shadow-soft-lift"
                    style={{ 
                        width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <X size={32} />
                </button>
                <button 
                    onClick={() => handleSwipe('right', activeCard)}
                    className="shadow-soft-lift hover-glow-green"
                    style={{ 
                        width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                        border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <Check size={32} />
                </button>
            </div>

            {/* Watchlist Sidebar Overlay */}
            <AnimatePresence>
                {isWatchlistOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsWatchlistOpen(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 45, backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-bg)', borderLeft: '1px solid var(--glass-border)', zIndex: 50, padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }} className="text-gradient-gold">My Watchlist</h2>
                                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Predictions you liked</p>
                                </div>
                                <button onClick={() => setIsWatchlistOpen(false)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '0.5rem', color: 'var(--color-secondary)' }} className="hover-glow-gold"><X size={20} /></button>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }} className="custom-scrollbar">
                                {likedStocks.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-secondary)', marginTop: '4rem' }}>
                                        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                                            <Zap size={32} color="rgba(255,255,255,0.3)" />
                                        </div>
                                        <p style={{ fontSize: '1.125rem', color: 'var(--color-primary)' }}>It's quiet here...</p>
                                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '80%', margin: '0.5rem auto 0' }}>Swipe right on a prediction card to save it to your watchlist.</p>
                                    </div>
                                ) : (
                                    likedStocks.map((stock) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            key={stock.Ticker} 
                                            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{stock.Ticker.replace('.NS', '')}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                    <Zap size={12} color={stock.final_direction === 'UP' ? '#10B981' : '#EF4444'} />
                                                    {stock.signal} Signal
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', color: stock.final_direction === 'UP' ? '#10B981' : '#EF4444', fontSize: '1.125rem', backgroundColor: stock.final_direction === 'UP' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '8px' }}>
                                                    {stock.final_direction === 'UP' ? '+' : ''}{stock.final_pred_pct.toFixed(2)}%
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.35rem' }}>
                                                    Conf: {stock.final_confidence}%
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Premium Modal */}
            <AnimatePresence>
                {showPremiumModal && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowPremiumModal(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 60, backdropFilter: 'blur(8px)' }}
                        />
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 65, pointerEvents: 'none', padding: '1rem' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="shadow-glow-gold"
                                style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-accent)', borderRadius: '24px', padding: '2rem', textAlign: 'center', pointerEvents: 'auto', maxHeight: '90vh', overflowY: 'auto' }}
                            >
                            <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(209, 199, 157, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <Crown size={40} color="var(--color-accent)" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }} className="text-gradient-gold">Unlock Premium</h2>
                            <p style={{ color: 'var(--color-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Upgrade to InvestIQ Premium to supercharge your discovery:
                            </p>
                            <ul style={{ textAlign: 'left', color: 'var(--color-primary)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="#10B981" /> Unlimited Daily Swipes</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="#10B981" /> Deep Model Confidence Metrics</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="#10B981" /> Unlock Your Watchlist</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="#10B981" /> Historical Accuracy Data</li>
                            </ul>
                            <button 
                                onClick={() => {
                                    setIsPremium(true);
                                    setShowPremiumModal(false);
                                }}
                                style={{ width: '100%', padding: '1rem', borderRadius: '999px', backgroundColor: 'var(--color-accent)', color: '#000', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: 'pointer' }}
                            >
                                Upgrade Now
                            </button>
                            <button 
                                onClick={() => setShowPremiumModal(false)}
                                style={{ marginTop: '1rem', padding: '0.5rem', color: 'var(--color-secondary)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Maybe Later
                            </button>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// Card Component
const SwipeableCard = ({ prediction, index, onSwipe, isPremium, onPremiumClick }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
    const scale = index === 0 ? 1 : index === 1 ? 0.95 : 0.9;
    const yOffset = index * 15;
    
    // Badge opacities
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

    const isUp = prediction.final_direction === 'UP';
    const accentColor = isUp ? 'var(--color-risk-low)' : 'var(--color-risk-high)';
    const Icon = isUp ? TrendingUp : TrendingDown;

    const handleDragEnd = (_, info) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe('right');
        } else if (info.offset.x < -threshold) {
            onSwipe('left');
        }
    };

    return (
        <motion.div
            style={{
                x: index === 0 ? x : 0,
                rotate: index === 0 ? rotate : 0,
                opacity: opacity,
                scale: scale,
                y: yOffset,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#111',
                borderRadius: '24px',
                border: `1px solid rgba(255,255,255,0.08)`,
                boxShadow: index === 0 ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
                cursor: index === 0 ? 'grab' : 'auto',
                zIndex: 10 - index,
                overflow: 'hidden',
                willChange: 'transform'
            }}
            drag={index === 0 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: scale, opacity: 1, y: yOffset }}
            exit={{ x: x.get() > 0 ? 1000 : -1000, opacity: 0, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: `linear-gradient(to bottom, ${isUp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}, transparent)` }} />
            
            {/* Swiping Badges */}
            <motion.div style={{ position: 'absolute', top: '2rem', left: '2rem', opacity: likeOpacity, color: '#10B981', border: '4px solid #10B981', borderRadius: '12px', padding: '0.25rem 1rem', fontSize: '2rem', fontWeight: 'bold', transform: 'rotate(-15deg)', zIndex: 20 }}>
                LIKE
            </motion.div>
            <motion.div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: nopeOpacity, color: '#EF4444', border: '4px solid #EF4444', borderRadius: '12px', padding: '0.25rem 1rem', fontSize: '2rem', fontWeight: 'bold', transform: 'rotate(15deg)', zIndex: 20 }}>
                PASS
            </motion.div>

            <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1, margin: 0 }}>{prediction.Ticker.replace('.NS', '')}</h2>
                        <span style={{ color: 'var(--color-secondary)', fontSize: '1rem', marginTop: '0.25rem', display: 'block' }}>National Stock Exchange</span>
                    </div>
                    <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '999px',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${accentColor}40`
                    }}>
                        <Zap size={16} color={accentColor} />
                        <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>{prediction.signal} SIGNAL</span>
                    </div>
                </div>

                {/* Main Prediction */}
                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Icon size={80} color={accentColor} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                    <div style={{ fontSize: '1.25rem', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Expected Move</div>
                    <div style={{ fontSize: '4.5rem', fontWeight: '900', color: accentColor, lineHeight: 1, letterSpacing: '-2px' }}>
                        {isUp ? '+' : ''}{prediction.final_pred_pct.toFixed(2)}%
                    </div>
                    <div style={{ marginTop: '1rem', display: 'inline-flex', padding: '0.5rem 1rem', backgroundColor: 'rgba(209, 199, 157, 0.1)', borderRadius: '12px', color: 'var(--color-accent)', alignSelf: 'center', fontWeight: '600' }}>
                        Confidence: {prediction.final_confidence}%
                    </div>
                </div>

                {/* Footer Stats / Models */}
                <div 
                    onClick={() => !isPremium && onPremiumClick()}
                    style={{ 
                        marginTop: 'auto', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative', cursor: !isPremium ? 'pointer' : 'default', overflow: 'hidden'
                    }}
                >
                    <div style={{ filter: !isPremium ? 'blur(6px)' : 'none', opacity: !isPremium ? 0.6 : 1, transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <div>
                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Deep Learning (LSTM)</div>
                                <div style={{ fontWeight: 'bold', color: prediction.lstm_pred_pct > 0 ? '#10B981' : '#EF4444' }}>
                                    {prediction.lstm_pred_pct > 0 ? '+' : ''}{prediction.lstm_pred_pct.toFixed(2)}%
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Tree Model (XGB)</div>
                                <div style={{ fontWeight: 'bold', color: prediction.xgb_pred_pct > 0 ? '#10B981' : '#EF4444' }}>
                                    {prediction.xgb_pred_pct > 0 ? '+' : ''}{prediction.xgb_pred_pct.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={16} color="var(--color-secondary)" />
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>Historic Accuracy</span>
                            </div>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{prediction.dir_acc_pct}%</span>
                        </div>
                    </div>

                    {!isPremium && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <Lock size={28} color="rgba(255,255,255,0.8)" style={{ marginBottom: '0.5rem' }} />
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Unlock Premium Metrics</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PredictionsPage;
