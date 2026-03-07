import React, { useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import * as localDB from '@/services/localDB';
import { isSupabaseConfigured } from '@/services/supabase';
import * as auth from '@/services/auth';
import '@/styles/PremiumPage.css';

export const Settings: React.FC = () => {
    const { user, updateUser } = useGameStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const settings = user.settings || {
        soundEnabled: true, crtFlicker: true, scanlineIntensity: 50, textSpeed: 50, themeIntensity: 'balanced' as const,
    };

    const handleToggle = (key: keyof typeof settings) => updateUser({ settings: { ...settings, [key]: !settings[key] } });
    const handleSlider = (key: keyof typeof settings, val: number) => updateUser({ settings: { ...settings, [key]: val } });
    const updateSetting = (key: keyof typeof settings, val: typeof settings[keyof typeof settings]) => updateUser({ settings: { ...settings, [key]: val } });

    const handleClear = async () => {
        if (window.confirm('WARNING: ALL PROGRESS WILL BE LOST. CONFIRM? [Y/N]')) {
            await auth.signOut();
            await localDB.clearAll();
            window.location.href = '/';
        }
    };

    const handleSignOut = async () => {
        await auth.signOut();
        await localDB.clearAll();
        window.location.href = '/';
    };

    const handleExport = async () => {
        const data = await localDB.exportSave();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `construct_save_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (window.confirm('WARNING: IMPORTING WILL OVERWRITE CURRENT DATA. CONTINUE? [Y/N]')) {
                const text = await file.text();
                try {
                    await localDB.importSave(text);
                    window.location.reload();
                } catch {
                    alert('Failed to import save. Invalid format.');
                }
            }
        }
    };

    return (
        <div className="ppage">
            <div className="ppage__title">SYSTEM CONFIGURATION</div>
            <div className="ppage__title-divider" />

            <div className="ppage__flex-col ppage__gap-lg">

                {/* Sound */}
                <div className="ppage__setting">
                    <div className="ppage__flex-between">
                        <span className="ppage__setting-label">Sound Effects</span>
                        <button className={`ppage__toggle ${settings.soundEnabled ? 'ppage__toggle--on' : 'ppage__toggle--off'}`} onClick={() => handleToggle('soundEnabled')}>
                            [{settings.soundEnabled ? 'ON' : 'OFF'}]
                        </button>
                    </div>
                    <div className="ppage__setting-desc">Toggle system audio synthesis.</div>
                </div>

                {/* CRT */}
                <div className="ppage__setting">
                    <div className="ppage__flex-between">
                        <span className="ppage__setting-label">CRT Flicker</span>
                        <button className={`ppage__toggle ${settings.crtFlicker ? 'ppage__toggle--on' : 'ppage__toggle--off'}`} onClick={() => handleToggle('crtFlicker')}>
                            [{settings.crtFlicker ? 'ON' : 'OFF'}]
                        </button>
                    </div>
                    <div className="ppage__setting-desc">Toggle screen flicker animation.</div>
                </div>

                {/* Scanline */}
                <div className="ppage__setting">
                    <div className="ppage__flex-between">
                        <span className="ppage__setting-label">Scanline Intensity</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>{settings.scanlineIntensity}%</span>
                    </div>
                    <input type="range" className="ppage__slider" min="0" max="100" value={settings.scanlineIntensity}
                        onChange={e => handleSlider('scanlineIntensity', parseInt(e.target.value))} />
                </div>

                {/* Text Speed */}
                <div className="ppage__setting">
                    <div className="ppage__flex-between">
                        <span className="ppage__setting-label">Text Speed</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>{settings.textSpeed}ms</span>
                    </div>
                    <input type="range" className="ppage__slider" min="10" max="100" step="10" value={settings.textSpeed}
                        onChange={e => handleSlider('textSpeed', parseInt(e.target.value))} />
                </div>

                {/* Theme Intensity */}
                <div className="ppage__setting">
                    <div className="ppage__flex-between" style={{ marginBottom: 10 }}>
                        <span className="ppage__setting-label">Theme Intensity</span>
                    </div>
                    <div className="ppage__flex-row">
                        {(['subtle', 'balanced', 'maximum'] as const).map(level => (
                            <button key={level} onClick={() => updateSetting('themeIntensity', level)}
                                className={`ppage__tab ${settings.themeIntensity === level ? 'ppage__tab--active' : ''}`}>
                                [{level}]
                            </button>
                        ))}
                    </div>
                    <div className="ppage__setting-desc" style={{ marginTop: 8 }}>Adjusts scanline, vignette, and particle effect visibility.</div>
                </div>

                {/* Data Management */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
                    <h3 className="ppage__section">DATA MANAGEMENT</h3>
                    <div className="ppage__flex-col">
                        <button className="ppage__btn" onClick={handleExport}>EXPORT SAVE DATA</button>
                        <button className="ppage__btn ppage__btn--info" onClick={() => fileInputRef.current?.click()}>IMPORT SAVE DATA</button>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleImport} />
                        <button className="ppage__btn ppage__btn--danger" onClick={handleClear}>CLEAR LOCAL DATA</button>
                        {isSupabaseConfigured && (
                            <button className="ppage__btn ppage__btn--warning" onClick={handleSignOut}>SIGN OUT</button>
                        )}
                    </div>
                </div>

                {/* Support Section */}
                <div className="ppage__support">
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-warning, #FFA500)', letterSpacing: '0.1em', marginBottom: 14 }}>
                        ▸ SUPPORT THE GRID
                    </div>
                    <div className="ppage__flex-col">
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                            CONSTRUCT OS operates at zero cost. No ads. No paywalls.
                            No data harvesting. If The Grid has value to you, consider
                            fueling its expansion.
                        </p>
                        <a href="https://ko-fi.com/litxarchitect" target="_blank" rel="noopener noreferrer"
                            className="ppage__btn ppage__btn--warning" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            [⚡] FUEL THE GRID — Ko-fi
                        </a>
                        <a href="https://github.com/JAFAR564/the-construct" target="_blank" rel="noopener noreferrer"
                            className="ppage__btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            [★] STAR ON GITHUB
                        </a>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, fontFamily: 'var(--font-mono)' }}>
                            100% voluntary. Zero gameplay impact. All funds sustain infrastructure and development.
                        </p>
                    </div>
                </div>

                {/* Version */}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
                    CONSTRUCT OS v{import.meta.env.VITE_APP_VERSION || '3.0.0'}<br />
                    By the Architect Cooperative
                </div>
            </div>
        </div>
    );
};
