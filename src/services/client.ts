import type { User, ChatMessage, Choice, StatChange, Quest, LeaderboardEntry, FactionStatus, Faction } from '@/types';
import { getFallbackResponse } from '@/services/fallbackContent';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

interface APIRequest {
    action: 'CHAT' | 'SYNC_USER' | 'GET_LEADERBOARD' | 'GET_FACTION_STATUS' | 'GET_DAILY_QUESTS';
    userId: string;
    payload: Record<string, any>;
}

export interface APIResponse {
    success: boolean;
    error?: string;
    data: {
        narrative?: string;
        choices?: Choice[];
        statChanges?: StatChange[];
        questUpdate?: Partial<Quest>;
        glitch?: boolean;
        entries?: LeaderboardEntry[];
        factions?: FactionStatus[];
        quests?: Quest[];
    };
    meta: {
        aiModel: 'gemini' | 'groq' | 'fallback';
        latencyMs: number;
        rateLimitRemaining: number;
    };
}


export class ApiClient {
    private endpoint: string;
    private isConfigured: boolean;

    constructor() {
        this.endpoint = import.meta.env.VITE_API_ENDPOINT || '';
        this.isConfigured = this.endpoint.length > 0 && this.endpoint !== 'undefined';

        if (isSupabaseConfigured) {
            console.log('[CONSTRUCT OS] Supabase edge function link established.');
        } else if (this.isConfigured) {
            console.log('[CONSTRUCT OS] GAS grid link established:', this.endpoint.slice(0, 50) + '...');
        } else {
            console.log('[CONSTRUCT OS] Grid link unavailable. Operating in offline mode.');
        }
    }

    isAvailable(): boolean {
        return this.isConfigured;
    }

    private async request(body: APIRequest): Promise<APIResponse> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s for GAS cold starts

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',  // GAS requires text/plain to avoid CORS preflight
                },
                body: JSON.stringify(body),
                signal: controller.signal,
                redirect: 'follow',              // Follow GAS redirects
            });
            clearTimeout(timeout);

            if (!response.ok) {
                console.error(`[ApiClient] HTTP ${response.status}`);
                return this.getOfflineResponse();
            }

            const text = await response.text();

            try {
                return JSON.parse(text);
            } catch {
                console.error('[ApiClient] Invalid JSON response:', text.slice(0, 200));
                return this.getOfflineResponse();
            }
        } catch (error) {
            clearTimeout(timeout);
            console.error('[ApiClient] Request failed:', error);
            return this.getOfflineResponse();
        }
    }

    private getOfflineResponse(): APIResponse {
        const fallback = getFallbackResponse();
        return {
            success: true,
            data: {
                narrative: fallback.content,
                choices: fallback.choices,
                statChanges: [],
                glitch: false
            },
            meta: {
                aiModel: 'fallback',
                latencyMs: 0,
                rateLimitRemaining: 999
            }
        };
    }

    async chat(message: string, context: ChatMessage[], userStats: Partial<User>): Promise<APIResponse> {
        // Priority: Supabase Edge Function > GAS endpoint > offline
        if (isSupabaseConfigured) {
            return this.chatViaEdgeFunction(message, context, userStats);
        }
        if (!this.isConfigured) {
            return this.getOfflineResponse();
        }
        return this.request({
            action: 'CHAT',
            userId: userStats.id || '',
            payload: { message, context, userStats }
        });
    }

    private async chatViaEdgeFunction(message: string, context: ChatMessage[], userStats: Partial<User>): Promise<APIResponse> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.warn('[ApiClient] No auth session for edge function call');
                return this.getOfflineResponse();
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    message,
                    context: context.slice(-5).map(m => ({ source: m.source, content: m.content })),
                    userStats: {
                        designation: userStats.designation,
                        faction: userStats.faction,
                        rank: userStats.rank,
                        currentSector: userStats.currentSector,
                        xp: userStats.xp,
                        skills: userStats.skills,
                    },
                }),
            });

            if (!response.ok) {
                console.error(`[ApiClient] Edge function HTTP ${response.status}`);
                return this.getOfflineResponse();
            }

            const data = await response.json();
            return data as APIResponse;
        } catch (err) {
            console.error('[ApiClient] Edge function error:', err);
            return this.getOfflineResponse();
        }
    }

    async syncUser(user: User): Promise<APIResponse> {
        if (!this.isConfigured) {
            return { success: true, data: {}, meta: { aiModel: 'fallback', latencyMs: 0, rateLimitRemaining: 999 } };
        }
        return this.request({
            action: 'SYNC_USER',
            userId: user.id,
            payload: { user }
        });
    }

    async getLeaderboard(faction?: Faction): Promise<APIResponse> {
        if (!this.isConfigured) {
            return { success: true, data: { entries: [] }, meta: { aiModel: 'fallback', latencyMs: 0, rateLimitRemaining: 999 } };
        }
        return this.request({
            action: 'GET_LEADERBOARD',
            userId: 'system',
            payload: { faction }
        });
    }

    async getFactionStatus(): Promise<APIResponse> {
        if (!this.isConfigured) {
            return { success: true, data: { factions: [] }, meta: { aiModel: 'fallback', latencyMs: 0, rateLimitRemaining: 999 } };
        }
        return this.request({
            action: 'GET_FACTION_STATUS',
            userId: 'system',
            payload: {}
        });
    }

    async getDailyQuests(sector: number): Promise<APIResponse> {
        if (!this.isConfigured) {
            return { success: true, data: { quests: [] }, meta: { aiModel: 'fallback', latencyMs: 0, rateLimitRemaining: 999 } };
        }
        return this.request({
            action: 'GET_DAILY_QUESTS',
            userId: 'system',
            payload: { currentSector: sector }
        });
    }
}

export const apiClient = new ApiClient();
