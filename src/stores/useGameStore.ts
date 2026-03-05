import { create } from 'zustand';
import type { User, ChatMessage, Quest, StatChange } from '@/types';
import * as db from '@/services/supabaseDB';
import * as localDB from '@/services/localDB';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { ApiClient } from '@/services/client';
import { getFallbackResponse } from '@/services/fallbackContent';
import { getNextRank, getXPProgress } from '@/utils/xpCalculator';
import { RANKS } from '@/constants/ranks';
import { SoundManager } from '@/utils/soundManager';

export interface GameState {
    user: User | null;
    messages: ChatMessage[];
    quests: Quest[];
    isLoading: boolean;
    error: string | null;

    setUser: (user: User) => void;
    updateUser: (partial: Partial<User>) => void;
    addMessage: (message: ChatMessage) => void;
    setMessages: (messages: ChatMessage[]) => void;
    addQuest: (quest: Quest) => void;
    updateQuest: (id: string, update: Partial<Quest>) => void;
    setQuests: (quests: Quest[]) => void;
    applyStatChanges: (changes: StatChange[]) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
    testConnection: () => Promise<boolean>;
    initializeFromDB: () => Promise<void>;
    persistToDB: () => Promise<void>;
}

const api = new ApiClient();

export const useGameStore = create<GameState>((set, get) => ({
    user: null,
    messages: [],
    quests: [],
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),
    updateUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),

    addMessage: (message) => set((state) => {
        if (state.messages.some(m => m.id === message.id)) {
            return state;
        }
        const updated = [...state.messages, message];
        const trimmed = updated.length > 200 ? updated.slice(updated.length - 200) : updated;
        return { messages: trimmed };
    }),
    setMessages: (messages) => set({ messages: messages.slice(-200) }),

    addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),
    updateQuest: (id, update) => set((state) => ({
        quests: state.quests.map(q => q.id === id ? { ...q, ...update } : q)
    })),
    setQuests: (quests) => set({ quests }),

    applyStatChanges: (changes) => set((state) => {
        if (!state.user) return state;
        const user = { ...state.user, skills: { ...state.user.skills } };

        changes.forEach(change => {
            if (change.stat === 'XP') {
                user.xp += change.delta;
            } else if (change.stat === 'PRESTIGE') {
                user.prestige += change.delta;
            } else {
                user.skills[change.stat] = (user.skills[change.stat] || 0) + change.delta;
            }
        });

        // Check rank promotion based on XP
        const { required } = getXPProgress(user.xp, user.rank);
        if (required > 0 && user.xp >= required) {
            const nextRank = getNextRank(user.rank);
            if (nextRank) {
                // Find prestige requirement
                const nextRankData = RANKS.find(r => r.rank === nextRank);
                if (nextRankData && user.prestige >= nextRankData.prestigeRequired) {
                    user.rank = nextRank;
                    user.xp -= required;

                    SoundManager.playLevelUp();

                    setTimeout(() => {
                        get().addMessage({
                            id: Date.now().toString(),
                            source: 'SYSTEM',
                            content: `PROMOTION ACHIEVED: Rank updated to ${nextRank}. Clearance level increased.`,
                            timestamp: new Date().toISOString()
                        });
                    }, 500);
                }
            }
        }

        return { user };
    }),

    clearMessages: () => set({ messages: [] }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    sendMessage: async (content) => {
        const { addMessage, setLoading, user, messages } = get();

        if (!user) return;

        addMessage({
            id: Date.now().toString(),
            source: 'ARCHITECT',
            content,
            timestamp: new Date().toISOString()
        });

        setLoading(true);

        try {
            // Get last 10 messages for context
            const context = messages.slice(-10);

            // Call API (will automatically fallback to local content if no endpoint or offline)
            const response = await api.chat(content, context, user);

            if (response.success && response.data.narrative) {
                const aiMessage: ChatMessage = {
                    id: crypto.randomUUID?.() || Date.now().toString() + '_ai',
                    source: 'AI_DM',
                    content: response.data.narrative,
                    timestamp: new Date().toISOString(),
                    choices: response.data.choices || [],
                    statChanges: response.data.statChanges || [],
                    glitch: response.data.glitch || false
                };
                get().addMessage(aiMessage);

                // Apply stat changes if any
                if (response.data.statChanges && response.data.statChanges.length > 0) {
                    get().applyStatChanges(response.data.statChanges);
                }

                if (response.data.questUpdate && response.data.questUpdate.id) {
                    const exists = get().quests.find(q => q.id === response.data.questUpdate?.id);
                    if (exists) {
                        get().updateQuest(response.data.questUpdate.id, response.data.questUpdate);
                    } else if ((response.data.questUpdate as Quest).title) {
                        get().addQuest(response.data.questUpdate as Quest);
                    }
                }
            } else {
                // Serve fallback content instead of an error string
                const fallback = getFallbackResponse();
                const fallbackMessage: ChatMessage = {
                    id: crypto.randomUUID?.() || Date.now().toString() + '_fb',
                    source: 'AI_DM',
                    content: fallback.content,
                    timestamp: new Date().toISOString(),
                    choices: fallback.choices,
                    glitch: false
                };
                get().addMessage(fallbackMessage);
            }
        } catch (error) {
            console.error('[sendMessage] Error:', error);
            const fallback = getFallbackResponse('generic');
            const errorFallback: ChatMessage = {
                id: crypto.randomUUID?.() || Date.now().toString() + '_err',
                source: 'SYSTEM',
                content: fallback.content,
                timestamp: new Date().toISOString(),
                choices: fallback.choices,
                glitch: false
            };
            get().addMessage(errorFallback);
        } finally {
            set({ isLoading: false });
        }
    },

    initializeFromDB: async () => {
        // Try Supabase first if configured
        if (isSupabaseConfigured) {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const user = await db.getUser(authUser.id);
                    if (user) {
                        const [messages, quests, equipment, abilities] = await Promise.all([
                            db.getMessages(user.id),
                            db.getQuests(user.id),
                            db.getEquipment(user.id),
                            db.getAbilities(user.id),
                        ]);
                        set({
                            user: { ...user, equipment, abilities },
                            messages,
                            quests,
                        });
                        return;
                    }
                }
            } catch (e) {
                console.warn('[CONSTRUCT OS] Supabase init failed, falling back to local:', e);
            }
        }

        // Fallback to localDB
        const [user, messages, quests] = await Promise.all([
            localDB.getUser(),
            localDB.getMessages(),
            localDB.getQuests()
        ]);
        if (user) set({ user });
        if (messages.length > 0) set({ messages });
        if (quests.length > 0) set({ quests });
    },

    testConnection: async () => {
        if (!api.isAvailable()) {
            console.log('[CONSTRUCT OS] No endpoint configured. Skipping connection test.');
            return false;
        }

        try {
            const response = await api.getFactionStatus();
            if (response.success) {
                console.log('[CONSTRUCT OS] Grid link verified. AI model:', response.meta?.aiModel);
                return true;
            }
            return false;
        } catch {
            console.log('[CONSTRUCT OS] Grid link failed. Operating locally.');
            return false;
        }
    },

    persistToDB: async () => {
        const { user, messages, quests } = get();
        const promises: Promise<void>[] = [];
        if (user) promises.push(db.saveUser(user));
        if (messages.length > 0) promises.push(db.saveMessages(user?.id, messages));
        if (quests.length > 0) promises.push(db.saveQuests(user?.id, quests));
        await Promise.all(promises);
    }
}));

useGameStore.subscribe((state, prevState) => {
    if (state.user !== prevState.user || state.messages !== prevState.messages || state.quests !== prevState.quests) {
        state.persistToDB().catch(e => console.error('Auto-persist failed:', e));
    }
});
