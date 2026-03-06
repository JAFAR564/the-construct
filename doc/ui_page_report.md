# The Construct — UI Page Report

**Date:** March 6, 2026  
**User:** CHRIS | INITIATE | S-12  
**Faction:** Technocrats (cyan theme active)

---

## 1. THE GRID — Sector Map (`/world`)

**Purpose:** Interactive world map showing all sectors, faction control, and player location.

### What's Visible
- **Title bar:** "THE GRID — SECTOR MAP" in cyan display font
- **Grid layout:** 5×5+ grid of numbered sectors (S01–S50)
- **Discovered sectors** rendered with visible labels (S11, S12, S13, S07, S17)
- **Player location:** S12 highlighted with a glowing cyan border + crosshair cursor
- **Faction indicators:** Small colored dots on sectors — cyan (Technocrats), green (Keepers), orange (Ironborn)
- **Fog of war:** Undiscovered sectors show only faint grid outlines with muted sector numbers
- **Legend bar at bottom:**
  - `TE: 12` (Technocrat sectors), `KE: 12` (Keeper sectors), `IR: 15` (Ironborn sectors)
  - Player marker `📍 S-12`
  - `40 undiscovered` counter
- **Symbol legend:** Icons for faction territories and terrain types

### Desktop Layout
- Content is centered in the viewport with proper max-width constraint ✅
- Bottom nav visible with all 6 tabs (TERM, ARCH, GRID, DIR, FAC, SYS)
- Header shows `CONSTRUCT OS v3.0 | CHRIS | INITIATE | S-12 | [GRID: LINKED]`

---

## 2. Terminal — Main Gameplay (`/terminal`)

**Purpose:** Core gameplay interface — AI-driven narrative with choices.

### What's Visible
- **System greeting:** "Welcome back, Architect CHRIS. Current location: Sector S-12. Active directive: None"
- **Choice prompt:** "What would you like to do?" with 4 options:
  - `[A] Continue current directive`
  - `[B] Scan local sector`
  - `[C] Check faction status`
  - `[D] Open communications`
- **User selection:** `> Continue current directive`
- **AI narrative response (green glowing text):**
  > "FRAGMENTS DETECTED: A Keeper scroll digitized into the matrix. The runes glow with residual chronological energy. It speaks of the 'Source Code', an artifact that can rewrite reality."
- **Follow-up choices:** `[A] Attempt rune translation`, `[B] Report findings to faction`
- **Second exchange:** User chose `> Report findings to faction`
- **AI response:** "CONNECTION ESTABLISHED. The silence of the void is briefly interrupted by your presence. Local server loads are optimal. Awaiting your command parameter."
- **New choices:** `[A] Initialize sector sweep`, `[B] Access personal logs`
- **Input prompt:** `>` cursor at bottom, ready for user input

### Desktop Layout
- All content centered within ~720px column ✅
- Choices rendered as bordered blocks with cyan text
- AI responses in bright cyan with terminal glow effect
- Message feed scrollable with custom retro scrollbar

---

## 3. Settings — System Configuration (`/config`)

**Purpose:** User settings, data management, and the new Support section.

### What's Visible (top to bottom)

**Title:** "SYSTEM CONFIGURATION PANEL" in cyan display font with separator bar

**Settings Controls:**
| Setting | Type | Current Value |
|---|---|---|
| Sound Effects | Toggle | `[ON]` |
| CRT Flicker | Toggle | `[ON]` |
| Scanline Intensity | Slider | `70%` |
| Text Speed | Slider | `33ms` |
| Theme Intensity | 3-button selector | `[BALANCED]` selected (cyan highlight) |

**Data Management Buttons:**
- `EXPORT SAVE DATA` — white border
- `IMPORT SAVE DATA` — info/blue border
- `CLEAR LOCAL DATA` — red/danger border
- `SIGN OUT` — warning/gold border (visible because Supabase is configured)

**Support Section (new — from this session):**
- `▸ SUPPORT THE GRID` label in gold
- Description: "CONSTRUCT OS operates at zero cost. No ads. No paywalls. No data harvesting. If The Grid has value to you, consider fueling its expansion."
- `[⚡] FUEL THE GRID — Ko-fi` — gold bordered button
- `[★] STAR ON GITHUB` — secondary bordered button
- Disclaimer: "100% voluntary. Zero gameplay impact. All funds sustain infrastructure and development."

**Footer:** "CONSTRUCT OS v3.0.1 — By the Architect Cooperative"

### Desktop Layout
- Centered content, buttons are full-width within the column ✅
- All controls properly spaced and readable

---

## 4. Faction Hub — Chat Channels (`/faction`)

**Purpose:** Global and faction-specific real-time chat channels.

### What's Visible

**Left Panel — Channel List:**
- Header: `◂ CHANNELS`
- **Open Channels:**
  - `🟦 GLOBAL COMMS` (selected, highlighted cyan)
  - `⚔ COMBAT ARENA`
- **Technocrats (faction channels):**
  - `💬 GENERAL`
  - `🎭 ROLEPLAY`
  - `📢 ORDERS 🔒` (locked channel)

**Right Panel — Active Channel:**
- **Channel header:** `# GLOBAL COMMS` with description "Open channel — all factions. Find your allegiances."
- **System broadcast (muted):** "GRID BROADCAST: All frequencies open. Identify yourselves, Architects. Hostility will be met with system intervention."
- **User message:** `[CHRIS] INITIATE — 2m ago: "hi"`
- **Input field:** `> Transmit...` placeholder with `[SEND]` button

### Desktop Layout
- Two-column layout properly centered ✅
- Channel list takes ~30% width, chat panel takes ~70%
- Messages area has large empty space (expected — only 1 message exists)

---

## Global UI Elements (Present on All In-App Pages)

### HUD Header (fixed top bar)
| Left | Center | Right |
|---|---|---|
| `CONSTRUCT OS v3.0` (cyan glow) | `CHRIS | INITIATE | S-12` | `[GRID: LINKED]` |

### Bottom Navigation (fixed bottom bar)
| Icon | Label | Route |
|---|---|---|
| Terminal | TERM | `/terminal` |
| User | ARCH | `/profile` |
| Map | GRID | `/world` |
| ScrollText | DIR | `/quests` |
| Users | FAC | `/faction` |
| Settings | SYS | `/config` |

Active tab is highlighted in cyan with glow effect. Inactive tabs are dimmed gray.

### Visual Effects
- **CRT scanline sweep** — animated horizontal line sweeping top to bottom
- **Vignette overlay** — radial gradient darkening screen edges
- **Particle background** — faction-themed particles (rain/runes/sparks)
- **Custom scrollbar** — glowing cyan, retro-styled
- **JetBrains Mono font** — monospaced throughout for terminal authenticity
