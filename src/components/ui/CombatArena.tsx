import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useGameStore } from '@/stores/useGameStore';
import { SoundManager } from '@/utils/soundManager';
import type { CombatSession, CombatAction, Faction, Reward } from '@/types';

// ── COMBAT ENVIRONMENTS ──

const ENVIRONMENTS = [
    { desc: 'Rain-soaked rooftop. Neon signs flicker. Footing is treacherous.', modifiers: ['-10% melee accuracy', 'Lightning attacks +15%'] },
    { desc: 'Abandoned server farm. Cables hang like vines. The hum of dying machines fills the air.', modifiers: ['+20% hacking attacks', 'Visibility low'] },
    { desc: 'Volcanic forge pit. Molten metal flows in channels. Heat distorts the air.', modifiers: ['+15% fire damage', '-10% ice effectiveness', 'Stamina drain per round'] },
    { desc: 'Frozen cathedral of the Veil. Ice pillars reflect starlight. Ancient runes glow faintly.', modifiers: ['+15% arcana', '-10% engineering', 'Slippery surfaces'] },
    { desc: 'Sector Zero junction. Reality glitches. Walls phase in and out.', modifiers: ['Random teleportation', 'All damage +10%', 'Unpredictable terrain'] },
    { desc: 'Ironborn scrapyard. Mountains of twisted metal. Rust and oil in the air.', modifiers: ['+15% engineering', 'Cover abundant', 'Tetanus risk'] },
];

// ── AI JUDGE FALLBACK RESPONSES ──

const JUDGE_TEMPLATES = [
    (p1: string, p2: string, a1: string, a2: string) =>
        `Both combatants demonstrate tactical awareness. ${p1}'s ${a1.slice(0, 40)}... earns partial contact: ${10 + Math.floor(Math.random() * 20)} damage. ${p2}'s counter with ${a2.slice(0, 30)}... connects: ${10 + Math.floor(Math.random() * 20)} damage. Environmental conditions affect both fighters. Advantage: ${Math.random() > 0.5 ? p1 : p2}.`,
    (p1: string, p2: string, a1: string, _a2: string) =>
        `A decisive exchange. ${p1} presses the attack with ferocity — ${a1.slice(0, 40)}... ${Math.random() > 0.5 ? 'finds its mark' : 'glances off armor'}: ${8 + Math.floor(Math.random() * 25)} damage. ${p2} holds ground and retaliates for ${8 + Math.floor(Math.random() * 25)} damage. The environment shifts. Neither combatant yields.`,
    (p1: string, p2: string, _a1: string, a2: string) =>
        `${p2} seizes the initiative with ${a2.slice(0, 40)}... — a bold maneuver dealing ${12 + Math.floor(Math.random() * 18)} damage. ${p1} absorbs the blow and adapts, responding for ${12 + Math.floor(Math.random() * 18)} damage. The Grid crackles with energy. This bout intensifies.`,
];

// ── NPC COMBAT RESPONSES ──

const NPC_COMBAT_ACTIONS = [
    '*lunges forward with a reinforced fist, aiming for the chest plate* "You talk too much, Architect."',
    '*drops low and sweeps at the legs, then springs upward with an elbow strike* "Predictable."',
    '*charges shoulder-first through the debris, using momentum as a weapon* "The forge made me for this!"',
    '*feints left then delivers a devastating right cross* "Iron does not flinch."',
    '*grabs a loose pipe from the ground and swings it overhead* "Everything is a weapon if you are strong enough."',
    '*ducks under the attack and counters with a rapid series of body blows* "Speed kills."',
    '*takes a defensive stance, waiting for the opening, then strikes like a coiled spring*',
    '*roars and brings both fists down in a hammer blow* "Feel the weight of the Collective!"',
];

const FACTION_COLORS: Record<string, string> = {
    TECHNOCRATS: '#00D4FF',
    KEEPERS_OF_THE_VEIL: '#00FF41',
    IRONBORN_COLLECTIVE: '#FF6600',
};

interface CombatArenaProps {
    channelId: string;
}

export const CombatArena: React.FC<CombatArenaProps> = ({ channelId }) => {
    const user = useGameStore(state => state.user);
    const updateUser = useGameStore(state => state.updateUser);
    const { combatSessions, submitCombatAction, setCombatJudgment, endCombat } = useChatStore();
    const [actionInput, setActionInput] = useState('');
    const [waitingForJudge, setWaitingForJudge] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);

    const session = combatSessions[channelId];

    // Auto-scroll combat log
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [session]);

    if (!user) return null;

    // ── NO ACTIVE SESSION: Show challenge prompt ──
    if (!session) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16,
            }}>
                <pre style={{ color: 'var(--faction-active)', fontSize: '0.6rem', lineHeight: 1.2 }}>{
                    `   ╔═══════════════════╗
   ║  ⚔️ COMBAT ARENA ⚔️ ║
   ╚═══════════════════╝`
                }</pre>
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '12px', maxWidth: 400 }}>
                    No active combat session. Type <span style={{ color: 'var(--faction-active)' }}>/challenge [NPC_NAME]</span> to initiate a duel.
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>
                    Available opponents: IRON_HAND, CIPHER_ZERO, VEIL_WALKER, EMBER_WITCH, NULL_BYTE
                </div>
            </div>
        );
    }

    // ── ACTIVE SESSION ──

    const opponentParticipant = session.participants.find(p => p.userId !== user.id);
    const currentRound = session.rounds[session.currentRound - 1];
    const playerActedThisRound = currentRound?.actions.some(a => a.userId === user.id) || false;
    const isComplete = session.status === 'COMPLETE';

    const hpBar = (current: number, max: number) => {
        const pct = max > 0 ? current / max : 0;
        const blocks = 16;
        const filled = Math.round(pct * blocks);
        const filledStr = '█'.repeat(filled);
        const emptyStr = '░'.repeat(blocks - filled);
        const color = pct > 0.5 ? 'var(--faction-active)' : pct > 0.25 ? 'var(--accent-warning)' : 'var(--accent-danger)';
        return (
            <span>
                <span style={{ color }}>{filledStr}</span>
                <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>{emptyStr}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>{current}/{max}</span>
            </span>
        );
    };

    const handleSubmitAction = () => {
        if (!actionInput.trim() || playerActedThisRound || isComplete || waitingForJudge) return;

        const playerAction: CombatAction = {
            userId: user.id,
            designation: user.designation,
            action: actionInput,
            timestamp: new Date().toISOString(),
            statUsed: 'COMBAT',
        };

        submitCombatAction(channelId, playerAction);
        setActionInput('');
        setWaitingForJudge(true);

        // NPC responds after 1.5-3s
        setTimeout(() => {
            if (!opponentParticipant) return;
            const npcAction: CombatAction = {
                userId: opponentParticipant.userId,
                designation: opponentParticipant.designation,
                action: NPC_COMBAT_ACTIONS[Math.floor(Math.random() * NPC_COMBAT_ACTIONS.length)],
                timestamp: new Date().toISOString(),
                statUsed: 'COMBAT',
            };
            submitCombatAction(channelId, npcAction);

            // AI Judge after another 2-4s
            setTimeout(() => {
                const template = JUDGE_TEMPLATES[Math.floor(Math.random() * JUDGE_TEMPLATES.length)];
                const judgment = template(
                    playerAction.designation, npcAction.designation,
                    playerAction.action, npcAction.action,
                );

    // Extract damage from judgment (rough parse)
    const damages = judgment.match(/(\d+) damage/g) || [];
    const p1Dmg = damages[0] ? parseInt(damages[0]) : 10;
    const p2Dmg = damages[1] ? parseInt(damages[1]) : 10;

    SoundManager.playCombatHit();

    setCombatJudgment(channelId, session.currentRound, judgment);

                // Update HP in session participants
                const updatedSession = useChatStore.getState().combatSessions[channelId];
                if (updatedSession) {
                    const updatedParticipants = updatedSession.participants.map(p => {
                        if (p.userId === user.id) {
                            return { ...p, hp: Math.max(0, p.hp - p2Dmg), energy: Math.max(0, p.energy - 10) };
                        } else {
                            return { ...p, hp: Math.max(0, p.hp - p1Dmg), energy: Math.max(0, p.energy - 10) };
                        }
                    });

                    // Check for combat end
                    const playerDead = updatedParticipants.find(p => p.userId === user.id)?.hp === 0;
                    const npcDead = updatedParticipants.find(p => p.userId !== user.id)?.hp === 0;
                    const maxRoundsHit = updatedSession.currentRound >= updatedSession.maxRounds;

                    if (playerDead || npcDead || maxRoundsHit) {
                        let winnerId = user.id;
                        if (playerDead) {
                            winnerId = opponentParticipant?.userId || '';
                        } else if (npcDead) {
                            winnerId = user.id;
                        } else {
                            // Judge by remaining HP
                            const pHp = updatedParticipants.find(p => p.userId === user.id)?.hp || 0;
                            const oHp = updatedParticipants.find(p => p.userId !== user.id)?.hp || 0;
                            winnerId = pHp >= oHp ? user.id : (opponentParticipant?.userId || '');
                        }

                        const rewards: Reward[] = winnerId === user.id
                            ? [{ type: 'XP', value: 50 }, { type: 'PRESTIGE', value: 10 }]
                            : [{ type: 'XP', value: 15 }];

                        endCombat(channelId, winnerId, rewards);

                        // Apply rewards to user
                        if (winnerId === user.id) {
                            updateUser({
                                xp: (user.xp || 0) + 50,
                                prestige: (user.prestige || 0) + 10,
                                totalXP: (user.totalXP || 0) + 50,
                            });
                        } else {
                            updateUser({
                                xp: (user.xp || 0) + 15,
                                totalXP: (user.totalXP || 0) + 15,
                            });
                        }
                    } else {
                        // Update participants in store
                        useChatStore.setState(state => ({
                            combatSessions: {
                                ...state.combatSessions,
                                [channelId]: { ...updatedSession, participants: updatedParticipants }
                            }
                        }));
                    }
                }

                setWaitingForJudge(false);
            }, 2000 + Math.random() * 2000);
        }, 1500 + Math.random() * 1500);
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Combat header */}
            <div style={{
                padding: '10px 16px', textAlign: 'center',
                borderBottom: '1px solid var(--border-terminal)', backgroundColor: 'var(--bg-dark)',
            }}>
                <div style={{ color: 'var(--faction-active)', fontWeight: 'bold', fontSize: '14px' }}>
                    ⚔️ COMBAT ARENA ⚔️
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: 2 }}>
                    Round {session.currentRound} of {session.maxRounds} | {session.status}
                </div>
            </div>

            {/* Scrollable combat body */}
            <div ref={logRef} className="message-feed" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                {/* Environment */}
                <div style={{
                    border: '1px dashed var(--border-terminal)', padding: 10, marginBottom: 12,
                    fontSize: '11px',
                }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>ENVIRONMENT:</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{session.environment}</div>
                    {session.environmentModifiers.length > 0 && (
                        <div style={{ color: 'var(--accent-warning)', fontSize: '10px', marginTop: 4 }}>
                            {session.environmentModifiers.map((m, i) => <span key={i} style={{ marginRight: 8 }}>• {m}</span>)}
                        </div>
                    )}
                </div>

                {/* Combatants */}
                <div style={{
                    borderBottom: '1px dashed var(--border-terminal)', paddingBottom: 12, marginBottom: 12,
                }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 8 }}>
                        ──── COMBATANTS ────
                    </div>
                    {session.participants.map(p => {
                        const isPlayer = p.userId === user.id;
                        const fColor = FACTION_COLORS[p.faction] || 'var(--text-primary)';
                        return (
                            <div key={p.userId} style={{ marginBottom: 10 }}>
                                <div style={{ color: fColor, fontWeight: 'bold', fontSize: '12px', marginBottom: 2 }}>
                                    {isPlayer ? 'YOU' : p.designation} ({p.faction.replace(/_/g, ' ')})
                                </div>
                                <div style={{ fontSize: '11px' }}>HP: {hpBar(p.hp, p.maxHp)}</div>
                                <div style={{ fontSize: '11px' }}>EN: {hpBar(p.energy, p.maxEnergy)}</div>
                                <div style={{ fontSize: '10px', color: p.status === 'active' ? 'var(--text-secondary)' : 'var(--accent-danger)' }}>
                                    Status: {p.status.toUpperCase()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Round logs */}
                {session.rounds.map((round, idx) => (
                    <div key={idx} style={{ marginBottom: 16 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6 }}>
                            ──── ROUND {round.roundNumber} LOG ────
                        </div>
                        {round.actions.map((action, aIdx) => {
                            const isPlayer = action.userId === user.id;
                            const aColor = FACTION_COLORS[session.participants.find(p => p.userId === action.userId)?.faction || ''] || 'var(--text-primary)';
                            return (
                                <div key={aIdx} style={{ marginBottom: 6, paddingLeft: 10, borderLeft: `2px solid ${aColor}` }}>
                                    <div style={{ color: aColor, fontSize: '11px', fontWeight: 'bold' }}>
                                        &gt; {isPlayer ? 'YOU' : action.designation}:
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontStyle: isPlayer ? 'normal' : 'italic' }}>
                                        {action.action}
                                    </div>
                                </div>
                            );
                        })}
                        {round.aiJudgment && (
                            <div style={{
                                marginTop: 8, padding: 8, backgroundColor: 'rgba(255,215,0,0.05)',
                                borderLeft: '2px solid #FFD700', fontSize: '11px',
                            }}>
                                <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: 2, fontSize: '10px' }}>
                                    AI JUDGE:
                                </div>
                                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {round.aiJudgment}
                                </div>
                            </div>
                        )}
                        {round.environmentEvent && (
                            <div style={{ color: 'var(--accent-warning)', fontSize: '10px', marginTop: 4, fontStyle: 'italic' }}>
                                ⚠ {round.environmentEvent}
                            </div>
                        )}
                    </div>
                ))}

                {/* Waiting indicator */}
                {waitingForJudge && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: 8, fontStyle: 'italic' }}>
                        ⏳ Opponent is responding... AI Judge is deliberating...
                    </div>
                )}

                {/* Combat complete */}
                {isComplete && (
                    <div style={{
                        border: '1px solid var(--faction-active)', padding: 16, textAlign: 'center', marginTop: 8,
                    }}>
                        <div style={{ color: 'var(--faction-active)', fontWeight: 'bold', fontSize: '16px', marginBottom: 8 }}>
                            ⚔️ COMBAT COMPLETE ⚔️
                        </div>
                        <div style={{ color: session.winner === user.id ? '#FFD700' : 'var(--accent-danger)', fontSize: '14px', marginBottom: 8 }}>
                            {session.winner === user.id ? '🏆 VICTORY! You are triumphant, Architect.' : '💀 DEFEAT. The Grid shows no mercy.'}
                        </div>
                        {session.rewards && session.rewards.length > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                Rewards: {session.rewards.map((r, i) => (
                                    <span key={i} style={{ color: 'var(--faction-active)', marginLeft: 4 }}>
                                        +{r.value} {r.type}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: 8 }}>
                            Use /challenge to start a new fight.
                        </div>
                    </div>
                )}
            </div>

            {/* Action input */}
            {!isComplete && (
                <div style={{
                    padding: '10px 16px', borderTop: '1px solid var(--border-terminal)',
                    backgroundColor: 'var(--bg-dark)',
                }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: 4 }}>
                        {playerActedThisRound || waitingForJudge
                            ? '⏳ Waiting for opponent and judge...'
                            : `▸ Describe your Round ${session.currentRound} action:`
                        }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', marginRight: 8 }}>&gt;</span>
                        <input
                            type="text"
                            value={actionInput}
                            onChange={e => setActionInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSubmitAction(); }}
                            disabled={playerActedThisRound || isComplete || waitingForJudge}
                            placeholder="I feint left, then strike at the exposed flank..."
                            style={{
                                flex: 1, backgroundColor: 'transparent', border: 'none',
                                color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                                fontSize: '13px', outline: 'none',
                                opacity: playerActedThisRound || waitingForJudge ? 0.4 : 1,
                            }}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <button
                            onClick={handleSubmitAction}
                            disabled={playerActedThisRound || isComplete || waitingForJudge}
                            style={{
                                background: 'none', border: '1px solid var(--faction-active)',
                                color: 'var(--faction-active)', cursor: 'pointer', padding: '4px 10px',
                                fontFamily: 'var(--font-mono)', fontSize: '11px',
                                opacity: playerActedThisRound || waitingForJudge ? 0.4 : 1,
                            }}
                        >
                            ACT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── EXPORTED HELPER: create a new combat session ──

export function createCombatSession(
    channelId: string,
    player: { userId: string; designation: string; faction: Faction },
    opponent: { userId: string; designation: string; faction: Faction },
): CombatSession {
    const env = ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)];
    return {
        id: crypto.randomUUID(),
        channelId,
        status: 'ACTIVE',
        participants: [
            { userId: player.userId, designation: player.designation, faction: player.faction, hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, status: 'active' },
            { userId: opponent.userId, designation: opponent.designation, faction: opponent.faction, hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, status: 'active' },
        ],
        rounds: [{ roundNumber: 1, actions: [] }],
        currentRound: 1,
        maxRounds: 5,
        environment: env.desc,
        environmentModifiers: env.modifiers,
        aiJudgeEnabled: true,
        startedAt: new Date().toISOString(),
    };
}
