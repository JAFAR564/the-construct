import { supabase, isSupabaseConfigured } from '@/services/supabase';
import * as localDB from '@/services/localDB';
import type {
    User, ChatMessage, Quest, Equipment, Ability,
    CoreSkill, Faction, Rank, ElementalAffinity, Alignment,
    EquipmentSlot, Rarity, AbilityCategory, QuestType, QuestStatus, QuestDifficulty,
} from '@/types';

// ============================
// Hybrid approach: Supabase when available, localDB as fallback
// ============================

// ── USER ──

export async function getUser(authId: string): Promise<User | null> {
    if (!isSupabaseConfigured) return localDB.getUser();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (error || !data) return null;
    return mapDbUserToUser(data);
}

export async function saveUser(user: User, authId?: string): Promise<void> {
    if (!isSupabaseConfigured) {
        await localDB.saveUser(user);
        return;
    }

    const dbUser = mapUserToDbUser(user, authId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase
        .from('users')
        .upsert(dbUser as any, { onConflict: 'id' });

    if (error) {
        console.error('[SupabaseDB] Failed to save user:', error);
        await localDB.saveUser(user);
    }
}

// ── MESSAGES ──

export async function getMessages(userId?: string, limit = 50): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured || !userId) return localDB.getMessages();

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error || !data) return [];
    return data.map(mapDbMessageToMessage);
}

export async function saveMessage(userId: string | undefined, message: ChatMessage): Promise<void> {
    if (!isSupabaseConfigured || !userId) {
        const messages = await localDB.getMessages();
        messages.push(message);
        await localDB.saveMessages(messages.slice(-200));
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase
        .from('messages')
        .insert({
            user_id: userId,
            source: message.source,
            content: message.content,
            choices: message.choices || [],
            stat_changes: message.statChanges || [],
            is_glitch: message.glitch || false,
        } as any);

    if (error) console.error('[SupabaseDB] Failed to save message:', error);
}

export async function saveMessages(userId: string | undefined, messages: ChatMessage[]): Promise<void> {
    if (!isSupabaseConfigured || !userId) {
        await localDB.saveMessages(messages);
        return;
    }
    // For bulk save to Supabase, we skip re-inserting — individual messages
    // are saved via saveMessage() in the addMessage flow. This function
    // is mainly for the localDB fallback path.
    await localDB.saveMessages(messages);
}

// ── QUESTS ──

export async function getQuests(userId?: string, status?: string): Promise<Quest[]> {
    if (!isSupabaseConfigured || !userId) return localDB.getQuests();

    let query = supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapDbQuestToQuest);
}

export async function saveQuest(userId: string | undefined, quest: Quest): Promise<void> {
    if (!isSupabaseConfigured || !userId) {
        const quests = await localDB.getQuests();
        const idx = quests.findIndex(q => q.id === quest.id);
        if (idx >= 0) quests[idx] = quest;
        else quests.push(quest);
        await localDB.saveQuests(quests);
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase
        .from('quests')
        .upsert({
            id: quest.id,
            user_id: userId,
            type: quest.type,
            title: quest.title,
            description: quest.description,
            difficulty: quest.difficulty || 'MEDIUM',
            sector: quest.sector,
            status: quest.status,
            current_stage: quest.currentStage,
            total_stages: quest.totalStages,
            rewards: quest.rewards,
            narrative: quest.narrative || [],
            choices: quest.choices || [],
            quest_giver: quest.questGiver || {},
            npcs_involved: quest.npcsInvolved || [],
            branches: quest.branches || [],
            alignment_shift: quest.alignmentShift || {},
            stage_viewed: quest.stageViewed || [],
            is_chain_quest: quest.isChainQuest,
            chain_id: quest.chainId ?? null,
            chain_position: quest.chainPosition ?? null,
            fail_consequence: quest.failConsequence ?? null,
            expires_at: quest.expiresAt ?? null,
            completed_at: quest.completedAt ?? null,
        } as any, { onConflict: 'id' });

    if (error) console.error('[SupabaseDB] Failed to save quest:', error);
}

export async function saveQuests(userId: string | undefined, quests: Quest[]): Promise<void> {
    if (!isSupabaseConfigured || !userId) {
        await localDB.saveQuests(quests);
        return;
    }
    // Individual quests are saved via saveQuest(). Bulk is localDB only.
    await localDB.saveQuests(quests);
}

// ── EQUIPMENT ──

export async function getEquipment(userId: string): Promise<Equipment[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('user_id', userId);

    if (error || !data) return [];
    return data.map(mapDbEquipmentToEquipment);
}

// ── ABILITIES ──

export async function getAbilities(userId: string): Promise<Ability[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .from('abilities')
        .select('*')
        .eq('user_id', userId);

    if (error || !data) return [];
    return data.map(mapDbAbilityToAbility);
}

// ── LEADERBOARD ──

export async function getLeaderboard() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(100);

    if (error || !data) return [];
    return data;
}

// ── FACTIONS ──

export async function getFactionStatus() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .from('factions')
        .select('*');

    if (error || !data) return [];
    return data;
}

// ── SECTORS ──

export async function getSectors() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('id');

    if (error || !data) return [];
    return data;
}

// ── REALTIME ──

export function subscribeToChannel(
    channelId: string,
    onMessage: (message: Record<string, unknown>) => void
) {
    if (!isSupabaseConfigured) return { unsubscribe: () => { } };

    const subscription = supabase
        .channel(`channel - ${channelId} `)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'channel_messages',
                filter: `channel_id = eq.${channelId} `
            },
            (payload) => onMessage(payload.new as Record<string, unknown>)
        )
        .subscribe();

    return subscription;
}

// ============================
// MAPPERS: DB row <-> App types
// ============================

function mapDbUserToUser(row: Record<string, unknown>): User {
    return {
        id: row.id as string,
        designation: row.designation as string,
        faction: row.faction as Faction,
        rank: row.rank as Rank,
        prestige: row.prestige as number,
        xp: row.xp as number,
        xpToNextRank: row.xp_to_next_rank as number,
        level: row.level as number,
        totalXP: row.total_xp as number,
        xpToNextLevel: row.xp_to_next_level as number,
        currentSector: row.current_sector as number,
        skills: {
            HACKING: row.skill_hacking as number,
            COMBAT: row.skill_combat as number,
            DIPLOMACY: row.skill_diplomacy as number,
            SURVIVAL: row.skill_survival as number,
            ARCANA: row.skill_arcana as number,
            ENGINEERING: row.skill_engineering as number,
        },
        primaryElement: row.primary_element as ElementalAffinity,
        secondaryElement: (row.secondary_element as ElementalAffinity) || null,
        titles: (row.titles as string[]) || [],
        joinedAt: row.created_at as string,
        lastActiveAt: row.last_active_at as string,
        settings: {
            soundEnabled: row.sound_enabled as boolean,
            scanlineIntensity: row.scanline_intensity as number,
            crtFlicker: row.crt_flicker as boolean,
            textSpeed: row.text_speed as number,
            themeIntensity: row.theme_intensity as 'subtle' | 'balanced' | 'maximum',
        },
        characterProfile: {
            backstory: (row.backstory as string) || '',
            alignment: (row.alignment as Alignment) || 'TRUE_NEUTRAL',
            strengths: (row.strengths as string[]) || [],
            weaknesses: (row.weaknesses as string[]) || [],
            allies: (row.allies as string[]) || [],
            enemies: (row.enemies as string[]) || [],
            personalMotto: (row.personal_motto as string) || '',
            themeSong: (row.theme_song as string) || '',
            memoryLog: [],
            privacyLevel: (row.privacy_level as 'public' | 'faction_only' | 'private') || 'public',
        },
        avatarDataUrl: (row.avatar_data_url as string) || undefined,
        equipment: [],
        equippedItems: {},
        abilities: [],
    };
}

function mapUserToDbUser(user: User, authId?: string): Record<string, unknown> {
    return {
        id: user.id,
        ...(authId ? { auth_id: authId } : {}),
        designation: user.designation,
        faction: user.faction,
        rank: user.rank,
        prestige: user.prestige,
        xp: user.xp,
        xp_to_next_rank: user.xpToNextRank,
        level: user.level || 1,
        total_xp: user.totalXP || 0,
        xp_to_next_level: user.xpToNextLevel || 100,
        current_sector: user.currentSector,
        skill_hacking: user.skills.HACKING,
        skill_combat: user.skills.COMBAT,
        skill_diplomacy: user.skills.DIPLOMACY,
        skill_survival: user.skills.SURVIVAL,
        skill_arcana: user.skills.ARCANA,
        skill_engineering: user.skills.ENGINEERING,
        primary_element: user.primaryElement,
        secondary_element: user.secondaryElement,
        alignment: user.characterProfile?.alignment || 'TRUE_NEUTRAL',
        backstory: user.characterProfile?.backstory || '',
        personal_motto: user.characterProfile?.personalMotto || '',
        theme_song: user.characterProfile?.themeSong || '',
        avatar_data_url: user.avatarDataUrl || null,
        privacy_level: user.characterProfile?.privacyLevel || 'public',
        sound_enabled: user.settings.soundEnabled,
        scanline_intensity: user.settings.scanlineIntensity,
        crt_flicker: user.settings.crtFlicker,
        text_speed: user.settings.textSpeed,
        theme_intensity: user.settings.themeIntensity || 'balanced',
        titles: user.titles,
        strengths: user.characterProfile?.strengths || [],
        weaknesses: user.characterProfile?.weaknesses || [],
        allies: user.characterProfile?.allies || [],
        enemies: user.characterProfile?.enemies || [],
        last_active_at: new Date().toISOString(),
    };
}

function mapDbMessageToMessage(row: Record<string, unknown>): ChatMessage {
    return {
        id: row.id as string,
        source: row.source as ChatMessage['source'],
        content: row.content as string,
        timestamp: row.created_at as string,
        choices: (row.choices as ChatMessage['choices']) || [],
        statChanges: (row.stat_changes as ChatMessage['statChanges']) || [],
        glitch: row.is_glitch as boolean,
    };
}

function mapDbQuestToQuest(row: Record<string, unknown>): Quest {
    return {
        id: row.id as string,
        type: row.type as QuestType,
        title: row.title as string,
        description: row.description as string,
        difficulty: (row.difficulty as QuestDifficulty) || 'MEDIUM',
        sector: row.sector as number,
        status: row.status as QuestStatus,
        currentStage: row.current_stage as number,
        totalStages: row.total_stages as number,
        rewards: (row.rewards as Quest['rewards']) || [],
        narrative: (row.narrative as string[]) || [],
        choices: (row.choices as Quest['choices']) || [],
        questGiver: (row.quest_giver as Quest['questGiver']) || { designation: '', faction: 'TECHNOCRATS' as Faction, role: 'quest_giver' as const, personality: '', dialogue: [] },
        npcsInvolved: (row.npcs_involved as Quest['npcsInvolved']) || [],
        branches: (row.branches as Quest['branches']) || [],
        alignmentShift: (row.alignment_shift as Quest['alignmentShift']) || {},
        stageViewed: (row.stage_viewed as boolean[]) || [],
        isChainQuest: row.is_chain_quest as boolean,
        chainId: (row.chain_id as string) || undefined,
        chainPosition: (row.chain_position as number) || undefined,
        failConsequence: (row.fail_consequence as string) || undefined,
        expiresAt: (row.expires_at as string) || undefined,
        completedAt: (row.completed_at as string) || undefined,
    };
}

function mapDbEquipmentToEquipment(row: Record<string, unknown>): Equipment {
    return {
        id: row.id as string,
        name: row.name as string,
        slot: row.slot as EquipmentSlot,
        rarity: row.rarity as Rarity,
        description: (row.description as string) || '',
        stats: (row.stats as Partial<Record<CoreSkill, number>>) || {},
        lore: (row.lore as string) || '',
        acquiredAt: row.acquired_at as string,
        source: (row.source as string) || '',
    };
}

function mapDbAbilityToAbility(row: Record<string, unknown>): Ability {
    return {
        id: row.ability_id as string,
        name: row.name as string,
        category: row.category as AbilityCategory,
        description: row.description as string,
        levelRequired: row.level_required as number,
        cooldown: (row.cooldown as string) || 'None',
        cost: (row.cost as string) || 'Passive',
        effect: row.effect as string,
        unlocked: row.unlocked as boolean,
    };
}
