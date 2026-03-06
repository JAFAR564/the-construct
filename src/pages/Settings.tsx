import React, { useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import * as localDB from '@/services/localDB';
import { isSupabaseConfigured } from '@/services/supabase';
import * as auth from '@/services/auth';

export const Settings: React.FC = () => {
    const { user, updateUser } = useGameStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const settings = user.settings || {
        soundEnabled: true,
        crtFlicker: true,
        scanlineIntensity: 50,
        textSpeed: 50,
        themeIntensity: 'balanced' as const
    };

    const handleToggle = (key: keyof typeof settings) => {
        updateUser({ settings: { ...settings, [key]: !settings[key] } });
    };

    const handleSlider = (key: keyof typeof settings, val: number) => {
        updateUser({ settings: { ...settings, [key]: val } });
    };

    const updateSetting = (key: keyof typeof settings, val: typeof settings[keyof typeof settings]) => {
        updateUser({ settings: { ...settings, [key]: val } });
    };

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
                } catch (err) {
                    alert('Failed to import save. Invalid format.');
                }
            }
        }
    };

    return (
        <TerminalCard title="SYSTEM CONFIGURATION PANEL">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span>Sound Effects</span>
                        <button
                            onClick={() => handleToggle('soundEnabled')}
                            style={{ background: 'none', border: 'none', color: settings.soundEnabled ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}
                        >
                            [{settings.soundEnabled ? 'ON' : 'OFF'}]
                        </button>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Toggle system audio synthesis.</div>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span>CRT Flicker</span>
                        <button
                            onClick={() => handleToggle('crtFlicker')}
                            style={{ background: 'none', border: 'none', color: settings.crtFlicker ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}
                        >
                            [{settings.crtFlicker ? 'ON' : 'OFF'}]
                        </button>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Toggle screen flicker animation.</div>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span>Scanline Intensity</span>
                        <span>{settings.scanlineIntensity}%</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="100"
                        value={settings.scanlineIntensity}
                        onChange={(e) => handleSlider('scanlineIntensity', parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--text-primary)' }}
                    />
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span>Text Speed</span>
                        <span>{settings.textSpeed}ms</span>
                    </div>
                    <input
                        type="range"
                        min="10" max="100" step="10"
                        value={settings.textSpeed}
                        onChange={(e) => handleSlider('textSpeed', parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--text-primary)' }}
                    />
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span>Theme Intensity</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['subtle', 'balanced', 'maximum'] as const).map(level => (
                            <button
                                key={level}
                                onClick={() => updateSetting('themeIntensity', level)}
                                style={{
                                    background: settings.themeIntensity === level
                                        ? 'var(--faction-active)'
                                        : 'transparent',
                                    color: settings.themeIntensity === level
                                        ? 'var(--bg-dark)'
                                        : 'var(--text-muted)',
                                    border: `1px solid ${settings.themeIntensity === level
                                        ? 'var(--faction-active)'
                                        : 'var(--border-terminal)'}`,
                                    padding: '6px 12px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                }}
                            >
                                [{level}]
                            </button>
                        ))}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>Adjusts scanline, vignette, and particle effect visibility.</div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-terminal)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button onClick={handleExport} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                        EXPORT SAVE DATA
                    </button>

                    <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--accent-info)', color: 'var(--accent-info)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                        IMPORT SAVE DATA
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleImport} />

                    <button onClick={handleClear} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                        CLEAR LOCAL DATA
                    </button>

                    {isSupabaseConfigured && (
                        <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--accent-warning, #FFA500)', color: 'var(--accent-warning, #FFA500)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                            SIGN OUT
                        </button>
                    )}
                </div>

                {/* Support Section */}
                <div style={{ borderTop: '1px dashed var(--border-terminal)', paddingTop: 24 }}>
                    <div style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-warning, #FFA500)',
                        letterSpacing: '0.1em',
                        marginBottom: 12,
                    }}>
                        ▸ SUPPORT THE GRID
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                            CONSTRUCT OS operates at zero cost. No ads. No paywalls.
                            No data harvesting. If The Grid has value to you, consider
                            fueling its expansion.
                        </p>
                        <a
                            href="https://ko-fi.com/litxarchitect"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                border: '1px solid var(--accent-warning, #FFA500)',
                                color: 'var(--accent-warning, #FFA500)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                textShadow: '0 0 5px var(--accent-warning, #FFA500)',
                            }}
                        >
                            [⚡] FUEL THE GRID — Ko-fi
                        </a>
                        <a
                            href="https://github.com/JAFAR564/the-construct"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                border: '1px solid var(--text-secondary)',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            [★] STAR ON GITHUB
                        </a>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>
                            100% voluntary. Zero gameplay impact. All funds sustain
                            infrastructure and development.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: 32, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    CONSTRUCT OS v{import.meta.env.VITE_APP_VERSION || '3.0.0'}<br />
                    By the Architect Cooperative
                </div>

            </div>
        </TerminalCard>
    );
};
