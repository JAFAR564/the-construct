import type { Rank } from '@/types';
import { RANKS } from '@/constants/ranks';

export function getRankForPrestige(prestige: number): Rank {
    let highestRank: Rank = 'INITIATE';
    for (const rankData of RANKS) {
        if (prestige >= rankData.prestigeRequired) {
            highestRank = rankData.rank;
        } else {
            break;
        }
    }
    return highestRank;
}

export function getXPProgress(xp: number, rank: Rank): { current: number, required: number, percentage: number } {
    const rankData = RANKS.find(r => r.rank === rank);
    if (!rankData) return { current: xp, required: 100, percentage: 0 };

    const required = rankData.xpPerRank;
    if (required === 0) return { current: xp, required: 0, percentage: 100 }; // SOVEREIGN

    const percentage = Math.min(100, Math.max(0, (xp / required) * 100));
    return { current: xp, required, percentage };
}

export function getNextRank(rank: Rank): Rank | null {
    const index = RANKS.findIndex(r => r.rank === rank);
    if (index === -1 || index === RANKS.length - 1) return null;
    return RANKS[index + 1].rank;
}

export function calculatePrestigeGain(action: string): number {
    switch (action) {
        case 'quest_complete': return 50;
        case 'anomaly_resolved': return 100;
        case 'faction_event': return 200;
        default: return 10;
    }
}
