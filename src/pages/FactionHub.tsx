import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useChatStore } from '@/stores/useChatStore';
import { CombatArena, createCombatSession } from '@/components/ui/CombatArena';
import { ChannelSidebar } from '@/components/messenger/ChannelSidebar';
import { ChatHeader } from '@/components/messenger/ChatHeader';
import { ChatBubble } from '@/components/messenger/ChatBubble';
import { MessengerInput } from '@/components/messenger/MessengerInput';
import type { ChannelMessage } from '@/types';
import '@/components/messenger/MessengerLayout.css';

export const FactionHub: React.FC = () => {
    const user = useGameStore(state => state.user);
    const {
        channels, activeChannelId, combatSessions, initializeChannels,
        setActiveChannel, addChannelMessage, addReaction, startCombat,
    } = useChatStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 769);
    const feedRef = useRef<HTMLDivElement>(null);

    // Responsive: auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 769) setSidebarCollapsed(true);
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

    if (!user) return null;

    const activeChannel = channels.find(ch => ch.id === activeChannelId);

    /* ── Send / Slash commands ── */
    const handleSend = (input: string) => {
        if (!input.trim() || !activeChannel) return;

        if (input.startsWith('/')) {
            handleSlashCommand(input);
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
    };

    const handleSlashCommand = (cmd: string) => {
        if (!activeChannel) return;
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        let systemContent = '';

        switch (command) {
            case '/challenge': {
                if (!args) { systemContent = '⚠️ Usage: /challenge [designation]'; break; }
                if (activeChannel.type !== 'combat') {
                    systemContent = '⚠️ Combat can only be initiated in the COMBAT ARENA channel.';
                    break;
                }
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
                systemContent = args ? `⚔️ ${user.designation} attacks: ${args}` : '⚠️ Usage: /attack [describe your action]';
                break;
            case '/defend':
                systemContent = args ? `🛡️ ${user.designation} defends: ${args}` : '⚠️ Usage: /defend [describe your defense]';
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

    const handleReaction = (messageId: string, emoji: string) => {
        if (activeChannel) {
            addReaction(activeChannel.id, messageId, emoji, user.id);
        }
    };

    /* ── Determine message grouping ── */
    const isGrouped = (msgs: ChannelMessage[], idx: number): boolean => {
        if (idx === 0) return false;
        const prev = msgs[idx - 1];
        const curr = msgs[idx];
        if (prev.userId !== curr.userId) return false;
        // Group if within 2 minutes
        const timeDiff = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
        return timeDiff < 120000;
    };

    return (
        <div className="messenger">
            {/* Channel Sidebar */}
            <ChannelSidebar
                channels={channels}
                activeChannelId={activeChannelId}
                userFaction={user.faction}
                onSelectChannel={setActiveChannel}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(c => !c)}
            />

            {/* Chat Area */}
            <div className="msger-chat">
                {activeChannel ? (
                    <>
                        {/* Header */}
                        <ChatHeader
                            channel={activeChannel}
                            sidebarCollapsed={sidebarCollapsed}
                            onToggleSidebar={() => setSidebarCollapsed(c => !c)}
                            channels={channels}
                            onSelectChannel={setActiveChannel}
                        />

                        {/* Message feed or Combat Arena */}
                        {activeChannel.type === 'combat' && combatSessions[activeChannel.id] ? (
                            <CombatArena channelId={activeChannel.id} />
                        ) : (
                            <div ref={feedRef} className="msger-chat__feed">
                                {activeChannel.messages.length === 0 ? (
                                    <div className="msger-chat__empty">
                                        No transmissions in this channel yet. Break the silence, Architect.
                                    </div>
                                ) : (
                                    activeChannel.messages.map((msg, idx) => (
                                        <ChatBubble
                                            key={msg.id}
                                            message={msg}
                                            isOwnMessage={msg.userId === user.id}
                                            isGrouped={isGrouped(activeChannel.messages, idx)}
                                            onReact={(emoji) => handleReaction(msg.id, emoji)}
                                            currentUserId={user.id}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Input */}
                        <MessengerInput
                            onSend={handleSend}
                            placeholder={activeChannel.type === 'combat' ? '/challenge OPPONENT' : `Transmit to ${activeChannel.name}...`}
                            isCombatChannel={activeChannel.type === 'combat'}
                            isLocked={activeChannel.isLocked}
                        />
                    </>
                ) : (
                    <div className="msger-chat__empty">
                        Select a channel to begin transmission.
                    </div>
                )}
            </div>
        </div>
    );
};
