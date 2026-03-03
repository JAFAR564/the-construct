export interface FactionTheme {
    id: string;
    name: string;
    // Colors
    primary: string;
    primaryDim: string;
    primaryGlow: string;
    secondary: string;
    bgDark: string;
    bgSurface: string;
    bgElevated: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    danger: string;
    warning: string;
    // Typography
    fontDisplay: string;
    // Effects
    scanlineColor: string;
    scanlineOpacity: number;
    vignetteIntensity: number;
    particleType: 'runes' | 'rain' | 'sparks' | 'gears' | 'void';
    cursorStyle: string;
    // Audio
    ambientType: 'ethereal' | 'synth' | 'static' | 'clockwork' | 'whisper';
}

export const FACTION_THEMES: Record<string, FactionTheme> = {
    TECHNOCRATS: {
        id: 'TECHNOCRATS',
        name: 'Shadow Syndicate',
        primary: '#00D4FF',
        primaryDim: '#0099BB',
        primaryGlow: '0 0 5px #00D4FF, 0 0 10px #00D4FF, 0 0 20px rgba(0, 212, 255, 0.3)',
        secondary: '#FF00FF',
        bgDark: '#0A0A12',
        bgSurface: '#12121F',
        bgElevated: '#1A1A2E',
        textPrimary: '#00D4FF',
        textSecondary: '#0099BB',
        textMuted: '#4A4A6A',
        border: '#1E1E3A',
        danger: '#FF3355',
        warning: '#FFD700',
        fontDisplay: "'Orbitron', 'JetBrains Mono', monospace",
        scanlineColor: 'rgba(0, 212, 255, 0.08)',
        scanlineOpacity: 0.7,
        vignetteIntensity: 0.4,
        particleType: 'rain',
        cursorStyle: '▌',
        ambientType: 'synth',
    },
    KEEPERS_OF_THE_VEIL: {
        id: 'KEEPERS_OF_THE_VEIL',
        name: 'Arcane Order',
        primary: '#00FF41',
        primaryDim: '#00CC33',
        primaryGlow: '0 0 5px #00FF41, 0 0 10px #00FF41, 0 0 20px rgba(0, 255, 65, 0.3)',
        secondary: '#9B59B6',
        bgDark: '#0D0D0D',
        bgSurface: '#1A1A1A',
        bgElevated: '#252525',
        textPrimary: '#00FF41',
        textSecondary: '#00CC33',
        textMuted: '#666666',
        border: '#333333',
        danger: '#FF3333',
        warning: '#FFD700',
        fontDisplay: "'Cinzel', 'Times New Roman', serif",
        scanlineColor: 'rgba(0, 255, 65, 0.06)',
        scanlineOpacity: 0.5,
        vignetteIntensity: 0.3,
        particleType: 'runes',
        cursorStyle: '█',
        ambientType: 'ethereal',
    },
    IRONBORN_COLLECTIVE: {
        id: 'IRONBORN_COLLECTIVE',
        name: 'Ironborn Collective',
        primary: '#FF6600',
        primaryDim: '#CC5200',
        primaryGlow: '0 0 5px #FF6600, 0 0 10px #FF6600, 0 0 20px rgba(255, 102, 0, 0.3)',
        secondary: '#8B0000',
        bgDark: '#0D0A08',
        bgSurface: '#1A1510',
        bgElevated: '#2A2218',
        textPrimary: '#FF6600',
        textSecondary: '#CC5200',
        textMuted: '#6A5A4A',
        border: '#3A2A1A',
        danger: '#FF2222',
        warning: '#FFD700',
        fontDisplay: "'Bebas Neue', 'Impact', sans-serif",
        scanlineColor: 'rgba(255, 102, 0, 0.06)',
        scanlineOpacity: 0.6,
        vignetteIntensity: 0.5,
        particleType: 'sparks',
        cursorStyle: '▮',
        ambientType: 'static',
    }
};

export function getTheme(faction: string): FactionTheme {
    return FACTION_THEMES[faction] || FACTION_THEMES.KEEPERS_OF_THE_VEIL;
}
