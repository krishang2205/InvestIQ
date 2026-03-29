import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Check, X, Repeat, List, Lock, Crown, Sparkles } from 'lucide-react';

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
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', position: 'relative' }}>
                <div className="glow-mesh-gold" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.5, pointerEvents: 'none' }} />
                <div className="skeleton-pulse" style={{ width: '100%', maxWidth: '420px', height: '620px', borderRadius: '32px', zIndex: 1, border: '1px solid rgba(255,255,255,0.05)' }}></div>
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', position: 'relative' }}>
                <div className="glow-mesh-gold" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }} />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ backgroundColor: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(20px)', padding: '4rem 3rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                >
                    <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(209, 199, 157, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <Sparkles size={40} color="var(--color-accent)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }} className="text-gradient-gold">All Caught Up!</h2>
                    <p style={{ color: 'var(--color-secondary)', fontSize: '1.125rem', marginBottom: '3rem' }}>You've reviewed today's premium insights.</p>
                    
                    <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginBottom: '3rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--color-risk-low)', fontSize: '2rem', fontWeight: '800', textShadow: '0 0 20px rgba(16,185,129,0.3)' }}>{likedStocks.length}</div>
                            <div style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>Liked</div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--color-risk-high)', fontSize: '2rem', fontWeight: '800', textShadow: '0 0 20px rgba(239,68,68,0.3)' }}>{passedStocks.length}</div>
                            <div style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>Passed</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="shadow-soft-lift hover-glow-gold"
                        style={{ padding: '1rem 2.5rem', borderRadius: '999px', backgroundColor: 'var(--color-accent)', color: '#000', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.125rem', transition: 'all 0.3s' }}
                    >
                        <Repeat size={20} /> Reset Stack
                    </button>
                </motion.div>
            </div>
        );
    }

    // Top card is the first item in the array
    const activeCard = predictions[0];

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', overflow: 'hidden', position: 'relative' }}>
            
            {/* Ambient Background */}
            <div className="glow-mesh-gold" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.6, pointerEvents: 'none' }} />

            {/* Watchlist Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (!isPremium) {
                        setShowPremiumModal(true);
                    } else {
                        setIsWatchlistOpen(true);
                    }
                }}
                style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 40, backgroundColor: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}
                className="shadow-soft-lift hover-glow-gold"
            >
                <List size={24} />
                {likedStocks.length > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#10B981', color: 'black', borderRadius: '50%', width: '24px', height: '24px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid #000', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }}
                    >
                        {likedStocks.length}
                    </motion.span>
                )}
            </motion.button>

            <div style={{ marginBottom: '2.5rem', textAlign: 'center', zIndex: 10 }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }} className="text-gradient-gold">Discovery</h1>
                <p style={{ color: 'var(--color-secondary)', fontSize: '1.125rem' }}>Swipe <span style={{color: '#10B981', fontWeight: 'bold'}}>Right</span> to Watch, <span style={{color: '#EF4444', fontWeight: 'bold'}}>Left</span> to Pass</p>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '620px', perspective: '1000px', zIndex: 10 }}>
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
                <div style={{ marginTop: '1.5rem', zIndex: 10, backgroundColor: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '999px', color: 'var(--color-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={14} color="var(--color-accent)" />
                    Free Tier: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{5 - rightSwipes > 0 ? `${5 - rightSwipes} Right Swipes Left` : '0 Right Swipes Left'}</span>
                </div>
            )}

            {/* Control buttons below cards */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', zIndex: 10 }}>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left', activeCard)}
                    className="shadow-soft-lift"
                    style={{ 
                        width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.05)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)'
                    }}>
                    <X size={36} strokeWidth={2.5} />
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('right', activeCard)}
                    className="shadow-soft-lift hover-glow-green"
                    style={{ 
                        width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.05)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)'
                    }}>
                    <Check size={36} strokeWidth={2.5} />
                </motion.button>
            </div>

            {/* Watchlist Sidebar Overlay */}
            <AnimatePresence>
                {isWatchlistOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsWatchlistOpen(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 45, backdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '420px', backgroundColor: 'rgba(15,15,15,0.95)', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 50, padding: '2.5rem', display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 50px rgba(0,0,0,0.8)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }} className="text-gradient-gold">Watchlist</h2>
                                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Your premium curated pipeline</p>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsWatchlistOpen(false)} 
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.75rem', color: 'var(--color-primary)', transition: 'all 0.2s' }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }} className="custom-scrollbar">
                                {likedStocks.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-secondary)', marginTop: '5rem' }}>
                                        <motion.div 
                                            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            <Zap size={40} color="var(--color-accent)" />
                                        </motion.div>
                                        <p style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>Pipeline is Empty</p>
                                        <p style={{ fontSize: '0.875rem', marginTop: '0.75rem', maxWidth: '80%', margin: '0.75rem auto 0', lineHeight: 1.6 }}>Find alpha by swiping right on high-conviction predictions.</p>
                                    </div>
                                ) : (
                                    likedStocks.map((stock, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                            key={stock.Ticker} 
                                            className="hover-glow-gold"
                                            style={{ backgroundColor: 'rgba(25,25,25,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{stock.Ticker.replace('.NS', '')}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontWeight: '500' }}>
                                                    <Zap size={14} color={stock.final_direction === 'UP' ? '#10B981' : '#EF4444'} />
                                                    {stock.signal} SIGNAL
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: stock.final_direction === 'UP' ? '#10B981' : '#EF4444', fontSize: '1.25rem', backgroundColor: stock.final_direction === 'UP' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '10px', display: 'inline-block' }}>
                                                    {stock.final_direction === 'UP' ? '+' : ''}{stock.final_pred_pct.toFixed(2)}%
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.5rem', fontWeight: '500' }}>
                                                    Conf: <span style={{color: 'var(--color-primary)'}}>{stock.final_confidence}%</span>
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
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 60, backdropFilter: 'blur(12px)' }}
                        />
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 65, pointerEvents: 'none', padding: '1.5rem' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="shadow-glow-gold"
                                style={{ width: '100%', maxWidth: '440px', backgroundColor: 'rgba(15,15,15,0.95)', border: '1px solid rgba(209, 199, 157, 0.3)', borderRadius: '32px', padding: '3rem 2.5rem', textAlign: 'center', pointerEvents: 'auto', maxHeight: '90vh', overflowY: 'auto', position: 'relative', overflow: 'hidden' }}
                            >
                                {/* Modal Glow */}
                                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 50% 0%, rgba(209, 199, 157, 0.15) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />
                                
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'inline-flex', padding: '1.25rem', backgroundColor: 'rgba(209, 199, 157, 0.1)', border: '1px solid rgba(209, 199, 157, 0.2)', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(209, 199, 157, 0.2)' }}>
                                        <Crown size={48} color="var(--color-accent)" />
                                    </div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.5px' }} className="text-gradient-gold">InvestIQ Premium</h2>
                                    <p style={{ color: 'var(--color-secondary)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.125rem' }}>
                                        Supercharge your alpha discovery with unlimited precision analytics.
                                    </p>
                                    
                                    <ul style={{ textAlign: 'left', color: 'var(--color-primary)', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem' }}>
                                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><Check size={18} color="#10B981" strokeWidth={3} /></div> 
                                            Unlimited Daily Swipes
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem' }}>
                                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><Check size={18} color="#10B981" strokeWidth={3} /></div> 
                                            Deep Model Confidence Metrics
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem' }}>
                                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><Check size={18} color="#10B981" strokeWidth={3} /></div> 
                                            Curate Unlimited Watchlists
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem' }}>
                                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><Check size={18} color="#10B981" strokeWidth={3} /></div> 
                                            Historical Accuracy Data
                                        </li>
                                    </ul>
                                    
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setIsPremium(true);
                                            setShowPremiumModal(false);
                                        }}
                                        style={{ width: '100%', padding: '1.125rem', borderRadius: '999px', backgroundColor: 'var(--color-accent)', color: '#000', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(209, 199, 157, 0.4)', transition: 'background-color 0.3s' }}
                                    >
                                        Upgrade to Premium
                                    </motion.button>
                                    <button 
                                        onClick={() => setShowPremiumModal(false)}
                                        style={{ marginTop: '1.5rem', padding: '0.5rem', color: 'var(--color-secondary)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.color = '#fff'}
                                        onMouseLeave={(e) => e.target.style.color = 'var(--color-secondary)'}
                                    >
                                        Skip for now
                                    </button>
                                </div>
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
    const rotate = useTransform(x, [-250, 250], [-15, 15]);
    const opacity = useTransform(x, [-250, 0, 250], [0.5, 1, 0.5]);
    const scale = index === 0 ? 1 : index === 1 ? 0.94 : 0.88;
    const yOffset = index * 18;
    
    // Badge opacities
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

    const isUp = prediction.final_direction === 'UP';
    const accentColor = isUp ? '#10B981' : '#EF4444';
    const Icon = isUp ? TrendingUp : TrendingDown;

    const handleDragEnd = (_, info) => {
        const threshold = 120;
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
                backgroundColor: 'rgba(20,20,20,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                border: `1px solid rgba(255,255,255,0.08)`,
                boxShadow: index === 0 ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px ${isUp ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)'}` : 'none',
                cursor: index === 0 ? 'grab' : 'auto',
                zIndex: 10 - index,
                overflow: 'hidden',
                willChange: 'transform'
            }}
            drag={index === 0 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            initial={{ scale: 0.9, opacity: 0, y: yOffset + 50 }}
            animate={{ scale: scale, opacity: 1, y: yOffset }}
            exit={{ x: x.get() > 0 ? 1000 : -1000, opacity: 0, rotate: x.get() > 0 ? 20 : -20, transition: { duration: 0.4 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            {/* Ambient Background Glow inside Card */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `radial-gradient(circle at 50% 0%, ${isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'} 0%, transparent 80%)`, pointerEvents: 'none' }} />
            
            {/* Swiping Badges */}
            <motion.div style={{ position: 'absolute', top: '2.5rem', left: '2rem', opacity: likeOpacity, color: '#10B981', border: '3px solid #10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '0.5rem 1.5rem', fontSize: '2.25rem', fontWeight: '900', transform: 'rotate(-15deg)', zIndex: 20, letterSpacing: '2px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
                LIKE
            </motion.div>
            <motion.div style={{ position: 'absolute', top: '2.5rem', right: '2rem', opacity: nopeOpacity, color: '#EF4444', border: '3px solid #EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '0.5rem 1.5rem', fontSize: '2.25rem', fontWeight: '900', transform: 'rotate(15deg)', zIndex: 20, letterSpacing: '2px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>
                PASS
            </motion.div>

            <div style={{ padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.75rem', fontWeight: '900', lineHeight: 1, margin: 0, letterSpacing: '-1px' }}>{prediction.Ticker.replace('.NS', '')}</h2>
                        <span style={{ color: 'var(--color-secondary)', fontSize: '1rem', marginTop: '0.5rem', display: 'block', fontWeight: '500' }}>NSE India</span>
                    </div>
                    <div style={{ 
                        backgroundColor: `${accentColor}15`, padding: '0.5rem 1.25rem', borderRadius: '999px',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${accentColor}40`,
                        boxShadow: `0 0 15px ${accentColor}20`
                    }}>
                        <Zap size={16} color={accentColor} />
                        <span style={{ color: accentColor, fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1.5px' }}>{prediction.signal.toUpperCase()}</span>
                    </div>
                </div>

                {/* Main Prediction */}
                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Icon size={72} color={accentColor} style={{ margin: '0 auto 1.5rem', filter: `drop-shadow(0 0 15px ${accentColor}60)` }} />
                    </motion.div>
                    <div style={{ fontSize: '1.125rem', color: 'var(--color-secondary)', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Expected Move</div>
                    <div style={{ fontSize: '5rem', fontWeight: '900', color: accentColor, lineHeight: 1, letterSpacing: '-2px', textShadow: `0 0 30px ${accentColor}40` }}>
                        {isUp ? '+' : ''}{prediction.final_pred_pct.toFixed(2)}%
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'inline-flex', padding: '0.6rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: 'var(--color-primary)', alignSelf: 'center', fontWeight: '600', fontSize: '1.05rem', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'var(--color-secondary)', marginRight: '0.5rem' }}>Confidence:</span> {prediction.final_confidence}%
                    </div>
                </div>

                {/* Footer Stats / Models */}
                <motion.div 
                    whileHover={!isPremium ? { scale: 1.02 } : {}}
                    onClick={() => !isPremium && onPremiumClick()}
                    style={{ 
                        marginTop: 'auto', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '24px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative', cursor: !isPremium ? 'pointer' : 'default', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                >
                    <div style={{ filter: !isPremium ? 'blur(10px)' : 'none', opacity: !isPremium ? 0.4 : 1, transition: 'all 0.4s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                            <div>
                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LSTM Engine</div>
                                <div style={{ fontWeight: '800', fontSize: '1.25rem', color: prediction.lstm_pred_pct > 0 ? '#10B981' : '#EF4444' }}>
                                    {prediction.lstm_pred_pct > 0 ? '+' : ''}{prediction.lstm_pred_pct.toFixed(2)}%
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--color-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XGBoost Tree</div>
                                <div style={{ fontWeight: '800', fontSize: '1.25rem', color: prediction.xgb_pred_pct > 0 ? '#10B981' : '#EF4444' }}>
                                    {prediction.xgb_pred_pct > 0 ? '+' : ''}{prediction.xgb_pred_pct.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '50%' }}>
                                    <Activity size={16} color="var(--color-primary)" />
                                </div>
                                <span style={{ fontSize: '1rem', color: 'var(--color-secondary)', fontWeight: '500' }}>Historic Accuracy</span>
                            </div>
                            <span style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '1.25rem' }}>{prediction.dir_acc_pct}%</span>
                        </div>
                    </div>

                    {!isPremium && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)' }}>
                            <div style={{ backgroundColor: 'rgba(209, 199, 157, 0.15)', padding: '1rem', borderRadius: '50%', marginBottom: '0.75rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(209, 199, 157, 0.3)' }}>
                                <Lock size={24} color="var(--color-accent)" />
                            </div>
                            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.1rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Tap to Unlock Premium Metrics</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PredictionsPage;
