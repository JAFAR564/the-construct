import { create } from 'zustand';
import type { ChatChannel, ChannelMessage, CombatSession, CombatAction, Reward, Faction } from '@/types';

interface ChatState {
    channels: ChatChannel[];
    activeChannelId: string | null;
    combatSessions: Record<string, CombatSession>;
    isLoadingChannel: boolean;

    // Channel actions
    setChannels: (channels: ChatChannel[]) => void;
    setActiveChannel: (channelId: string) => void;
    addChannelMessage: (channelId: string, message: ChannelMessage) => void;
    addReaction: (channelId: string, messageId: string, emoji: string, userId: string) => void;

    // Combat actions
    startCombat: (channelId: string, session: CombatSession) => void;
    submitCombatAction: (channelId: string, action: CombatAction) => void;
    setCombatJudgment: (channelId: string, round: number, judgment: string) => void;
    endCombat: (channelId: string, winnerId: string, rewards: Reward[]) => void;

    // Init
    initializeChannels: (userFaction: Faction) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    channels: [],
    activeChannelId: null,
    combatSessions: {},
    isLoadingChannel: false,

    initializeChannels: (userFaction) => {
        const defaultChannels: ChatChannel[] = [
            {
                id: 'global-general',
                name: '# GLOBAL COMMS',
                type: 'general',
                description: 'Open channel — all factions. Mind your allegiances.',
                faction: 'GLOBAL',
                messages: [],
                pinnedMessages: [],
                isLocked: false,
            },
            {
                id: `${userFaction.toLowerCase()}-general`,
                name: `# ${userFaction.replace(/_/g, ' ')} — GENERAL`,
                type: 'general',
                description: 'Faction-only communications.',
                faction: userFaction,
                messages: [],
                pinnedMessages: [],
                isLocked: false,
            },
            {
                id: `${userFaction.toLowerCase()}-roleplay`,
                name: `# ${userFaction.replace(/_/g, ' ')} — ROLEPLAY`,
                type: 'roleplay',
                description: 'In-character roleplay channel. Stay in persona.',
                faction: userFaction,
                messages: [],
                pinnedMessages: [],
                isLocked: false,
            },
            {
                id: 'global-combat',
                name: '# COMBAT ARENA',
                type: 'combat',
                description: 'Challenge other Architects. AI judges outcomes.',
                faction: 'GLOBAL',
                messages: [],
                pinnedMessages: [],
                isLocked: false,
            },
            {
                id: `${userFaction.toLowerCase()}-announcements`,
                name: `# ${userFaction.replace(/_/g, ' ')} — ORDERS`,
                type: 'announcements',
                description: 'Faction leadership announcements. Read-only for recruits.',
                faction: userFaction,
                messages: [],
                pinnedMessages: [],
                isLocked: true,
            },
        ];

        // Add initial NPC welcome messages to each channel
        const welcomeMessages: Record<string, string> = {
            'global-general': 'GRID BROADCAST: All frequencies open. Identify yourselves, Architects. Hostility will be met with system intervention.',
            'global-combat': 'ARENA PROTOCOL INITIALIZED. Challenge an opponent by issuing a combat request. AI adjudicator standing by. Rules: declare actions clearly. The Grid determines outcomes.',
        };

        const channelsWithWelcome = defaultChannels.map(ch => {
            const welcomeContent = welcomeMessages[ch.id];
            if (welcomeContent) {
                return {
                    ...ch,
                    messages: [{
                        id: crypto.randomUUID(),
                        channelId: ch.id,
                        userId: 'SYSTEM',
                        designation: 'CONSTRUCT OS',
                        faction: 'TECHNOCRATS' as const,
                        rank: 'SOVEREIGN' as const,
                        content: welcomeContent,
                        timestamp: new Date().toISOString(),
                        reactions: {},
                        isNPC: false,
                        isPinned: false,
                    }]
                };
            }
            return ch;
        });

        set({ channels: channelsWithWelcome, activeChannelId: 'global-general' });
    },

    setChannels: (channels) => set({ channels }),

    setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

    addChannelMessage: (channelId, message) => {
        set(state => ({
            channels: state.channels.map(ch =>
                ch.id === channelId
                    ? { ...ch, messages: [...ch.messages, message].slice(-200) }
                    : ch
            )
        }));
    },

    addReaction: (channelId, messageId, emoji, userId) => {
        set(state => ({
            channels: state.channels.map(ch => {
                if (ch.id !== channelId) return ch;
                return {
                    ...ch,
                    messages: ch.messages.map(msg => {
                        if (msg.id !== messageId) return msg;
                        const currentReactions = { ...msg.reactions };
                        if (!currentReactions[emoji]) currentReactions[emoji] = [];
                        if (currentReactions[emoji].includes(userId)) {
                            currentReactions[emoji] = currentReactions[emoji].filter(id => id !== userId);
                        } else {
                            currentReactions[emoji] = [...currentReactions[emoji], userId];
                        }
                        return { ...msg, reactions: currentReactions };
                    })
                };
            })
        }));
    },

    startCombat: (channelId, session) => {
        set(state => ({
            combatSessions: { ...state.combatSessions, [channelId]: session }
        }));
    },

    submitCombatAction: (channelId, action) => {
        set(state => {
            const session = state.combatSessions[channelId];
            if (!session) return state;

            const currentRound = session.rounds[session.currentRound - 1] || {
                roundNumber: session.currentRound,
                actions: []
            };

            const updatedRound = {
                ...currentRound,
                actions: [...currentRound.actions, action]
            };

            const updatedRounds = [...session.rounds];
            updatedRounds[session.currentRound - 1] = updatedRound;

            return {
                combatSessions: {
                    ...state.combatSessions,
                    [channelId]: { ...session, rounds: updatedRounds }
                }
            };
        });
    },

    setCombatJudgment: (channelId, round, judgment) => {
        set(state => {
            const session = state.combatSessions[channelId];
            if (!session) return state;

            const updatedRounds = [...session.rounds];
            if (updatedRounds[round - 1]) {
                updatedRounds[round - 1] = {
                    ...updatedRounds[round - 1],
                    aiJudgment: judgment
                };
            }

            return {
                combatSessions: {
                    ...state.combatSessions,
                    [channelId]: {
                        ...session,
                        rounds: updatedRounds,
                        currentRound: round + 1
                    }
                }
            };
        });
    },

    endCombat: (channelId, winnerId, rewards) => {
        set(state => {
            const session = state.combatSessions[channelId];
            if (!session) return state;

            return {
                combatSessions: {
                    ...state.combatSessions,
                    [channelId]: {
                        ...session,
                        status: 'COMPLETE',
                        winner: winnerId,
                        rewards,
                        completedAt: new Date().toISOString()
                    }
                }
            };
        });
    },
}));
