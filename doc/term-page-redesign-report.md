# Term Page Redesign: "State-of-the-Art Premium Feed"

## Executive Summary
The current `Terminal.tsx` implements a classic, linear text-based interface. While functionally sound, it is too simplistic to engage a broad, modern audience. To elevate "The Construct" to a premium, highly engaging platform, we should pivot the Terminal page from a raw text output window into a **rich, dynamic, social-media inspired news feed**. 

Taking inspiration from Reddit, X (Twitter), Facebook, and Discord, the new design will feature a modern 3-column layout, distinct "Post Cards" for game events, glassmorphism aesthetics, and smooth animations, all while preserving the core cyberpunk/hacker roleplay thematic.

---

## 1. Current State Analysis
- **Layout**: Full-width, top-to-bottom sequentially scrolling text list with a sticky input bar at the bottom.
- **Visuals**: Flat text, basic font colors to separate roles. Utilitarian, resembling a barebones CLI.
- **Interactivity**: Inline text buttons for choices, scrolling can feel chaotic when multiple updates arrive.
- **Limitation**: Hard to read long text, lacks spatial organization, interface feels dated compared to modern web standards.

---

## 2. Design Vision & Premium Aesthetics
We want to achieve a **"Cyberspace Feed"** aesthetic—bridging a dark-mode modern social network with sci-fi terminal elements.
- **Premium Dark Mode**: Deep blacks (`#0D0D0D` and `#1A1A1A`) combined with frosted glass containers (`backdrop-filter: blur()`).
- **Typography**: Shift primary reading text to `Inter` (sans-serif) for high legibility, while reserving `JetBrains Mono` for system text, stats, and command inputs.
- **Animations**: Use `framer-motion` for fluid interactions. Posts should slide up and fade in. Hovering over interactive elements should produce a subtle glow or lift.
- **Dynamic Color**: Use the existing faction colors (`--faction-technocrats`, `--faction-ironborn`, etc.) as subtle glowing borders, gradient backgrounds on avatars, or neon highlights.

---

## 3. Layout Architecture (3-Column Pattern)
Instead of a single full-width column, we will adopt a responsive 3-column layout (collapsing to 1 on mobile).

1. **Left Column (Navigation & Identity - "The Sidebar")**
   - Active User Profile (Avatar, Designation, Level/Rank).
   - Quick Navigation (like Discord servers or Twitter sidebar).
   - Faction Status summary.
2. **Center Column (The Core News Feed)**
   - Scrolling feed of dynamic "Post Cards".
   - Sticky "Command Input" at the bottom (similar to Discord's chat bar), expanded to have a richer UI (placeholder text, action macros, command hints).
3. **Right Column (Context & World State)**
   - Current Active Directive / Quests.
   - Sector Information (Threat Level, Connected Nodes).
   - Online player counts or global event tickers.

---

## 4. Component Breakdown: The "Post Card"
Every message (System, NPC, Architect, AI_DM) will be encapsulated in a distinct card.

- **Header**: 
  - **Avatar**: A thematic icon (e.g., a glowing hex for AI, a silhouette for NPC, a terminal icon for System).
  - **Author Name**: Designation or Entity Name.
  - **Timestamp**: e.g., "Just now", "2m ago".
- **Body**: 
  - Rich text formatting. If it's an AI narrative, it gets beautiful line height and elegant typography. System alerts get mono-spaced, warning-colored styling.
- **Interactive Footer (The "Action Bar")**:
  - Instead of unstyled buttons, quest choices and interactions will look like social media action buttons (resembling Like/Comment/Share).
  - e.g., `[ A ] Investigate` `[ B ] Retreat` styled as pill-shaped, glowing interactive elements with hover tooltips detailing skill checks.

---

## 5. Interaction & User Engagement Focus
- **Floating Input Bar**: The input area will be elevated with a blur effect (`backdrop-filter`). It will support slash-command autosuggestions in a neat pop-up (like Discord).
- **Infinite Scroll Feel**: Older messages can be lazy-loaded or seamlessly integrated to feel like scrolling through a history feed.
- **Multimedia Placeholders**: Future-proofing the cards to support embedded maps, scanned images, or anomaly waveforms (e.g., audio clips or canvas animations).

---

## 6. Implementation Plan (Next Steps)
If approved, we will execute the redesign in the following phases:

1. **Phase 1: Component Architecture**
   - Create `FeedLayout.tsx` (the 3-column shell).
   - Create `FeedCard.tsx` (the base post component with Framer Motion).
   - Update `CommandInput.tsx` to a modernized, floating aesthetic.
2. **Phase 2: Data Mapping**
   - Refactor `Terminal.tsx` map function to translate `ChatMessage` into rich `FeedCard` properties.
   - Map `source` types to specific avatars and border highlight colors.
3. **Phase 3: Integration & Polish**
   - Inject the Active Quest UI into the Right Column (or as pinned items in the feed).
   - Apply CSS glassmorphism, glowing variables, and scrollbar hiding/styling.
   - Verify responsive behavior on smaller viewports.
