import { create } from 'zustand';
import type { FactionStatus, Sector, Faction } from '@/types';
import { ApiClient } from '@/services/client';
import { SECTORS } from '@/constants/sectors';

const api = new ApiClient();

export interface FactionState {
    factionStatuses: FactionStatus[];
    sectors: Sector[];
    warTimeRemaining: string;
    lastFetched: string | null;
    scoutedSectors: Set<number>;    // sectors scouted this session

    setFactionStatuses: (statuses: FactionStatus[]) => void;
    setSectors: (sectors: Sector[]) => void;
    updateSectorControl: (sectorId: number, faction: Faction | null) => void;
    setWarTimeRemaining: (time: string) => void;
    fetchFactionData: () => Promise<void>;
    initializeSectors: (playerSector: number) => void;
    discoverSector: (sectorId: number) => void;
    discoverPOI: (sectorId: number, poiId: string) => void;
    markScouted: (sectorId: number) => void;
    isScouted: (sectorId: number) => boolean;
}

export const useFactionStore = create<FactionState>((set, get) => ({
    factionStatuses: [],
    sectors: [],
    warTimeRemaining: '00:00:00',
    lastFetched: null,
    scoutedSectors: new Set<number>(),

    setFactionStatuses: (statuses) => set({ factionStatuses: statuses }),
    setSectors: (sectors) => set({ sectors }),

    updateSectorControl: (sectorId, faction) => set(state => ({
        sectors: state.sectors.map(s => s.id === sectorId ? { ...s, controlledBy: faction } : s)
    })),

    setWarTimeRemaining: (time) => set({ warTimeRemaining: time }),

    initializeSectors: (playerSector: number) => {
        const { sectors } = get();
        if (sectors.length === 0) {
            // Deep clone sectors and discover player's sector + adjacent
            const initialized = SECTORS.map(s => {
                const isPlayerSector = s.id === playerSector;
                const playerSectorData = SECTORS.find(ps => ps.id === playerSector);
                const isAdjacent = playerSectorData?.adjacentSectors.includes(s.id) || false;
                return {
                    ...s,
                    discovered: isPlayerSector || isAdjacent,
                    pointsOfInterest: s.pointsOfInterest.map(poi => ({
                        ...poi,
                        discovered: isPlayerSector ? poi.discovered : false,
                    })),
                };
            });
            set({ sectors: initialized });
        }
    },

    discoverSector: (sectorId: number) => set(state => ({
        sectors: state.sectors.map(s => s.id === sectorId ? { ...s, discovered: true } : s)
    })),

    discoverPOI: (sectorId: number, poiId: string) => set(state => ({
        sectors: state.sectors.map(s =>
            s.id === sectorId
                ? { ...s, pointsOfInterest: s.pointsOfInterest.map(p => p.id === poiId ? { ...p, discovered: true } : p) }
                : s
        )
    })),

    markScouted: (sectorId: number) => set(state => {
        const next = new Set(state.scoutedSectors);
        next.add(sectorId);
        return { scoutedSectors: next };
    }),

    isScouted: (sectorId: number) => get().scoutedSectors.has(sectorId),

    fetchFactionData: async () => {
        const { lastFetched } = get();
        if (lastFetched) {
            const now = new Date().getTime();
            const last = new Date(lastFetched).getTime();
            if (now - last < 5 * 60 * 1000) return;
        }

        try {
            const resp = await api.getFactionStatus();
            if (resp.success && resp.data.factions) {
                set({ factionStatuses: resp.data.factions, lastFetched: new Date().toISOString() });
            }
        } catch (e) {
            console.warn('Failed to fetch faction data:', e);
        }
    }
}));
