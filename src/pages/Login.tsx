import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import { TypewriterText } from "@/components/ui/TypewriterText";
import { FACTIONS } from '@/constants/factions';
import { STARTER_EQUIPMENT } from '@/constants/starterEquipment';
import { DEFAULT_ABILITIES } from '@/constants/abilities';
import { SoundManager } from '@/utils/soundManager';
import { isSupabaseConfigured } from '@/services/supabase';
import * as auth from '@/services/auth';
import * as db from '@/services/supabaseDB';
import type { Faction, ElementalAffinity, User } from '@/types';

// Helper to resolve a CSS variable reference like "var(--faction-technocrats)" to its computed hex value
function resolveCSSColor(colorValue: string): string {
    if (colorValue.startsWith('var(')) {
        const varName = colorValue.slice(4, -1).trim();
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || colorValue;
    }
    return colorValue;
}

type LoginStep = 'auth' | 'auth_loading' | 'designation' | 'designation_transition' | 'faction' | 'initializing';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const setUser = useGameStore(state => state.setUser);
    const setAuthId = useGameStore(state => state.setAuthId);

    // If Supabase isn't configured, skip auth step entirely
    const [step, setStep] = useState<LoginStep>(isSupabaseConfigured ? 'auth' : 'designation');
    const [mode, setMode] = useState<'signin' | 'signup'>('signup');

    // Auth fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authUserId, setAuthUserId] = useState<string | null>(null);

    // Registration fields
    const [designation, setDesignation] = useState('');
    const [faction, setFaction] = useState<Faction | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        if (!isSupabaseConfigured) return;

        auth.getAuthUser().then(async (authUser) => {
            if (authUser) {
                // Check if they already have a game profile
                const existingUser = await db.getUser(authUser.id);
                if (existingUser) {
                    // Returning user — load profile and go straight to terminal
                    setUser(existingUser);
                    setAuthId(authUser.id);
                    navigate('/terminal');
                } else {
                    // Authenticated but no game profile — need registration
                    setAuthUserId(authUser.id);
                    setStep('designation');
                }
            }
        });
    }, [navigate, setUser]);

    // ── AUTH HANDLERS ──

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setAuthError('');
        setStep('auth_loading');

        const result = mode === 'signup'
            ? await auth.signUp(email, password)
            : await auth.signIn(email, password);

        if (!result.success) {
            setAuthError(result.error || 'Authentication failed.');
            setStep('auth');
            return;
        }

        const authUser = result.user;
        if (!authUser) {
            setAuthError('SYSTEM ERROR: No user returned. Check email for confirmation.');
            setStep('auth');
            return;
        }

        if (mode === 'signin') {
            // Returning user — check for existing game profile
            const existingUser = await db.getUser(authUser.id);
            if (existingUser) {
                setUser(existingUser);
                setAuthId(authUser.id);
                navigate('/terminal');
                return;
            }
        }

        // New user or signin without profile — proceed to registration
        setAuthUserId(authUser.id);
        setStep('designation');
    };

    // ── REGISTRATION HANDLERS ──

    const handleDesignationSubmit = (val: string) => {
        const sanitized = val.trim().toUpperCase();
        if (sanitized.length >= 3 && sanitized.length <= 20 && /^[a-zA-Z0-9_]+$/.test(sanitized)) {
            setDesignation(sanitized);
            setStep('designation_transition');
            setTimeout(() => setStep('faction'), 2000);
        } else {
            alert("Invalid designation. 3-20 chars alphanumeric + underscores.");
        }
    };

    const handleFactionSelect = (f: typeof FACTIONS[0]) => {
        setFaction(f.id);
        const resolvedColor = resolveCSSColor(f.color);
        document.documentElement.style.setProperty('--text-primary', resolvedColor);
        document.documentElement.style.setProperty('--glow-primary', `0 0 5px ${resolvedColor}, 0 0 10px ${resolvedColor}, 0 0 20px ${resolvedColor}4D`);
        SoundManager.playFactionSelect();
    };

    const confirmFaction = (val: string) => {
        if (val.trim().toUpperCase() === 'Y' && faction) {
            setStep('initializing');
            setTimeout(initializeUser, 6000);
        } else {
            setFaction(null);
            document.documentElement.style.setProperty('--text-primary', '#00FF41');
            document.documentElement.style.setProperty('--glow-primary', '0 0 5px #00FF41, 0 0 10px #00FF41, 0 0 20px rgba(0, 255, 65, 0.3)');
        }
    };

    const initializeUser = async () => {
        const elements: ElementalAffinity[] = ['FIRE', 'ICE', 'LIGHTNING', 'VOID', 'NATURE', 'CHRONO'];
        const randomElt = elements[Math.floor(Math.random() * elements.length)];
        const randomSector = Math.floor(Math.random() * 50) + 1;

        const newUser: User = {
            id: crypto.randomUUID(),
            designation,
            faction: faction!,
            rank: 'INITIATE',
            prestige: 0,
            xp: 0,
            xpToNextRank: 500,
            currentSector: randomSector,
            skills: { 'HACKING': 10, 'COMBAT': 10, 'DIPLOMACY': 10, 'SURVIVAL': 10, 'ARCANA': 10, 'ENGINEERING': 10 },
            primaryElement: randomElt,
            secondaryElement: null,
            titles: [],
            joinedAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            settings: { soundEnabled: true, scanlineIntensity: 70, crtFlicker: true, textSpeed: 30, themeIntensity: 'balanced' as const },
            equipment: STARTER_EQUIPMENT,
            equippedItems: {
                WEAPON: 'starter_weapon',
                ARMOR: 'starter_armor',
                ACCESSORY: 'starter_accessory',
                COMPANION: 'starter_companion',
                IMPLANT: 'starter_implant',
            },
            abilities: DEFAULT_ABILITIES,
            characterProfile: {
                backstory: '',
                alignment: 'TRUE_NEUTRAL',
                strengths: [],
                weaknesses: [],
                allies: [],
                enemies: [],
                personalMotto: '',
                themeSong: '',
                memoryLog: [{
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    event: 'Awakened as an Architect in The Grid.',
                    type: 'achievement',
                }],
                privacyLevel: 'public',
            },
            level: 1,
            xpToNextLevel: 100,
            totalXP: 0,
        };

        // Save to Supabase if authenticated
        if (authUserId && isSupabaseConfigured) {
            await db.saveUser(newUser, authUserId);
            setAuthId(authUserId);
        }

        setUser(newUser);
        navigate('/terminal');
    };

    // ── SHARED STYLES ──

    const inputStyle: React.CSSProperties = {
        backgroundColor: 'transparent',
        border: '1px solid var(--text-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        padding: '8px 12px',
        width: '100%',
        maxWidth: 400,
        outline: 'none',
    };

    const buttonStyle: React.CSSProperties = {
        backgroundColor: 'transparent',
        border: '1px solid var(--text-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        padding: '8px 20px',
        cursor: 'pointer',
        letterSpacing: '1px',
    };

    const mutedLinkStyle: React.CSSProperties = {
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        textDecoration: 'underline',
        padding: 0,
        marginTop: 12,
    };

    // ── RENDER ──

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'black', padding: 32, overflowY: 'auto', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="crt-overlay flicker" />
            <div className="scanline" />

            <div style={{ width: '100%', maxWidth: 480 }}>

                {/* ── AUTH STEP ── */}
                {step === 'auth' && (
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
                        <TypewriterText
                            text={mode === 'signup'
                                ? 'CONSTRUCT OS — NEW ARCHITECT ENROLLMENT'
                                : 'CONSTRUCT OS — ARCHITECT AUTHENTICATION'}
                            speed={20}
                        />

                        <form onSubmit={handleAuthSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>GRID_ID (EMAIL)</div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="architect@thegrid.net"
                                    style={inputStyle}
                                    autoFocus
                                    autoComplete="email"
                                />
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>ACCESS_KEY (PASSWORD)</div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={inputStyle}
                                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                />
                            </div>

                            {authError && (
                                <div style={{ color: '#FF4444', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                                    ⚠ ERROR: {authError}
                                </div>
                            )}

                            <button type="submit" style={buttonStyle}>
                                {mode === 'signup' ? '[ ENROLL ]' : '[ AUTHENTICATE ]'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}
                                style={mutedLinkStyle}
                            >
                                {mode === 'signup'
                                    ? '> Already registered? Authenticate here.'
                                    : '> New Architect? Enroll here.'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'auth_loading' && (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TypewriterText text="VERIFYING CREDENTIALS AGAINST GRID DATABASE..." speed={20} />
                    </div>
                )}

                {/* ── DESIGNATION STEP ── */}
                {step === 'designation' && (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TypewriterText text="ARCHITECT REGISTRATION REQUIRED." speed={20} />
                        <div style={{ marginTop: 16 }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 4 }}>ENTER DESIGNATION (3-20 chars, alphanumeric + underscore):</div>
                            <input
                                type="text"
                                onKeyDown={e => { if (e.key === 'Enter') handleDesignationSubmit((e.target as HTMLInputElement).value); }}
                                style={inputStyle}
                                autoFocus
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}

                {step === 'designation_transition' && (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TypewriterText text={`DESIGNATION [${designation}] REGISTERED. PROCEED TO ALIGNMENT SCAN.`} speed={20} />
                    </div>
                )}

                {/* ── FACTION STEP ── */}
                {step === 'faction' && (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TypewriterText text="THREE FACTIONS SEEK YOUR ALLEGIANCE. CHOOSE YOUR ALIGNMENT:" speed={150} mode="word" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24, maxWidth: 600 }}>
                            {FACTIONS.map((f, i) => (
                                <div
                                    key={f.id}
                                    onClick={() => handleFactionSelect(f)}
                                    style={{
                                        border: `1px solid ${f.color}`,
                                        padding: 16,
                                        cursor: 'pointer',
                                        backgroundColor: faction === f.id ? `${f.color}33` : 'transparent'
                                    }}
                                >
                                    <div style={{ color: f.color, fontSize: '1.2rem', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                                        [{i + 1}] {f.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>{f.description}</div>
                                    <div style={{ fontStyle: 'italic', margin: '8px 0' }}>{f.motto}</div>
                                    <div style={{ fontSize: '0.9rem' }}>SKILL FOCUS: {f.skills.join(', ')}</div>
                                </div>
                            ))}
                        </div>

                        {faction && (
                            <div style={{ marginTop: 24 }}>
                                <TypewriterText text={`ALIGNMENT: ${faction}. CONFIRM? [Y/N]`} speed={20} />
                                <input
                                    type="text"
                                    onKeyDown={e => { if (e.key === 'Enter') confirmFaction((e.target as HTMLInputElement).value); }}
                                    style={{ ...inputStyle, marginTop: 8 }}
                                    autoFocus
                                    autoComplete="off"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── INITIALIZING STEP ── */}
                {step === 'initializing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
                        <TypewriterText text="CALIBRATING NEURAL LINK..." speed={20} onComplete={() => { }} />
                        <TypewriterText text={`ASSIGNING SECTOR: S-${Math.floor(Math.random() * 50) + 1}`} speed={20} />
                        <TypewriterText text="RANK: INITIATE" speed={20} />
                        <TypewriterText text="CLEARANCE: LEVEL 1" speed={20} />
                        <TypewriterText text="INITIALIZATION COMPLETE." speed={20} />
                        <TypewriterText text="REDIRECTING TO MAIN TERMINAL..." speed={20} />
                    </div>
                )}
            </div>
        </div>
    );
};
