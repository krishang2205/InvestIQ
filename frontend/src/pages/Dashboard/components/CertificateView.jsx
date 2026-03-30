import React, { useRef } from 'react';
import { Award, ShieldCheck, Download, Printer, Share2 } from 'lucide-react';

const CertificateView = ({ userName, score, total, date }) => {
    const certificateRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
            <div className="flex justify-center gap-4 mb-8 no-print">
                <button 
                    onClick={handlePrint}
                    style={{ 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '12px', 
                        backgroundColor: 'var(--color-accent)', 
                        color: 'black', 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Download size={18} /> SAVE AS PDF
                </button>
                <button 
                    onClick={handlePrint}
                    style={{ 
                        padding: '0.75rem 1.5rem', 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Printer size={18} /> PRINT CERTIFICATE
                </button>
            </div>

            {/* Premium Certificate Design */}
            <div 
                ref={certificateRef}
                className="certificate-container"
                style={{
                    width: '1000px',
                    height: '700px',
                    margin: '0 auto',
                    backgroundColor: '#050505',
                    border: '20px solid #111',
                    position: 'relative',
                    padding: '60px',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                    borderRadius: '4px',
                    color: 'white',
                    fontFamily: "'Inter', serif",
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Borders */}
                <div style={{ position: 'absolute', inset: '15px', border: '2px solid var(--color-accent)', opacity: 0.3, pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', inset: '25px', border: '1px solid var(--color-accent)', opacity: 0.1, pointerEvents: 'none' }}></div>

                {/* Corner Accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '150px', borderTop: '4px solid var(--color-accent)', borderLeft: '4px solid var(--color-accent)' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', borderTop: '4px solid var(--color-accent)', borderRight: '4px solid var(--color-accent)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '150px', height: '150px', borderBottom: '4px solid var(--color-accent)', borderLeft: '4px solid var(--color-accent)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', borderBottom: '4px solid var(--color-accent)', borderRight: '4px solid var(--color-accent)' }}></div>

                {/* Background Watermark */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
                    <Award size={600} color="var(--color-accent)" />
                </div>

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--color-accent)', letterSpacing: '8px', fontWeight: '900', textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '1rem' }}>InvestIQ Academy</h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                            <div style={{ height: '1px', width: '100px', backgroundColor: 'var(--color-accent)', opacity: 0.5 }}></div>
                            <Award size={40} color="var(--color-accent)" />
                            <div style={{ height: '1px', width: '100px', backgroundColor: 'var(--color-accent)', opacity: 0.5 }}></div>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '4.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-2px' }}>Certificate of Mastery</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', fontStyle: 'italic', marginBottom: '3rem' }}>This academic credential is formally awarded to</p>

                    <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-accent)', marginBottom: '1rem', borderBottom: '2px solid rgba(209, 199, 157, 0.2)', paddingBottom: '0.5rem', width: 'fit-content', margin: '0 auto 3rem' }}>
                        {userName || 'VALUED SCHOLAR'}
                    </h2>

                    <p style={{ fontSize: '1.4rem', color: 'var(--color-secondary)', maxWidth: '700px', margin: '0 auto 4rem', lineHeight: '1.6' }}>
                        In recognition of successfully completing the professional InvestIQ Stock Market Curriculum with a distinction score of <span style={{ color: 'white', fontWeight: 'bold' }}>{Math.round((score / total) * 100)}%</span>.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 40px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', width: '200px', marginBottom: '0.5rem' }}></div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', letterSpacing: '1px' }}>DATE OF ISSUANCE</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{date || new Date().toLocaleDateString()}</p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ backgroundColor: 'var(--color-accent-glow)', padding: '1rem', borderRadius: '50%', border: '4px double var(--color-accent)', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={50} color="var(--color-accent)" />
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 'bold', marginTop: '0.5rem', letterSpacing: '1px' }}>VERIFIED AUTHENTIC</p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', width: '200px', marginBottom: '0.5rem' }}></div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', letterSpacing: '1px' }}>INSTITUTIONAL SIGNATORY</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', fontStyle: 'italic' }}>Director of InvestIQ Academy</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .certificate-container { 
                        box-shadow: none !important; 
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default CertificateView;
