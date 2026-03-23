---
name: Terminal Aesthetic
description: CSS design system, glassmorphism patterns, and visual rules for The Construct UI
---

# Terminal Aesthetic

## Core Principles

- **No CSS frameworks.** No Tailwind, no Bootstrap, no component libraries.
- **Vanilla CSS only** with CSS custom properties for theming.
- **Dark mode always.** Background is near-black, text is light.
- **CRT/terminal feel** blended with modern glassmorphism.
- **Faction-aware.** All accent colors come from CSS variables, never hardcoded.

## CSS Architecture

| File | Purpose |
|------|---------|
| `src/styles/variables.css` | Global design tokens (colors, fonts, spacing) |
| `src/styles/index.css` | Global resets and base styles |
| `src/styles/PremiumPage.css` | Shared premium page classes (glass cards, tabs, buttons) |
| `src/components/feed/FeedLayout.css` | Terminal news feed styles |
| `src/components/messenger/MessengerLayout.css` | Faction messenger styles |

## Key CSS Variables

```css
--bg-dark: #0A0A0A;
--bg-surface: #111111;
--bg-elevated: #1A1A1A;
--text-primary: #E0E0E0;
--text-secondary: #AAAAAA;
--text-muted: #666666;
--text-bright: #FFFFFF;
--border-terminal: #333333;
--faction-active: /* set dynamically per faction */;
--font-mono: 'JetBrains Mono', monospace;
--font-ui: 'Inter', sans-serif;
--font-display: /* display font */;
```

## Glassmorphism Pattern

```css
.glass-container {
  background: linear-gradient(145deg, rgba(20,20,20,0.85), rgba(10,10,10,0.92));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
}
```

## PremiumPage.css Classes

The shared `PremiumPage.css` provides reusable classes for all pages:

| Class | Purpose |
|-------|---------|
| `.ppage` | Full glass page container |
| `.ppage__title` | Glowing page title |
| `.ppage__tabs` / `.ppage__tab` | Tab bar system |
| `.ppage__section` | Section header with dot indicator |
| `.ppage__card` | Inner glass card |
| `.ppage__btn` | Glass button (variants: `--primary`, `--danger`, `--warning`) |
| `.ppage__input` / `.ppage__textarea` | Glass form controls |
| `.ppage__tag` / `.ppage__badge` | Tag pills and status badges |
| `.ppage__stat-row` | Key-value display row |
| `.ppage__flex-*` | Layout helpers (row, col, wrap, between) |

## Parent Override Pattern

When a page needs to break out of the `main-content` max-width:

```css
.main-content:has(.ppage) {
  max-width: 900px !important;
}
```

## Animation Guidelines

- Use CSS animations, not JavaScript-based animation libraries
- Keep animations subtle: 0.15s–0.35s duration
- Common keyframes: `fadeIn`, `slideUp`, `pulse`
- Never animate `width` or `height` — use `transform` and `opacity`

## Vibe Check: Context Pinning
- **PRO TIP**: To save tokens and prevent "Context Decay" in the 4GB RAM environment, only "pin" the files you are currently editing.
- Use `/generate-handover` frequently to keep your Vibe-State fresh.
