import type { Rank } from '@/types';

export interface RankData {
    rank: Rank;
    prestigeRequired: number;
    xpPerRank: number;
    clearanceLevel: number;
}

export const RANKS: RankData[] = [
    { rank: 'INITIATE', prestigeRequired: 0, xpPerRank: 500, clearanceLevel: 1 },
    { rank: 'OPERATIVE', prestigeRequired: 500, xpPerRank: 1000, clearanceLevel: 2 },
    { rank: 'SPECIALIST', prestigeRequired: 2000, xpPerRank: 2500, clearanceLevel: 3 },
    { rank: 'SENTINEL', prestigeRequired: 5000, xpPerRank: 5000, clearanceLevel: 4 },
    { rank: 'WARDEN', prestigeRequired: 12000, xpPerRank: 10000, clearanceLevel: 5 },
    { rank: 'COMMANDER', prestigeRequired: 25000, xpPerRank: 20000, clearanceLevel: 6 },
    { rank: 'OVERLORD', prestigeRequired: 50000, xpPerRank: 40000, clearanceLevel: 7 },
    { rank: 'SOVEREIGN', prestigeRequired: 100000, xpPerRank: 0, clearanceLevel: 8 }
];
