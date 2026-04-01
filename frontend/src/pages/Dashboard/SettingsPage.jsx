import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, Key, Database, Mail, Monitor, Trash2, Save, Code, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Initialize state from localStorage or defaults
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('investiq_settings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            name: '',
            email: '',
            currency: 'INR',
            theme: 'midnight',
            emailAlerts: true,
            riskWarnings: true,
            newsletter: false,
            geminiKey: '',
            groqKey: '',
            xaiKey: ''
        };
    });

    // Sync email with actual authenticated user
    useEffect(() => {
        if (user && user.email) {
            setSettings(prev => ({...prev, email: user.email}));
        }
    }, [user]);

    const handleSave = () => {
        setIsSaving(true);
        // Persist to local storage
        localStorage.setItem('investiq_settings', JSON.stringify(settings));
        
        setTimeout(() => {
            setIsSaving(false);
            setToastMessage("Settings saved successfully.");
            
            // Dispatch custom event so other components (like charts/currency formatters) can update
            window.dispatchEvent(new Event('settingsUpdated'));
            
            setTimeout(() => setToastMessage(null), 3000);
        }, 800);
    };

    const handleClearCache = () => {
        if (window.confirm("Are you sure you want to clear your local cache? This will reset your dashboard UI preferences.")) {
            localStorage.clear();
            setToastMessage("Local cache cleared. Please refresh the page.");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const tabs = [
        { id: 'account', label: 'My Account', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'ai', label: 'AI Engines', icon: Code },
        { id: 'data', label: 'Data Management', icon: Database }
    ];

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'var(--color-text)',
        fontSize: '1rem',
        marginTop: '0.5rem',
        marginBottom: '1.5rem',
        transition: 'all 0.2s',
        outline: 'none'
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--color-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Platform <span className="text-gradient-gold">Settings</span>
                </h1>
                <p style={{ color: 'var(--color-secondary)' }}>
                    Manage your InvestIQ account parameters, AI credentials, and interface preferences.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Sidebar */}
                <div className="glass-panel" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '8px',
                                    background: isActive ? 'var(--color-accent)' : 'transparent',
                                    color: isActive ? 'var(--color-bg)' : 'var(--color-secondary)',
                                    border: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: isActive ? 600 : 500,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Pane */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', position: 'relative' }}>
                    
                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <User color="var(--color-accent)" /> Account Profile
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}><User size={14}/> Full Name</label>
                                <input style={inputStyle} value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
                                
                                <label style={labelStyle}><Mail size={14}/> Email Address</label>
                                <input style={inputStyle} type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} disabled />
                            </div>
                        </div>
                    )}

                    {/* Preferences */}
                    {activeTab === 'preferences' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Settings color="var(--color-accent)" /> System Preferences
                            </h2>
                            <label style={labelStyle}>Default Base Currency</label>
                            <select style={{...inputStyle, WebkitAppearance: 'none'}} value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}>
                                <option value="INR">₹ Indian Rupee (INR)</option>
                                <option value="USD">$ US Dollar (USD)</option>
                            </select>

                            <label style={labelStyle}><Monitor size={14}/> Display Theme</label>
                            <select style={{...inputStyle, WebkitAppearance: 'none'}} value={settings.theme} onChange={e => setSettings({...settings, theme: e.target.value})}>
                                <option value="midnight">Midnight Onyx (Default)</option>
                                <option value="dark">Standard Dark</option>
                                <option value="amoled">Pure AMOLED Black</option>
                            </select>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Communications</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                <label style={{display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-secondary)', cursor: 'pointer'}}>
                                    <input type="checkbox" checked={settings.emailAlerts} onChange={e => setSettings({...settings, emailAlerts: e.target.checked})} style={{width: '20px', height: '20px', accentColor: 'var(--color-accent)'}} />
                                    Daily Portfolio Summary
                                </label>
                                <label style={{display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-secondary)', cursor: 'pointer'}}>
                                    <input type="checkbox" checked={settings.riskWarnings} onChange={e => setSettings({...settings, riskWarnings: e.target.checked})} style={{width: '20px', height: '20px', accentColor: 'var(--color-risk-high)'}} />
                                    Critical Risk Tolerance Warnings
                                </label>
                            </div>
                        </div>
                    )}

                    {/* AI Configuration */}
                    {activeTab === 'ai' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Code color="var(--color-accent)" /> AI Provider Keys
                            </h2>
                            <p style={{ color: 'var(--color-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                InvestIQ heavily utilizes multi-agent consensus to generate Intelligence Reports. Bring your own keys (BYOK) below to bypass default rate-limits. Keys are stored locally in your browser.
                            </p>
                            
                            <label style={labelStyle}><Key size={14} color="#1A73E8"/> Gemini Platform Key</label>
                            <input style={inputStyle} value={settings.geminiKey} placeholder="AIzaSy..." onChange={e => setSettings({...settings, geminiKey: e.target.value})} type="password" />
                            
                            <label style={labelStyle}><Key size={14} color="#F55036"/> Groq LPU Inference Key</label>
                            <input style={inputStyle} value={settings.groqKey} placeholder="gsk_..." onChange={e => setSettings({...settings, groqKey: e.target.value})} type="password" />

                            <label style={labelStyle}><Key size={14} color="#FFFFFF"/> xAI (Grok) Key</label>
                            <input style={inputStyle} value={settings.xaiKey} placeholder="xai_..." onChange={e => setSettings({...settings, xaiKey: e.target.value})} type="password" />
                        </div>
                    )}

                    {/* Data Management */}
                    {activeTab === 'data' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Database color="var(--color-accent)" /> Security & Storage
                            </h2>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
                                    <h4 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Clear Historical Caches</h4>
                                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', marginBottom: '1rem'}}>
                                        Removes all previously generated Intelligence Reports and locally cached YFinance data metrics.
                                    </p>
                                    <button onClick={handleClearCache} style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                        Clear Local Cache
                                    </button>
                                </div>

                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
                                    <h4 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--color-risk-high)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertTriangle size={16}/> Danger Zone
                                    </h4>
                                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', marginBottom: '1rem'}}>
                                        Permanently delete all custom portoflio simulated stock data. This action is irreversible.
                                    </p>
                                    <button style={{ padding: '0.6rem 1rem', background: 'var(--color-risk-high)', border: 'none', color: '#FFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Trash2 size={16}/> Reset Portfolio Simulator
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    {activeTab !== 'data' && (
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: 'var(--color-accent)',
                                    color: 'var(--color-bg)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: isSaving ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'opacity 0.2s',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                <Save size={18}/> {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    )}
                    
                    {/* Toast Notification */}
                    {toastMessage && (
                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(74, 222, 128, 0.15)',
                            color: 'var(--color-risk-low)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            border: '1px solid var(--color-risk-low)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            {toastMessage}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
