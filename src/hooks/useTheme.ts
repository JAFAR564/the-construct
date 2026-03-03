import { useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { getTheme } from '@/constants/themes';
import type { FactionTheme } from '@/constants/themes';

export function useTheme(): FactionTheme {
    const faction = useGameStore(state => state.user?.faction);
    const themeIntensity = useGameStore(state => state.user?.settings?.themeIntensity) || 'balanced';
    const theme = getTheme(faction || 'KEEPERS_OF_THE_VEIL');

    useEffect(() => {
        const root = document.documentElement;

        // Compute intensity modifiers
        let scanlineOpacity = theme.scanlineOpacity;
        let vignetteIntensity = theme.vignetteIntensity;
        let particleOpacityMultiplier = 1;

        switch (themeIntensity) {
            case 'subtle':
                scanlineOpacity *= 0.3;
                vignetteIntensity *= 0.3;
                particleOpacityMultiplier = 0.3;
                break;
            case 'balanced':
                // Use defaults
                break;
            case 'maximum':
                scanlineOpacity = Math.min(scanlineOpacity * 1.5, 1);
                vignetteIntensity = Math.min(vignetteIntensity * 1.5, 0.8);
                particleOpacityMultiplier = 2;
                break;
        }

        // Apply all theme colors as CSS custom properties
        root.style.setProperty('--bg-dark', theme.bgDark);
        root.style.setProperty('--bg-surface', theme.bgSurface);
        root.style.setProperty('--bg-elevated', theme.bgElevated);
        root.style.setProperty('--text-primary', theme.textPrimary);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--border-terminal', theme.border);
        root.style.setProperty('--accent-danger', theme.danger);
        root.style.setProperty('--accent-warning', theme.warning);
        root.style.setProperty('--faction-active', theme.primary);
        root.style.setProperty('--faction-glow', theme.primaryGlow);
        root.style.setProperty('--font-display', theme.fontDisplay);
        root.style.setProperty('--scanline-color', theme.scanlineColor);
        root.style.setProperty('--scanline-opacity', scanlineOpacity.toString());
        root.style.setProperty('--vignette-intensity', vignetteIntensity.toString());
        root.style.setProperty('--particle-opacity-mult', particleOpacityMultiplier.toString());

        // Update body background immediately
        document.body.style.backgroundColor = theme.bgDark;
        document.body.style.color = theme.textPrimary;

        // Update meta theme-color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme.bgDark);
        }

    }, [theme, themeIntensity]);

    return theme;
}
