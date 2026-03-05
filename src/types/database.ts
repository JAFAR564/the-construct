export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    auth_id: string;
                    designation: string;
                    faction: string;
                    rank: string;
                    prestige: number;
                    xp: number;
                    xp_to_next_rank: number;
                    level: number;
                    total_xp: number;
                    xp_to_next_level: number;
                    current_sector: number;
                    skill_hacking: number;
                    skill_combat: number;
                    skill_diplomacy: number;
                    skill_survival: number;
                    skill_arcana: number;
                    skill_engineering: number;
                    primary_element: string;
                    secondary_element: string | null;
                    alignment: string;
                    backstory: string;
                    personal_motto: string;
                    theme_song: string;
                    avatar_data_url: string | null;
                    privacy_level: string;
                    sound_enabled: boolean;
                    scanline_intensity: number;
                    crt_flicker: boolean;
                    text_speed: number;
                    theme_intensity: string;
                    titles: string[];
                    strengths: string[];
                    weaknesses: string[];
                    allies: string[];
                    enemies: string[];
                    total_messages: number;
                    total_quests_completed: number;
                    created_at: string;
                    last_active_at: string;
                };
                Insert: Partial<Database['public']['Tables']['users']['Row']> & {
                    designation: string;
                    faction: string;
                };
                Update: Partial<Database['public']['Tables']['users']['Row']>;
            };
            messages: {
                Row: {
                    id: string;
                    user_id: string;
                    source: string;
                    content: string;
                    choices: unknown;
                    stat_changes: unknown;
                    is_glitch: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['messages']['Row']>;
            };
            equipment: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    slot: string;
                    rarity: string;
                    description: string;
                    stats: unknown;
                    lore: string;
                    source: string;
                    is_equipped: boolean;
                    acquired_at: string;
                };
                Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'acquired_at'>;
                Update: Partial<Database['public']['Tables']['equipment']['Row']>;
            };
            abilities: {
                Row: {
                    id: string;
                    user_id: string;
                    ability_id: string;
                    name: string;
                    category: string;
                    description: string;
                    level_required: number;
                    cooldown: string;
                    cost: string;
                    effect: string;
                    unlocked: boolean;
                };
                Insert: Omit<Database['public']['Tables']['abilities']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['abilities']['Row']>;
            };
            quests: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    description: string;
                    difficulty: string;
                    sector: number;
                    status: string;
                    current_stage: number;
                    total_stages: number;
                    rewards: unknown;
                    narrative: unknown;
                    choices: unknown;
                    quest_giver: unknown;
                    npcs_involved: unknown;
                    branches: unknown;
                    alignment_shift: unknown;
                    stage_viewed: unknown;
                    is_chain_quest: boolean;
                    chain_id: string | null;
                    chain_position: number | null;
                    fail_consequence: string | null;
                    expires_at: string | null;
                    completed_at: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['quests']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['quests']['Row']>;
            };
            memory_log: {
                Row: {
                    id: string;
                    user_id: string;
                    event: string;
                    type: string;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['memory_log']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['memory_log']['Row']>;
            };
            factions: {
                Row: {
                    id: string;
                    total_power: number;
                    sectors_controlled: number;
                    member_count: number;
                    weekly_change: number;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['factions']['Row']> & { id: string };
                Update: Partial<Database['public']['Tables']['factions']['Row']>;
            };
            sectors: {
                Row: {
                    id: number;
                    name: string;
                    controlled_by: string | null;
                    threat_level: number;
                    terrain: string;
                    weather: string;
                    description: string;
                    resources: string[];
                    npcs_present: string[];
                    discovered_by: string[];
                    active_events: string[];
                    adjacent_sectors: number[];
                    points_of_interest: unknown;
                    last_contested_at: string | null;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['sectors']['Row']> & { id: number; name: string };
                Update: Partial<Database['public']['Tables']['sectors']['Row']>;
            };
            chat_channels: {
                Row: {
                    id: string;
                    name: string;
                    type: string;
                    description: string;
                    faction: string | null;
                    is_locked: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['chat_channels']['Row'], 'created_at'>;
                Update: Partial<Database['public']['Tables']['chat_channels']['Row']>;
            };
            channel_messages: {
                Row: {
                    id: string;
                    channel_id: string;
                    user_id: string | null;
                    designation: string;
                    faction: string;
                    rank: string;
                    content: string;
                    reactions: unknown;
                    reply_to: string | null;
                    is_npc: boolean;
                    is_pinned: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['channel_messages']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['channel_messages']['Row']>;
            };
            combat_sessions: {
                Row: {
                    id: string;
                    channel_id: string;
                    status: string;
                    participants: unknown;
                    rounds: unknown;
                    current_round: number;
                    max_rounds: number;
                    environment: string;
                    environment_modifiers: string[];
                    ai_judge_enabled: boolean;
                    winner_id: string | null;
                    rewards: unknown;
                    started_at: string;
                    completed_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['combat_sessions']['Row'], 'id' | 'started_at'>;
                Update: Partial<Database['public']['Tables']['combat_sessions']['Row']>;
            };
            war_history: {
                Row: {
                    id: string;
                    cycle_start: string;
                    cycle_end: string;
                    winner: string | null;
                    technocrat_score: number;
                    keepers_score: number;
                    ironborn_score: number;
                    total_participants: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['war_history']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['war_history']['Row']>;
            };
        };
        Views: {
            leaderboard: {
                Row: {
                    position: number;
                    id: string;
                    designation: string;
                    faction: string;
                    rank: string;
                    prestige: number;
                    level: number;
                    total_quests_completed: number;
                    last_active_at: string;
                };
            };
        };
    };
}
