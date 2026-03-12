# Audit & Remediation — Walkthrough

## Summary

Performed a comprehensive static code audit of **The Construct** (React 19 + TypeScript 5.9 + Vite 7 + Zustand + Supabase). Found and fixed **8 bugs** and **2 code quality issues** across **6 files**.

---

## Bugs Fixed

### 🔴 Critical

| # | File | Bug | Impact |
|---|------|-----|--------|
| 1 | [BootGuard.tsx](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/BootGuard.tsx) | [setLoading(false)](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/stores/useGameStore.ts#149-150) never called when Supabase user exists but has no DB row | **Permanent blank screen** for new sign-ups |
| 2 | [supabaseDB.ts](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/supabaseDB.ts) | Trailing spaces in realtime channel name and filter | **Realtime subscriptions silently fail** |
| 4 | [useGameStore.ts](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/stores/useGameStore.ts) | [sendMessage](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/stores/useGameStore.ts#152-227) captures stale `messages` before user msg is added | **AI gets wrong context** — user's message missing from API call |

### 🟡 Moderate

| # | File | Bug | Impact |
|---|------|-----|--------|
| 3 | [useGameStore.ts](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/stores/useGameStore.ts) | [persistToDB](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/stores/useGameStore.ts#292-302) passes `user?.id` (possibly undefined) to save functions | Unintended localDB writes when user is null |
| 6 | [MainLayout.tsx](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/MainLayout.tsx) | `useEffect` depends on entire `user` object → infinite re-runs | Performance: constant Supabase re-subscription and interval resets |
| 7 | [MainLayout.tsx](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/MainLayout.tsx) | Missing `ambientVolume` in dependency array | Volume slider changes don't take effect until component remount |
| 8 | [client.ts](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/client.ts) | [isAvailable()](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/client.ts#49-52) ignores Supabase config | UI shows `[GRID: LOCAL]` even when Supabase edge functions are working |

### 🟢 Minor

| # | File | Bug | Impact |
|---|------|-----|--------|
| 5 | [localDB.ts](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/localDB.ts) | `any` type without eslint-disable | TypeScript strict mode violation |

---

## Code Quality Improvements

| File | Change |
|------|--------|
| [main.tsx](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/main.tsx) | Removed manual `sw.js` registration (VitePWA's `registerType: 'autoUpdate'` handles this). The manual code was trying to register a non-existent `/sw.js`, causing a console error on every page load. |
| [localDB.ts](file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/localDB.ts) | `Record<string, any>` → `Record<string, unknown>` for type safety |

---

## Diffs

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/BootGuard.tsx)

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/supabaseDB.ts)

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/stores/useGameStore.ts)

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/MainLayout.tsx)

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/client.ts)

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/main.tsx)

render_diffs(file:///wsl.localhost/Ubuntu/home/vortex/WebApp/src/services/localDB.ts)

---

## Deferred Items

| Phase | Reason |
|-------|--------|
| **Phase 2 — Build & Lint** | Need terminal access to run `npm run build` and `npm run lint` in WSL. May reveal additional TS/ESLint errors. |
| **Phase 5 — UI/UX Polish** | Requires running the dev server and visually inspecting pages at different viewports in the browser. |

## Next Steps

1. **Run `npm run build`** in your WSL terminal — verify zero errors after these fixes.
2. **Run `npm run lint`** — if any new errors appear, share them and I'll fix immediately.
3. **Run `npm run dev`** and test the app in the browser to confirm all pages load correctly.
4. Once we have terminal access sorted, I can proceed with Phase 2 and Phase 5.
