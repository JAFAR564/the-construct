import localforage from 'localforage';
import type { User, ChatMessage, Quest, UserSettings } from '@/types';
import { DEFAULT_ABILITIES } from '@/constants/abilities';
import { STARTER_EQUIPMENT } from '@/constants/starterEquipment';

localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'the-construct',
    storeName: 'construct_data'
});

/** Backfill any missing fields for users created before the type expansion. */
function migrateUser(user: User): User {
    const migrated = { ...user };

    if (!migrated.equipment) migrated.equipment = STARTER_EQUIPMENT;
    if (!migrated.equippedItems) migrated.equippedItems = {};
    if (!migrated.abilities) migrated.abilities = DEFAULT_ABILITIES;
    if (!migrated.characterProfile) {
        migrated.characterProfile = {
            backstory: '', alignment: 'TRUE_NEUTRAL', strengths: [], weaknesses: [],
            allies: [], enemies: [], personalMotto: '', themeSong: '',
            memoryLog: [], privacyLevel: 'public',
        };
    }
    if (migrated.level == null) migrated.level = 1;
    if (migrated.xpToNextLevel == null) migrated.xpToNextLevel = 100;
    if (migrated.totalXP == null) migrated.totalXP = 0;
    if (!migrated.settings?.themeIntensity) {
        migrated.settings = { ...migrated.settings, themeIntensity: 'balanced' };
    }

    return migrated;
}

export async function saveUser(user: User): Promise<void> {
    await localforage.setItem('construct_user', user);
}

export async function getUser(): Promise<User | null> {
    const user = await localforage.getItem<User>('construct_user');
    return user ? migrateUser(user) : null;
}

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
    const trimmed = messages.slice(-200);
    await localforage.setItem('construct_messages', trimmed);
}

export async function getMessages(): Promise<ChatMessage[]> {
    const messages = await localforage.getItem<ChatMessage[]>('construct_messages');
    return messages || [];
}

export async function saveQuests(quests: Quest[]): Promise<void> {
    await localforage.setItem('construct_quests', quests);
}

export async function getQuests(): Promise<Quest[]> {
    const quests = await localforage.getItem<Quest[]>('construct_quests');
    return quests || [];
}

export async function saveSettings(settings: UserSettings): Promise<void> {
    await localforage.setItem('construct_settings', settings);
}

export async function getSettings(): Promise<UserSettings | null> {
    return await localforage.getItem<UserSettings>('construct_settings');
}

export async function setBootComplete(value: boolean): Promise<void> {
    await localforage.setItem('construct_boot_complete', value);
}

export async function isBootComplete(): Promise<boolean> {
    const value = await localforage.getItem<boolean>('construct_boot_complete');
    return !!value;
}

export async function clearAll(): Promise<void> {
    await localforage.clear();
}

export async function exportSave(): Promise<string> {
    const keys = await localforage.keys();
    const data: Record<string, any> = {};
    for (const key of keys) {
        data[key] = await localforage.getItem(key);
    }
    return JSON.stringify(data);
}

export async function importSave(json: string): Promise<void> {
    try {
        const data = JSON.parse(json);
        await localforage.clear();
        for (const key in data) {
            await localforage.setItem(key, data[key]);
        }
    } catch (e) {
        console.error('Failed to import save:', e);
        throw new Error('Invalid save file');
    }
}
