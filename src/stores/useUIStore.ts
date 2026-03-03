import { create } from 'zustand';
import type { Command } from '@/constants/commands';
import { setBootComplete as localSetBootComplete, isBootComplete as localIsBootComplete } from '@/services/localDB';

export interface UIState {
    bootComplete: boolean;
    bootSkipped: boolean;
    currentRoute: string;
    showAutocomplete: boolean;
    autocompleteCommands: Command[];
    isOffline: boolean;
    modalOpen: string | null;

    setBootComplete: (value: boolean) => void;
    setBootSkipped: (value: boolean) => void;
    setCurrentRoute: (route: string) => void;
    setShowAutocomplete: (show: boolean, commands?: Command[]) => void;
    setOffline: (offline: boolean) => void;
    openModal: (id: string) => void;
    closeModal: () => void;
    initializeBootState: () => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
    bootComplete: false,
    bootSkipped: false,
    currentRoute: '/',
    showAutocomplete: false,
    autocompleteCommands: [],
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    modalOpen: null,

    setBootComplete: (value) => {
        localSetBootComplete(value);
        set({ bootComplete: value });
    },
    setBootSkipped: (value) => set({ bootSkipped: value }),
    setCurrentRoute: (route) => set({ currentRoute: route }),
    setShowAutocomplete: (show, commands) => set({ showAutocomplete: show, autocompleteCommands: commands || [] }),
    setOffline: (offline) => set({ isOffline: offline }),
    openModal: (id) => set({ modalOpen: id }),
    closeModal: () => set({ modalOpen: null }),
    initializeBootState: async () => {
        const isComplete = await localIsBootComplete();
        set({ bootComplete: isComplete });
    }
}));
