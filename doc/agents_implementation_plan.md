# Agent Folder Restructuring — Implementation Plan

## Goal

Restructure the monolithic [AGENTS.md](file://wsl.localhost/Ubuntu/home/vortex/WebApp/AGENTS.md) (224 lines, 6 agents) into a proper `.agents/` folder structure with:
- Individual agent persona files
- Shared workflow definitions
- Skill files that extend agent capabilities

---

## Current State

Single file at project root:
- [AGENTS.md](file://wsl.localhost/Ubuntu/home/vortex/WebApp/AGENTS.md) — contains 6 agent definitions + workflow rules + handoff protocol + environment modes

| Agent | Role | Model |
|-------|------|-------|
| ARCHITECT | Lead Developer | Claude Opus 4 (Antigravity) |
| GRID_OPS | Backend & DB Engineer | GLM 5 (OpenCode) |
| CONSTRUCT_OS | Narrative & Content | Gemini/Claude |
| DEBUGGER | QA & Performance | Any |
| DEPLOYER | DevOps & Infra | Any |
| LOREKEEPER | Lore & Roleplay | Claude/Gemini |

---

## Proposed Folder Structure

```
.agents/
├── README.md                      # Overview + priority order + handoff protocol
├── workflows/
│   ├── build-and-verify.md        # npm run build verification workflow
│   ├── deploy-to-vercel.md        # Deployment workflow
│   └── new-feature.md             # Feature implementation workflow
│
├── skills/
│   ├── typescript-patterns/
│   │   └── SKILL.md               # TS patterns, type-safe coding rules
│   ├── supabase-integration/
│   │   └── SKILL.md               # Supabase connection, RLS, migrations
│   ├── construct-os-voice/
│   │   └── SKILL.md               # Narrative tone, JSON format, persona rules
│   ├── terminal-aesthetic/
│   │   └── SKILL.md               # CSS design system, glassmorphism, CRT rules
│   ├── offline-first/
│   │   └── SKILL.md               # localDB, IndexedDB, fallback patterns
│   └── faction-theming/
│       └── SKILL.md               # Faction color system, themes, CSS vars
│
└── agents/
    ├── architect.md               # ARCHITECT persona
    ├── grid-ops.md                # GRID_OPS persona
    ├── construct-os.md            # CONSTRUCT_OS persona
    ├── debugger.md                # DEBUGGER persona
    ├── deployer.md                # DEPLOYER persona
    └── lorekeeper.md              # LOREKEEPER persona
```

---

## What Goes Where

### `README.md` — Shared Rules
Content extracted from AGENTS.md:
- **Workflow Rules** (priority order, lines 197–205)
- **Handoff Protocol** (lines 207–212)
- **Environment Modes** table (lines 214–223)
- Quick reference table of all agents

### `agents/*.md` — Individual Personas
Each file gets the agent's section from AGENTS.md:
- Model, role, responsibilities
- Behavioral rules
- Context files
- Any special output formats (e.g., CONSTRUCT_OS JSON template, LOREKEEPER lore format)

### `workflows/*.md` — Reusable Workflows

Workflows use YAML frontmatter + step-by-step markdown. These can be invoked with slash commands:

| Workflow | Purpose | Steps |
|----------|---------|-------|
| `build-and-verify.md` | Run after any code change | `npm run build`, check errors, fix, re-run |
| `deploy-to-vercel.md` | Push to production | Git commit, push, `vercel --prod`, verify |
| `new-feature.md` | Standard feature dev flow | Read PRD → plan → implement → build → test |

### `skills/` — SKILL.md Files

> [!IMPORTANT]
> Skills are the key differentiator. They provide **reusable, domain-specific instructions** that any agent can reference when working on a relevant task. Each skill folder contains a `SKILL.md` with YAML frontmatter.

**Proposed Skills:**

#### 1. `typescript-patterns/SKILL.md`
- Strict mode rules, no `any`
- `@/` import alias enforcement
- Type-first development pattern
- Common type patterns used in this project (User, Quest, Sector, etc.)

#### 2. `supabase-integration/SKILL.md`
- Connection setup and env vars
- RLS policy patterns
- Migration workflow
- Offline fallback pattern (`localDB` → `supabaseDB`)

#### 3. `construct-os-voice/SKILL.md`
- Personality: cold, terse, technical, system-report style
- Addressing: "Architect" or designation
- Genre blending rules (sci-fi + fantasy + survival)
- JSON output format for fallback content
- Choice generation rules (2–4 choices)

#### 4. `terminal-aesthetic/SKILL.md`
- CSS custom properties reference ([variables.css](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/styles/variables.css))
- Glassmorphism pattern (backdrop-filter, borders, border-radius)
- No Tailwind, no component libraries
- [PremiumPage.css](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/styles/PremiumPage.css) class reference
- Font usage (Inter, JetBrains Mono, display font)

#### 5. `offline-first/SKILL.md`
- `localforage` + IndexedDB setup
- Three environment modes (Offline / Supabase / Full)
- Every feature must work offline
- Data sync patterns

#### 6. `faction-theming/SKILL.md`
- Three factions and their colors
- CSS custom properties: `--faction-active`, `--faction-primary`, etc.
- How to apply faction-aware styling
- Faction speech pattern reference (Technocrats=clinical, Keepers=mystical, Ironborn=direct)

---

## What Happens to [AGENTS.md](file://wsl.localhost/Ubuntu/home/vortex/WebApp/AGENTS.md)

After restructuring, the root [AGENTS.md](file://wsl.localhost/Ubuntu/home/vortex/WebApp/AGENTS.md) is **deleted**. Its content fully lives in:
- `.agents/README.md` (shared rules)
- `.agents/agents/*.md` (6 persona files)
- `.agents/workflows/*.md` (3 workflow files)
- `.agents/skills/*/SKILL.md` (6 skill files)

---

## Questions for Review

> [!NOTE]
> 1. **Agent placement:** The plan puts agents under `.agents/agents/`. Would you prefer them directly in `.agents/` root instead (e.g., `.agents/architect.md`)?
> 2. **Additional skills:** Are there other skill areas you'd like defined? For example: `combat-system`, `quest-generator`, `world-map`, `PWA-setup`?
> 3. **Workflow turbo annotations:** Would you like any workflows to have `// turbo` or `// turbo-all` annotations for auto-running commands?
> 4. **Any agents to add or remove?** Your current 6 cover dev, backend, narrative, QA, devops, and lore. Missing anything?
