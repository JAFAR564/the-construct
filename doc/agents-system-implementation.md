# Agents System — Implementation Plan

## Current State

The `.agents/` system is already scaffolded and partially complete. This document captures what exists, what gaps remain, and what work is planned.

---

## Folder Structure (current)

```
.agents/
├── README.md                          ✅ Master index (agents, skills, workflows)
├── GUIDE.md                           ✅ How-to guide for using the system
├── agents/
│   ├── architect.md                   ✅ Complete (has context files + skills)
│   ├── grid-ops.md                    ✅ Complete (has context files + skills)
│   ├── construct-os.md                ⚠️  Missing: Context Files section
│   ├── debugger.md                    ⚠️  Missing: Context Files section
│   ├── deployer.md                    ⚠️  Missing: Context Files section
│   └── lorekeeper.md                  ⚠️  Missing: Context Files section
├── skills/
│   ├── typescript-patterns/SKILL.md   ✅ Complete
│   ├── terminal-aesthetic/SKILL.md    ✅ Complete
│   ├── construct-os-voice/SKILL.md    ✅ Complete
│   ├── faction-theming/SKILL.md       ✅ Complete
│   ├── offline-first/SKILL.md         ✅ Complete
│   └── supabase-integration/SKILL.md  ✅ Complete
└── workflows/
    ├── build-and-verify.md            ✅ Exists
    ├── deploy-to-vercel.md            ✅ Exists
    └── new-feature.md                 ✅ Exists

AGENTS.md (project root)              ⚠️  Old monolithic file — needs to become a redirect
```

---

## Gap Analysis

### 1. Agent Files — Missing Sections

Four agents are missing their `Context Files` section. This tells the AI what to read before working.

| Agent | Missing |
|-------|---------|
| `construct-os.md` | Context files (fallback content files, AI prompt sources) |
| `debugger.md` | Context files (tsconfig, vite.config, package.json, error logs) |
| `deployer.md` | Context files (vercel.json, .env, .gitignore, package.json) |
| `lorekeeper.md` | Context files (lore directory, faction data, world timeline) |

No agents have a **File Ownership** section — which directories/files each agent is allowed to create or modify. This prevents agents from stepping on each other.

### 2. Skills — Gaps

Six skills exist, but four skill domains are unrepresented:

| Missing Skill | Owner Agent(s) | What it covers |
|---------------|---------------|----------------|
| `lore-patterns` | LOREKEEPER | Lore document format, canon consistency rules, cross-reference system, faction timeline |
| `react-components` | ARCHITECT | Component architecture, page layout patterns, hook conventions, store-to-component binding |
| `testing-patterns` | DEBUGGER | Vitest setup, test file structure, mocking Supabase/localDB, testing offline/faction states |
| `devops-patterns` | DEPLOYER | Vercel config, env var setup, GitHub Actions, PWA/service worker compliance checklist |

### 3. Root `AGENTS.md`

The root `AGENTS.md` is the original monolithic file — all its content has already been distributed into `.agents/`. It should become a slim redirect so any AI tool that reads the project root still finds the agent system.

---

## Planned Work

### Phase 1 — Fix Existing Agents (complete the 4 incomplete agent files)

- [ ] Add `Context Files` section to `construct-os.md`
- [ ] Add `Context Files` section to `debugger.md`
- [ ] Add `Context Files` section to `deployer.md`
- [ ] Add `Context Files` section to `lorekeeper.md`
- [ ] Add `File Ownership` section to all 6 agent files

### Phase 2 — New Skill Files

- [ ] Create `.agents/skills/lore-patterns/SKILL.md`
- [ ] Create `.agents/skills/react-components/SKILL.md`
- [ ] Create `.agents/skills/testing-patterns/SKILL.md`
- [ ] Create `.agents/skills/devops-patterns/SKILL.md`
- [ ] Update `README.md` skills table with 4 new entries
- [ ] Add new skills to relevant agent `Relevant Skills` sections

### Phase 3 — Root AGENTS.md

- [ ] Replace root `AGENTS.md` content with a redirect stub pointing to `.agents/README.md`

### Phase 4 — README & GUIDE Updates

- [ ] Update `.agents/README.md` skills table after Phase 2
- [ ] Update `.agents/GUIDE.md` if new skill usage patterns emerge

---

## Skills Design Notes

### `lore-patterns` (for LOREKEEPER)
Should cover:
- The lore document format (Classification, Clearance Level, Filed By template)
- How to cross-reference other lore entries
- Canon rules: what is established fact vs unconfirmed
- Timeline structure for The Grid's history
- Elemental affinity definitions (FIRE, ICE, LIGHTNING, VOID, NATURE, CHRONO)
- Rank tier descriptions (INITIATE → SOVEREIGN)

### `react-components` (for ARCHITECT)
Should cover:
- Folder structure: `src/components/`, `src/pages/`, `src/hooks/`
- Which component directories exist and their purpose
- Page layout pattern (how pages connect to sidebar/nav)
- Custom hook conventions (prefix `use`, co-located with component)
- When to create a new store vs extend an existing one
- CSS file convention (component-level `.css` files, co-located)

### `testing-patterns` (for DEBUGGER)
Should cover:
- Vitest + React Testing Library setup
- How to mock `localforage` and Supabase client
- Test file naming: `ComponentName.test.tsx` co-located
- What to test: offline mode, faction-switching, empty/error states
- Build verification flow: `npm run build` → `npm run preview`

### `devops-patterns` (for DEPLOYER)
Should cover:
- Vercel project config (`vercel.json` if present, env var names)
- Environment variable names: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_ENDPOINT`
- `.gitignore` required entries
- GitHub → Vercel integration (branch → preview, main → production)
- PWA compliance checklist
- How to verify a production build locally before push

---

## Skill File Template

All skill files follow this structure:

```yaml
---
name: Skill Name
description: One-line description for README table
---

# Skill Name

## [Section]
[Content...]
```

---

## Agent File Ownership Map (proposed)

| Agent | Owns / Operates In |
|-------|--------------------|
| ARCHITECT | `src/components/`, `src/pages/`, `src/stores/`, `src/hooks/`, `src/types/`, `src/constants/`, `src/styles/`, `src/utils/` |
| GRID_OPS | `src/services/`, `supabase/`, `backend/`, `.env` |
| CONSTRUCT_OS | `src/services/fallback*`, AI prompt strings in service files |
| DEBUGGER | Read-only across all; writes test files (`*.test.tsx`) |
| DEPLOYER | `.github/`, `vercel.json`, `vite.config.ts`, `tsconfig*.json`, `package.json` |
| LOREKEEPER | `doc/lore/` (proposed), narrative string literals in source |

---

## Skill-to-Agent Matrix (after Phase 2)

| Skill | ARCHITECT | GRID_OPS | CONSTRUCT_OS | DEBUGGER | DEPLOYER | LOREKEEPER |
|-------|:---------:|:--------:|:------------:|:--------:|:--------:|:----------:|
| typescript-patterns | ✅ | ✅ | | ✅ | | |
| terminal-aesthetic | ✅ | | | | | |
| faction-theming | ✅ | | ✅ | | | ✅ |
| offline-first | ✅ | ✅ | | ✅ | ✅ | |
| supabase-integration | | ✅ | | | ✅ | |
| construct-os-voice | | | ✅ | | | ✅ |
| lore-patterns | | | | | | ✅ |
| react-components | ✅ | | | ✅ | | |
| testing-patterns | | | | ✅ | | |
| devops-patterns | | | | | ✅ | |
