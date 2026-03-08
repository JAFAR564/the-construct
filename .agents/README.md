# The Construct — AI Agent Workspace

## Agents

| Agent | Role | Model | File |
|-------|------|-------|------|
| **ARCHITECT** | Lead Developer | Claude Opus 4 (Antigravity) | [architect.md](agents/architect.md) |
| **GRID_OPS** | Backend & DB Engineer | GLM 5 (OpenCode) | [grid-ops.md](agents/grid-ops.md) |
| **CONSTRUCT_OS** | Narrative & Content | Gemini/Claude | [construct-os.md](agents/construct-os.md) |
| **DEBUGGER** | QA & Performance | Any | [debugger.md](agents/debugger.md) |
| **DEPLOYER** | DevOps & Infrastructure | Any | [deployer.md](agents/deployer.md) |
| **LOREKEEPER** | Lore & Roleplay | Claude/Gemini | [lorekeeper.md](agents/lorekeeper.md) |

## Priority Order

1. **DEBUGGER** fixes must be applied BEFORE new features
2. **ARCHITECT** implements features from PRD
3. **GRID_OPS** handles backend changes
4. **CONSTRUCT_OS** writes content independently
5. **LOREKEEPER** creates lore and roleplay content independently
6. **DEPLOYER** deploys after all changes pass build

## Handoff Protocol

- Every agent must ensure `npm run build` passes before handing off
- Every agent must document what files were changed
- Breaking changes require updating `src/types/index.ts` first
- New pages require updating `src/App.tsx` routes
- New stores require updating `src/services/localDB.ts` fallback

## Environment Modes

The app operates in three modes based on environment variables:

| Mode | VITE_SUPABASE_URL | VITE_API_ENDPOINT | Behavior |
|------|-------------------|-------------------|----------|
| **Offline** | empty | empty | localDB + fallback content only |
| **Supabase** | set | empty | Postgres + fallback content |
| **Full** | set | set | Postgres + AI narrative |

All three modes must be functional at all times.

## Skills

Skills are reusable domain-specific instruction sets in `skills/`. Each contains a `SKILL.md` with YAML frontmatter. Any agent can reference relevant skills when working on a task.

| Skill | Domain |
|-------|--------|
| [typescript-patterns](skills/typescript-patterns/SKILL.md) | Type system, import rules, strict mode |
| [supabase-integration](skills/supabase-integration/SKILL.md) | DB, RLS, migrations, offline fallback |
| [construct-os-voice](skills/construct-os-voice/SKILL.md) | Narrative tone, JSON format, persona |
| [terminal-aesthetic](skills/terminal-aesthetic/SKILL.md) | CSS design system, glassmorphism |
| [offline-first](skills/offline-first/SKILL.md) | localDB, IndexedDB, sync patterns |
| [faction-theming](skills/faction-theming/SKILL.md) | Faction colors, CSS vars, speech |

## Workflows

Workflows are step-by-step procedures in `workflows/`. Invoke with slash commands.

| Workflow | Purpose |
|----------|---------|
| [/build-and-verify](workflows/build-and-verify.md) | Run after any code change |
| [/deploy-to-vercel](workflows/deploy-to-vercel.md) | Push to production |
| [/new-feature](workflows/new-feature.md) | Standard feature development |
