import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import { useUIStore } from '@/stores/useUIStore';
import { isSupabaseConfigured } from '@/services/supabase';
import * as auth from '@/services/auth';
import * as db from '@/services/supabaseDB';
import { SoundManager } from '@/utils/soundManager';
import { TypewriterText } from '@/components/ui/TypewriterText';

export const BootSequence: React.FC = () => {
    const navigate = useNavigate();
    const user = useGameStore(state => state.user);
    const setUser = useGameStore(state => state.setUser);
    const { setBootComplete, bootSkipped, setBootSkipped } = useUIStore();

    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [checkedAuth, setCheckedAuth] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    // Pre-roll the sustainability line chance once per boot session (15%)
    const [showSustainLine] = useState(() => Math.random() < 0.15);

    // Check for existing auth session on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (isSupabaseConfigured) {
                try {
                    const authUser = await auth.getAuthUser();
                    if (authUser) {
                        const dbUser = await db.getUser(authUser.id);
                        if (dbUser) {
                            setUser(dbUser);
                            setHasSession(true);
                        }
                    }
                } catch {
                    // Supabase unavailable — continue with local flow
                }
            }
            setCheckedAuth(true);
        };
        checkAuth();
    }, [setUser]);

    // Run the boot animation after auth check completes
    useEffect(() => {
        if (!checkedAuth) return;

        const currentUser = hasSession ? useGameStore.getState().user : user;

        if (bootSkipped) {
            finishBoot(currentUser);
            return;
        }

        SoundManager.playBoot();

        if (!currentUser) {
            // New user — full boot sequence
            setTimeout(() => setStep(1), 500);
            setTimeout(() => setStep(2), 1500);
            setTimeout(() => setStep(3), 2500);
            setTimeout(() => setStep(4), 3500);
            setTimeout(() => setStep(5), 4500);
            setTimeout(() => setStep(6), 5500);
            setTimeout(() => {
                setStep(7);
                let p = 0;
                const interval = setInterval(() => {
                    p += 2.5;
                    setProgress(p);
                    if (p >= 100) clearInterval(interval);
                }, 100);
            }, 6500);
            setTimeout(() => setStep(8), 10500);
            setTimeout(() => finishBoot(null), 11500);
        } else {
            // Returning user — short boot
            setTimeout(() => setStep(1), 500);
            setTimeout(() => setStep(2), 1200);
            setTimeout(() => setStep(3), 1900);
            setTimeout(() => finishBoot(currentUser), 2600);
        }
    }, [checkedAuth, bootSkipped, hasSession]);

    const finishBoot = async (currentUser: ReturnType<typeof useGameStore.getState>['user']) => {
        setBootComplete(true);
        // Fire-and-forget connection test
        useGameStore.getState().testConnection().catch(() => { });
        navigate(currentUser ? '/terminal' : '/login');
    };

    const skipBoot = () => {
        setBootSkipped(true);
        const currentUser = hasSession ? useGameStore.getState().user : user;
        finishBoot(currentUser);
    };

    const displayUser = hasSession ? useGameStore.getState().user : user;

    return (
        <div
            onClick={displayUser ? skipBoot : undefined}
            style={{ height: '100vh', width: '100vw', backgroundColor: 'black', color: 'var(--text-primary)', padding: 32, fontFamily: 'var(--font-mono)', position: 'relative' }}
        >
            <div className="crt-overlay flicker" />
            <div className="scanline" />

            {step >= 1 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="CONSTRUCT OS v3.0.1" speed={20} /></div>}
            {!displayUser ? (
                <>
                    {step >= 2 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="INITIALIZING KERNEL..." speed={20} /></div>}
                    {step >= 3 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="LOADING MEMORY BANKS... [OK]" speed={20} /></div>}
                    {step >= 4 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="SCANNING NEURAL INTERFACE... [OK]" speed={20} /></div>}
                    {step >= 5 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="DETECTING ARCHITECT SIGNAL... [NEW SIGNAL DETECTED]" speed={20} /></div>}
                    {step >= 6 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="ESTABLISHING SECURE CHANNEL..." speed={20} /></div>}

                    {step >= 7 && (
                        <div style={{ marginTop: 32, width: '100%', maxWidth: 600 }}>
                            <div style={{ display: 'flex', border: '1px solid var(--text-primary)', height: 20 }}>
                                <div style={{ width: `${progress}%`, backgroundColor: 'var(--text-primary)', transition: 'width 0.1s linear' }} />
                            </div>
                        </div>
                    )}

                    {step >= 8 && <div style={{ display: 'block', marginTop: 16 }}><TypewriterText text="WELCOME, ARCHITECT. PREPARE FOR ORIENTATION." speed={30} /></div>}
                </>
            ) : (
                <>
                    {step >= 2 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text={`ARCHITECT ${displayUser.designation} RECOGNIZED.`} speed={20} /></div>}
                    {step >= 3 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="RESUMING SESSION..." speed={20} /></div>}
                    {step >= 3 && showSustainLine && (
                        <div style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>
                            <TypewriterText text="GRID SUSTAINABILITY: COMMUNITY-FUNDED ⚡" speed={20} />
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 32, right: 32, color: 'var(--text-muted)' }}>(tap to skip)</div>
                </>
            )}
        </div>
    );
};
