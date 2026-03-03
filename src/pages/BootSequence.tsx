import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import { useUIStore } from '@/stores/useUIStore';
import { SoundManager } from '@/utils/soundManager';
import { TypewriterText } from '@/components/ui/TypewriterText';

export const BootSequence: React.FC = () => {
    const navigate = useNavigate();
    const user = useGameStore(state => state.user);
    const { setBootComplete, bootSkipped, setBootSkipped } = useUIStore();

    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (bootSkipped) {
            finishBoot();
            return;
        }

        SoundManager.playBoot();

        if (!user) {
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
            setTimeout(() => finishBoot(), 11500);
        } else {
            setTimeout(() => setStep(1), 500);
            setTimeout(() => setStep(2), 1200);
            setTimeout(() => setStep(3), 1900);
            setTimeout(() => finishBoot(), 2600);
        }
    }, [user, bootSkipped]);

    const finishBoot = async () => {
        setBootComplete(true);
        // Fire-and-forget connection test — don't block navigation
        useGameStore.getState().testConnection().catch(() => { });
        navigate(user ? '/terminal' : '/login');
    };

    const skipBoot = () => {
        setBootSkipped(true);
        finishBoot();
    };

    return (
        <div
            onClick={user ? skipBoot : undefined}
            style={{ height: '100vh', width: '100vw', backgroundColor: 'black', color: 'var(--text-primary)', padding: 32, fontFamily: 'var(--font-mono)' }}
            className="crt-overlay flicker"
        >
            <div className="scanline" />
            {step >= 1 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="CONSTRUCT OS v3.0.1" speed={20} /></div>}
            {!user ? (
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
                    {step >= 2 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text={`ARCHITECT ${user.designation} RECOGNIZED.`} speed={20} /></div>}
                    {step >= 3 && <div style={{ display: 'block', marginBottom: 8 }}><TypewriterText text="RESUMING SESSION..." speed={20} /></div>}
                    <div style={{ position: 'absolute', bottom: 32, right: 32, color: 'var(--text-muted)' }}>(tap to skip)</div>
                </>
            )}
        </div>
    );
};
