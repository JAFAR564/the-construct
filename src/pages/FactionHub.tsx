import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useChatStore } from '@/stores/useChatStore';
import { CombatArena, createCombatSession } from '@/components/ui/CombatArena';
import type { ChannelMessage, Faction, Rank } from '@/types';

// ── NPC PERSONAS ──

interface NPCPersona {
    designation: string;
    faction: Faction;
    rank: Rank;
    personality: string;
}

const NPC_PERSONAS: NPCPersona[] = [
    { designation: 'CIPHER_ZERO', faction: 'TECHNOCRATS', rank: 'WARDEN', personality: 'calculating, speaks in code metaphors' },
    { designation: 'VEIL_WALKER', faction: 'KEEPERS_OF_THE_VEIL', rank: 'SENTINEL', personality: 'mystical, references ancient lore' },
    { designation: 'IRON_HAND', faction: 'IRONBORN_COLLECTIVE', rank: 'COMMANDER', personality: 'blunt, aggressive, respects strength' },
    { designation: 'GHOST_SIGNAL', faction: 'TECHNOCRATS', rank: 'SPECIALIST', personality: 'paranoid, conspiracy theories about the Grid' },
    { designation: 'EMBER_WITCH', faction: 'KEEPERS_OF_THE_VEIL', rank: 'OPERATIVE', personality: 'playful, uses fire metaphors' },
    { designation: 'RUST_PROPHET', faction: 'IRONBORN_COLLECTIVE', rank: 'SENTINEL', personality: 'philosophical, fatalistic, quotes scripture' },
    { designation: 'NULL_BYTE', faction: 'TECHNOCRATS', rank: 'OPERATIVE', personality: 'sarcastic, hacker humor, trollish' },
    { designation: 'SHADOW_LOOM', faction: 'KEEPERS_OF_THE_VEIL', rank: 'WARDEN', personality: 'ominous, speaks in riddles' },
];

// Pre-written NPC responses keyed by personality trait
const NPC_RESPONSES: Record<string, string[]> = {
    CIPHER_ZERO: [
        'Every message is a packet. Every packet has a payload. What is yours?',
        'I traced the anomaly to Sector S-14. The data is... corrupted beyond recovery.',
        'The Grid remembers everything. Even the things you delete.',
        'Running diagnostics. Results inconclusive. As expected.',
        'You think in language. I think in binary. Neither of us sees the whole picture.',
    ],
    VEIL_WALKER: [
        'The ancient scripts speak of this moment. The convergence draws near.',
        'I walked between the veils last night. Something watched me from the other side.',
        'The runes do not lie. But they do not always tell the whole truth.',
        'In the old tongue, your name would mean "seeker." Fitting, perhaps.',
        'The Veil thins in Sector S-12. I can feel the old magic bleeding through.',
    ],
    IRON_HAND: [
        'Talk is cheap. Show me what your fists can do in the Arena.',
        'I crushed three opponents yesterday. My forge grows stronger.',
        'The Ironborn do not negotiate. We build. We conquer. We endure.',
        'Your faction speaks of subtlety. I speak of hammers. Guess which wins.',
        'Respect is earned in blood and iron, not words and whispers.',
    ],
    GHOST_SIGNAL: [
        'Has anyone else noticed the signal spikes in Sector S-07? Something is watching us.',
        'They say the Grid is just code. But code does not dream. The Grid dreams.',
        'I intercepted a transmission last cycle. It was in a language that does not exist yet.',
        'Trust no one. Especially the ones who tell you to trust them.',
        'My sensors are picking up ghost signals. Transmissions from nowhere to nowhere.',
    ],
    EMBER_WITCH: [
        'Careful, darling. Play with fire and you might get... well, you know. 🔥',
        'I lit a candle for the fallen last night. The flame turned green. Strange.',
        'The warmth of a good spell is better than any forge. No offense, Ironborn.',
        'They call me a witch like it is an insult. I call it a compliment.',
        'Anyone want to see a trick? I can make your doubts disappear. Along with your eyebrows.',
    ],
    RUST_PROPHET: [
        'All metal returns to rust. All code returns to entropy. Such is the way.',
        '"In the age of iron, the patient hand shapes the world." — Book of the Forge, verse 7.',
        'I have seen the end, and it is magnificent. Do not fear the unmaking.',
        'We build monuments to impermanence. There is beauty in that contradiction.',
        'The Grid will fall. Something better will rise. This is not despair. This is prophecy.',
    ],
    NULL_BYTE: [
        'lmao imagine not having root access in 2026',
        'I tried to hack S-00 once. Got rickrolled by the system admin. Respect.',
        'Anyone else just here for the memes? No? Just me? Cool cool cool.',
        'Hot take: the Keepers are just LARPers with admin privileges.',
        'I wrote a script that auto-generates conspiracy theories. Ghost Signal keeps quoting it.',
    ],
    SHADOW_LOOM: [
        'Three threads converge. One gold, one crimson, one void. Only one survives.',
        'I speak in riddles because the truth is too sharp for naked words.',
        'What walks on no legs but travels every sector? A rumor.',
        'The loom weaves. The pattern forms. You are a thread. Do not break.',
        'Darkness is not the absence of light. It is the presence of everything else.',
    ],
};

const CHANNEL_ICONS: Record<string, string> = {
    general: '💬',
    combat: '⚔️',
    roleplay: '🎭',
    announcements: '📢',
    whisper: '🔒',
};

const FACTION_COLORS: Record<string, string> = {
    TECHNOCRATS: '#00D4FF',
    KEEPERS_OF_THE_VEIL: '#00FF41',
    IRONBORN_COLLECTIVE: '#FF6600',
};

const REACTION_EMOJIS = ['⚡', '🔥', '🗡️', '💀', '👍'];

function relativeTime(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export const FactionHub: React.FC = () => {
    const user = useGameStore(state => state.user);
    const {
        channels, activeChannelId, combatSessions, initializeChannels,
        setActiveChannel, addChannelMessage, addReaction, startCombat,
    } = useChatStore();
    const [input, setInput] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 600);
    const feedRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const npcTimerRef = useRef<number | undefined>(undefined);

    // Responsive: auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 600) setSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize channels on mount
    useEffect(() => {
        if (user && channels.length === 0) {
            initializeChannels(user.faction);
        }
    }, [user, channels.length, initializeChannels]);

    // Auto-scroll message feed
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [activeChannelId, channels]);

    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, [activeChannelId]);

    if (!user) return null;

    const activeChannel = channels.find(ch => ch.id === activeChannelId);

    const generateNPCResponse = (channelId: string) => {
        // Pick a random NPC
        const npc = NPC_PERSONAS[Math.floor(Math.random() * NPC_PERSONAS.length)];
        const responses = NPC_RESPONSES[npc.designation] || [];
        const content = responses[Math.floor(Math.random() * responses.length)] || 'The Grid hums with static...';

        const npcMessage: ChannelMessage = {
            id: crypto.randomUUID(),
            channelId,
            userId: `npc_${npc.designation}`,
            designation: npc.designation,
            faction: npc.faction,
            rank: npc.rank,
            content,
            timestamp: new Date().toISOString(),
            reactions: {},
            isNPC: true,
            isPinned: false,
        };

        addChannelMessage(channelId, npcMessage);
    };

    const handleSend = () => {
        if (!input.trim() || !activeChannel) return;

        // Handle slash commands
        if (input.startsWith('/')) {
            handleSlashCommand(input);
            setInput('');
            return;
        }

        const message: ChannelMessage = {
            id: crypto.randomUUID(),
            channelId: activeChannel.id,
            userId: user.id,
            designation: user.designation,
            faction: user.faction,
            rank: user.rank,
            content: input,
            timestamp: new Date().toISOString(),
            reactions: {},
            isNPC: false,
            isPinned: false,
        };

        addChannelMessage(activeChannel.id, message);
        setInput('');

        // Trigger NPC response after random delay (2-8 seconds)
        if (npcTimerRef.current) clearTimeout(npcTimerRef.current);
        npcTimerRef.current = window.setTimeout(() => {
            generateNPCResponse(activeChannel.id);
        }, 2000 + Math.random() * 6000);
    };

    const handleSlashCommand = (cmd: string) => {
        if (!activeChannel) return;
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        let systemContent = '';

        switch (command) {
            case '/challenge': {
                if (!args) {
                    systemContent = '⚠️ Usage: /challenge [designation]';
                    break;
                }
                // Find the NPC
                const targetNPC = NPC_PERSONAS.find(n => n.designation.toLowerCase() === args.toLowerCase());
                if (!targetNPC) {
                    systemContent = `⚠️ Unknown opponent: ${args}. Available: ${NPC_PERSONAS.map(n => n.designation).join(', ')}`;
                    break;
                }
                // Only start combat in combat channels
                if (activeChannel.type !== 'combat') {
                    systemContent = '⚠️ Combat can only be initiated in the COMBAT ARENA channel.';
                    break;
                }
                // Create combat session
                const session = createCombatSession(
                    activeChannel.id,
                    { userId: user.id, designation: user.designation, faction: user.faction },
                    { userId: `npc_${targetNPC.designation}`, designation: targetNPC.designation, faction: targetNPC.faction },
                );
                startCombat(activeChannel.id, session);
                systemContent = `⚔️ COMBAT INITIATED! ${user.designation} vs ${targetNPC.designation}. Environment: ${session.environment}. Describe your first action!`;
                break;
            }
            case '/attack':
                systemContent = args
                    ? `⚔️ ${user.designation} attacks: ${args}`
                    : '⚠️ Usage: /attack [describe your action]';
                break;
            case '/defend':
                systemContent = args
                    ? `🛡️ ${user.designation} defends: ${args}`
                    : '⚠️ Usage: /defend [describe your defense]';
                break;
            case '/flee':
                systemContent = `💨 ${user.designation} attempts to flee from combat!`;
                break;
            case '/whisper':
                if (parts.length < 3) {
                    systemContent = '⚠️ Usage: /whisper [designation] [message]';
                } else {
                    systemContent = `🔒 Whisper to ${parts[1]}: ${parts.slice(2).join(' ')}`;
                }
                break;
            default:
                systemContent = `⚠️ Unknown command: ${command}. Available: /challenge, /attack, /defend, /flee, /whisper`;
        }

        const sysMsg: ChannelMessage = {
            id: crypto.randomUUID(),
            channelId: activeChannel.id,
            userId: 'SYSTEM',
            designation: 'CONSTRUCT OS',
            faction: 'TECHNOCRATS',
            rank: 'SOVEREIGN',
            content: systemContent,
            timestamp: new Date().toISOString(),
            reactions: {},
            isNPC: true,
            isPinned: false,
        };
        addChannelMessage(activeChannel.id, sysMsg);

        // NPC reaction to combat commands
        if (['/challenge', '/attack', '/defend'].includes(command) && args) {
            if (npcTimerRef.current) clearTimeout(npcTimerRef.current);
            npcTimerRef.current = window.setTimeout(() => {
                generateNPCResponse(activeChannel.id);
            }, 1500 + Math.random() * 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            handleSend();
        }
    };

    const handleReaction = (messageId: string, emoji: string) => {
        if (activeChannel) {
            addReaction(activeChannel.id, messageId, emoji, user.id);
        }
    };

    // Group channels by section
    const globalChannels = channels.filter(ch => ch.faction === 'GLOBAL');
    const factionChannels = channels.filter(ch => ch.faction === user.faction);

    // ── STYLES ──

    const sidebarStyle: React.CSSProperties = {
        width: sidebarCollapsed ? 40 : 200,
        minWidth: sidebarCollapsed ? 40 : 200,
        borderRight: '1px solid var(--border-terminal)',
        display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--bg-dark)',
        overflow: 'hidden', transition: 'width 0.2s, min-width 0.2s',
    };

    const channelBtnStyle = (isActive: boolean): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', cursor: 'pointer', fontSize: '11px',
        fontFamily: 'var(--font-mono)', border: 'none', textAlign: 'left', width: '100%',
        background: isActive ? 'var(--faction-active)' : 'transparent',
        color: isActive ? 'var(--bg-dark)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    });

    const sectionLabelStyle: React.CSSProperties = {
        fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px',
        padding: '10px 10px 4px', textTransform: 'uppercase', fontWeight: 'bold',
    };

    return (
        <div style={{
            display: 'flex', height: '100%', fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-terminal)',
            overflow: 'hidden',
        }}>
            {/* ── CHANNEL SIDEBAR ── */}
            <div style={sidebarStyle}>
                {/* Collapse toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: '8px', fontSize: '12px', textAlign: 'center',
                        borderBottom: '1px solid var(--border-terminal)',
                    }}
                >
                    {sidebarCollapsed ? '▸' : '◂ CHANNELS'}
                </button>

                {!sidebarCollapsed && (
                    <div style={{ flex: 1, overflowY: 'auto' }} className="message-feed">
                        {/* Global channels */}
                        <div style={sectionLabelStyle}>OPEN CHANNELS</div>
                        {globalChannels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => setActiveChannel(ch.id)}
                                style={channelBtnStyle(ch.id === activeChannelId)}
                            >
                                <span>{CHANNEL_ICONS[ch.type] || '#'}</span>
                                <span>{ch.name.replace('# ', '')}</span>
                            </button>
                        ))}

                        {/* Faction channels */}
                        <div style={{ borderTop: '1px dashed var(--border-terminal)', marginTop: 8 }} />
                        <div style={sectionLabelStyle}>{user.faction.replace(/_/g, ' ')}</div>
                        {factionChannels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => setActiveChannel(ch.id)}
                                style={channelBtnStyle(ch.id === activeChannelId)}
                            >
                                <span>{CHANNEL_ICONS[ch.type] || '#'}</span>
                                <span>{ch.name.replace(/# .+ — /, '')}</span>
                                {ch.isLocked && <span style={{ fontSize: '8px', opacity: 0.5 }}>🔒</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── MAIN CONTENT ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {activeChannel ? (
                    <>
                        {/* Channel header */}
                        <div style={{
                            padding: '10px 16px', borderBottom: '1px solid var(--border-terminal)',
                            backgroundColor: 'var(--bg-dark)',
                        }}>
                            {/* Mobile channel dropdown */}
                            {sidebarCollapsed && (
                                <select
                                    value={activeChannelId || ''}
                                    onChange={e => setActiveChannel(e.target.value)}
                                    style={{
                                        width: '100%', marginBottom: 6, padding: '4px 8px',
                                        backgroundColor: 'var(--bg-surface)', color: 'var(--faction-active)',
                                        border: '1px solid var(--border-terminal)',
                                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                                        outline: 'none', cursor: 'pointer',
                                    }}
                                >
                                    {channels.map(ch => (
                                        <option key={ch.id} value={ch.id}>
                                            {CHANNEL_ICONS[ch.type]} {ch.name.replace('# ', '')}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <div style={{ color: 'var(--faction-active)', fontWeight: 'bold', fontSize: '13px' }}>
                                {activeChannel.name}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: 2 }}>
                                {activeChannel.description}
                            </div>
                        </div>

                        {/* Message feed or Combat Arena */}
                        {activeChannel.type === 'combat' && combatSessions[activeChannel.id] ? (
                            <CombatArena channelId={activeChannel.id} />
                        ) : (
                            <div
                                ref={feedRef}
                                className="message-feed"
                                style={{
                                    flex: 1, overflowY: 'auto', padding: '12px 16px',
                                    display: 'flex', flexDirection: 'column', gap: 8,
                                }}
                            >
                                {activeChannel.messages.length === 0 && (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32, fontStyle: 'italic' }}>
                                        No transmissions in this channel yet. Break the silence, Architect.
                                    </div>
                                )}
                                {activeChannel.messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isOwnMessage={msg.userId === user.id}
                                        onReact={(emoji) => handleReaction(msg.id, emoji)}
                                        currentUserId={user.id}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Input area */}
                        {!activeChannel.isLocked && (
                            <div style={{
                                padding: '10px 16px', borderTop: '1px solid var(--border-terminal)',
                                backgroundColor: 'var(--bg-dark)',
                            }}>
                                {activeChannel.type === 'combat' && (
                                    <div style={{ fontSize: '10px', color: 'var(--accent-warning)', marginBottom: 6 }}>
                                        ⚔️ COMBAT ARENA — Use /challenge, /attack, /defend, /flee
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)', marginRight: 8 }}>&gt;</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={activeChannel.type === 'combat' ? '/challenge CIPHER_ZERO' : 'Transmit...'}
                                        style={{
                                            flex: 1, backgroundColor: 'transparent', border: 'none',
                                            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                                            fontSize: '13px', outline: 'none',
                                        }}
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    <button
                                        onClick={handleSend}
                                        style={{
                                            background: 'none', border: '1px solid var(--border-terminal)',
                                            color: 'var(--faction-active)', cursor: 'pointer', padding: '4px 10px',
                                            fontFamily: 'var(--font-mono)', fontSize: '11px',
                                        }}
                                    >
                                        SEND
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeChannel.isLocked && (
                            <div style={{
                                padding: '12px 16px', borderTop: '1px solid var(--border-terminal)',
                                backgroundColor: 'var(--bg-dark)', color: 'var(--text-muted)',
                                fontSize: '11px', textAlign: 'center',
                            }}>
                                🔒 This channel is read-only. Only faction leadership can post.
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', fontStyle: 'italic',
                    }}>
                        Select a channel to begin transmission.
                    </div>
                )}
            </div>
        </div>
    );
};

// ── MESSAGE BUBBLE COMPONENT ──

interface MessageBubbleProps {
    message: ChannelMessage;
    isOwnMessage: boolean;
    onReact: (emoji: string) => void;
    currentUserId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, onReact, currentUserId }) => {
    const [showReactions, setShowReactions] = useState(false);
    const factionColor = FACTION_COLORS[message.faction] || 'var(--text-primary)';
    const isSystem = message.userId === 'SYSTEM';

    if (isSystem) {
        return (
            <div style={{
                padding: '6px 10px', fontSize: '11px', color: 'var(--text-muted)',
                borderLeft: '2px solid var(--border-terminal)', fontStyle: 'italic',
                backgroundColor: 'rgba(255,255,255,0.02)',
            }}>
                {message.content}
            </div>
        );
    }

    return (
        <div
            style={{
                padding: '8px 10px', borderLeft: `2px solid ${factionColor}`,
                backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
        >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{ color: factionColor, fontWeight: 'bold', fontSize: '12px' }}>
                    [{message.designation}]
                </span>
                {message.isNPC && (
                    <span style={{
                        fontSize: '9px', color: 'var(--accent-warning)',
                        border: '1px solid var(--accent-warning)', padding: '0 4px',
                    }}>NPC</span>
                )}
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {message.rank}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {relativeTime(message.timestamp)}
                </span>
            </div>

            {/* Content */}
            <div style={{
                color: message.isNPC ? 'var(--text-secondary)' : 'var(--text-primary)',
                fontSize: '12px', lineHeight: 1.5,
                fontStyle: message.isNPC ? 'italic' : 'normal',
            }}>
                {message.content}
            </div>

            {/* Existing reactions */}
            {Object.keys(message.reactions).length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {Object.entries(message.reactions).map(([emoji, users]) => users.length > 0 && (
                        <button
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            style={{
                                background: users.includes(currentUserId) ? 'var(--bg-elevated)' : 'transparent',
                                border: `1px solid ${users.includes(currentUserId) ? 'var(--faction-active)' : 'var(--border-terminal)'}`,
                                color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer',
                                padding: '1px 6px', fontFamily: 'var(--font-mono)',
                            }}
                        >
                            {emoji} {users.length}
                        </button>
                    ))}
                </div>
            )}

            {/* Reaction picker on hover */}
            {showReactions && (
                <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {REACTION_EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            style={{
                                background: 'transparent', border: '1px solid var(--border-terminal)',
                                cursor: 'pointer', fontSize: '12px', padding: '1px 4px',
                                opacity: 0.6,
                            }}
                            title={`React with ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
