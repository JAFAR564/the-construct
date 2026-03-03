import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import { TypewriterText } from "@/components/ui/TypewriterText";
import { CommandInput } from "@/components/ui/CommandInput";
import { FACTIONS } from '@/constants/factions';
import { STARTER_EQUIPMENT } from '@/constants/starterEquipment';
import { DEFAULT_ABILITIES } from '@/constants/abilities';
import { SoundManager } from '@/utils/soundManager';
import type { Faction, ElementalAffinity, User } from '@/types';

// Let's create proper styling for the layout elements

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const setUser = useGameStore(state => state.setUser);

    const [step, setStep] = useState(1);
    const [designation, setDesignation] = useState('');
    const [faction, setFaction] = useState<Faction | null>(null);

    const handleDesignationSubmit = (val: string) => {
        const sanitized = val.trim().toUpperCase();
        if (sanitized.length >= 3 && sanitized.length <= 20 && /^[a-zA-Z0-9_]+$/.test(sanitized)) {
            setDesignation(sanitized);
            setStep(1.5); // transition
            setTimeout(() => setStep(2), 2000);
        } else {
            alert("Invalid designation. 3-20 chars alphanumeric + underscores.");
        }
    };

  const handleFactionSelect = (f: typeof FACTIONS[0]) => {
    setFaction(f.id);
    document.documentElement.style.setProperty('--text-primary', f.color);
    document.documentElement.style.setProperty('--glow-primary', `0 0 5px ${f.color}, 0 0 10px ${f.color}, 0 0 20px ${f.color}4D`);
    SoundManager.playFactionSelect();
  };

    const confirmFaction = (val: string) => {
        if (val.trim().toUpperCase() === 'Y' && faction) {
            setStep(3);
            setTimeout(initializeUser, 6000);
        } else {
            setFaction(null); // reject
            document.documentElement.style.setProperty('--text-primary', '#00FF41');
            document.documentElement.style.setProperty('--glow-primary', '0 0 5px #00FF41, 0 0 10px #00FF41, 0 0 20px rgba(0, 255, 65, 0.3)');
        }
    };

    const initializeUser = () => {
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

        setUser(newUser);
        navigate('/terminal');
    };

    return (
        <div className="crt-overlay flicker" style={{ height: '100vh', backgroundColor: 'black', padding: 32, overflowY: 'auto' }}>
            <div className="scanline" />

            {step === 1 && (
                <div>
                    <TypewriterText text="ARCHITECT REGISTRATION REQUIRED." speed={20} />
                    <div style={{ marginTop: 16 }}>
                        <CommandInput onSubmit={handleDesignationSubmit} />
                    </div>
                </div>
            )}

            {step === 1.5 && (
                <TypewriterText text={`DESIGNATION [${designation}] REGISTERED. PROCEED TO ALIGNMENT SCAN.`} speed={20} />
            )}

            {step === 2 && (
                <div>
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
                            <CommandInput onSubmit={confirmFaction} />
                        </div>
                    )}
                </div>
            )}

            {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* using multiple step values or just sequential setTimeout */}
                    <TypewriterText text="CALIBRATING NEURAL LINK..." speed={20} onComplete={() => { }} />
                    <TypewriterText text={`ASSIGNING SECTOR: S-${Math.floor(Math.random() * 50) + 1}`} speed={20} />
                    <TypewriterText text="RANK: INITIATE" speed={20} />
                    <TypewriterText text="CLEARANCE: LEVEL 1" speed={20} />
                    <TypewriterText text="INITIALIZATION COMPLETE." speed={20} />
                    <TypewriterText text="REDIRECTING TO MAIN TERMINAL..." speed={20} />
                </div>
            )}
        </div>
    );
};
