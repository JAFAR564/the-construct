---
name: Faction Theming
description: Faction color system, CSS variable theming, and faction-specific speech and design patterns
---

# Faction Theming

## The Three Factions

| Faction | ID | Color | Philosophy |
|---------|----|-------|------------|
| **Technocrats** | `TECHNOCRATS` | `#00D4FF` (cyan) | Logic, data, efficiency, digital supremacy |
| **Keepers of the Veil** | `KEEPERS_OF_THE_VEIL` | `#00FF41` (green) | Mystery, balance, the old code, natural order |
| **Ironborn Collective** | `IRONBORN_COLLECTIVE` | `#FF6600` (orange) | Strength, industry, honor, pragmatism |

## CSS Variable System

Faction colors are applied via CSS custom properties set on the root element based on the player's faction:

```css
/* Set dynamically based on user.faction */
:root {
  --faction-active: #00FF41;   /* Primary accent — changes per faction */
  --faction-primary: #00FF41;
  --faction-secondary: #00CC33;
}
```

See `src/constants/themes.ts` for the full theme system and `src/constants/factions.ts` for faction data.

## Usage in Components

Always use CSS variables, never hardcode faction colors:

```css
/* ✅ Correct */
.element {
  color: var(--faction-active);
  border: 1px solid var(--faction-active);
  box-shadow: 0 0 8px var(--faction-active);
}

/* ❌ Wrong — hardcoded color */
.element {
  color: #00FF41;
}
```

## Faction Speech Patterns

When writing content or NPC dialogue, match the faction's voice:

### TECHNOCRATS
- **Tone:** Clinical, precise, protocol-driven
- **Vocabulary:** "data streams", "protocol", "efficiency metrics", "node", "computation"
- **Example:** `"Scan results processed. Threat vector analysis complete. Probability of hostile engagement: 34.7%. Recommend tactical withdrawal, Architect."`

### KEEPERS OF THE VEIL
- **Tone:** Mystical, allegorical, reverent
- **Vocabulary:** "the old code", "patterns", "weave", "resonance", "the Veil", "harmonics"
- **Example:** `"The patterns shift beneath your feet, Architect. Listen — the old code whispers of change. Something stirs beyond the Veil... something that remembers."`

### IRONBORN COLLECTIVE
- **Tone:** Direct, no-nonsense, honor-bound
- **Vocabulary:** "steel", "forge", "rust", "alloy", "the anvil", "tempering"
- **Example:** `"Steel doesn't ask permission to be strong. You want this sector? Take it. The Collective stands behind those who act, not those who deliberate."`

## Visual Theming per Faction

When designing faction-specific UI elements:

| Element | TECHNOCRATS | KEEPERS | IRONBORN |
|---------|------------|---------|----------|
| Glow | Cyan blue | Emerald green | Forge orange |
| Accent border | `rgba(0,212,255,0.2)` | `rgba(0,255,65,0.2)` | `rgba(255,102,0,0.2)` |
| Background tint | `rgba(0,212,255,0.05)` | `rgba(0,255,65,0.05)` | `rgba(255,102,0,0.05)` |
