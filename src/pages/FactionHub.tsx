import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useChatStore } from '@/stores/useChatStore';
import { CombatArena, createCombatSession } from '@/components/ui/CombatArena';
import type { ChannelMessage } from '@/types';

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
                // Only start combat in combat channels
                if (activeChannel.type !== 'combat') {
                    systemContent = '⚠️ Combat can only be initiated in the COMBAT ARENA channel.';
                    break;
                }
                // Create combat session against target designation
                const session = createCombatSession(
                    activeChannel.id,
                    { userId: user.id, designation: user.designation, faction: user.faction },
                    { userId: `opponent_${args.toUpperCase()}`, designation: args.toUpperCase(), faction: user.faction },
                );
                startCombat(activeChannel.id, session);
                systemContent = `⚔️ COMBAT INITIATED! ${user.designation} vs ${args.toUpperCase()}. Environment: ${session.environment}. Describe your first action!`;
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
            isNPC: false,
            isPinned: false,
        };
        addChannelMessage(activeChannel.id, sysMsg);
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
                                        placeholder={activeChannel.type === 'combat' ? '/challenge OPPONENT' : 'Transmit...'}
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
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {message.rank}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {relativeTime(message.timestamp)}
                </span>
            </div>

            {/* Content */}
            <div style={{
                color: 'var(--text-primary)',
                fontSize: '12px', lineHeight: 1.5,
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
