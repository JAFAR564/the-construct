import type { Faction, CoreSkill } from '@/types';

export interface FactionData {
    id: Faction;
    name: string;
    description: string;
    motto: string;
    color: string;
    skills: CoreSkill[];
}

export const FACTIONS: FactionData[] = [
    {
        id: 'TECHNOCRATS',
        name: 'Technocrats',
        description: 'Masters of code and machine.',
        motto: '"We do not fear the machine. We ARE the machine."',
        color: 'var(--faction-technocrats)',
        skills: ['HACKING', 'ENGINEERING', 'ARCANA']
    },
    {
        id: 'KEEPERS_OF_THE_VEIL',
        name: 'Keepers of the Veil',
        description: 'Guardians of arcane knowledge.',
        motto: '"The old ways are not dead. They are waiting."',
        color: 'var(--faction-keepers)',
        skills: ['ARCANA', 'DIPLOMACY', 'SURVIVAL']
    },
    {
        id: 'IRONBORN_COLLECTIVE',
        name: 'Ironborn Collective',
        description: 'Survivors forged in fire.',
        motto: '"No code. No magic. Just steel and will."',
        color: 'var(--faction-ironborn)',
        skills: ['COMBAT', 'SURVIVAL', 'ENGINEERING']
    }
];
