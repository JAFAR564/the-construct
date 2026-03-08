# The Construct — Project Instructions

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

## Code Standards

- TypeScript strict mode — no `any` types
- `@/` import alias — never relative paths
- Vanilla CSS only — no Tailwind, no UI component libraries
- Terminal/CRT aesthetic for all components
- Offline-first: every feature must work without a backend

## Skills

Domain-specific instruction sets are available in `.agents/skills/`:

| Skill | Domain |
|-------|--------|
| typescript-patterns | Type system, import rules, strict mode |
| supabase-integration | DB, RLS, migrations, offline fallback |
| construct-os-voice | Narrative tone, JSON format, persona |
| terminal-aesthetic | CSS design system, glassmorphism |
| offline-first | localDB, IndexedDB, sync patterns |
| faction-theming | Faction colors, CSS vars, speech |
