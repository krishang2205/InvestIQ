import SmartSearch from './SmartSearch';
import Stats from './Stats';
import styles from './Hero.module.css';

const Hero = ({ onAuth }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.leftCol}>
            <div className={styles.badge}>
              <span className={styles.pulse}></span>
              System Live & Compliant
            </div>

            <h1 className={styles.headline}>
              <span className={styles.typewriter1}>Master the Market with</span> <br />
              <span className={`${styles.highlight} ${styles.typewriter2}`}>Intelligent Prediction</span>
            </h1>

            <p className={styles.subheading}>
              InvestIQ combines advanced AI, SEBI-compliant safeguards, and institutional-grade portfolio analysis to give you the clearest view of the financial future.
            </p>

            <div className={styles.searchWrapper}>
              <SmartSearch />
            </div>

            <div className={styles.ctaGroup}>
              <button className={`${styles.button} ${styles.primaryButton}`} onClick={() => onAuth('signup')}>
                Get Started Free
              </button>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.phoneMock}>
              <div className={styles.phoneScreen}>
                <div className={styles.mockHeader}>
                  <div className={styles.mockMenuIcon}></div>
                  <div className={styles.mockLogo}>InvestIQ</div>
                  <div className={styles.mockAvatar}></div>
                </div>

                <div className={styles.mockChartArea}>
                  <div className={styles.chartTitle}>Portfolio Growth</div>
                  <div className={styles.chartValue}>+24.5%</div>
                  <div className={styles.chartVisual}></div>
                </div>

                <div className={styles.mockList}>
                  <div className={styles.mockListItem}>
                    <div className={styles.itemIcon}></div>
                    <div className={styles.itemText}>
                      <div className={styles.itemTitle}>NIFTY 50 Prediction</div>
                      <div className={styles.itemSubtitle}>Bullish • High Confidence</div>
                    </div>
                  </div>
                  <div className={styles.mockListItem}>
                    <div className={styles.itemIcon}></div>
                    <div className={styles.itemText}>
                      <div className={styles.itemTitle}>Reliance Ind.</div>
                      <div className={styles.itemSubtitle}>Analysis Ready</div>
                    </div>
                  </div>
                  <div className={styles.mockListItem}>
                    <div className={styles.itemIcon}></div>
                    <div className={styles.itemText}>
                      <div className={styles.itemTitle}>Tata Motors</div>
                      <div className={styles.itemSubtitle}>Breakout Detected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.aura}></div>
          </div>
        </div>

        <Stats />
      </div>
    </section>
  );
};

export default Hero;
