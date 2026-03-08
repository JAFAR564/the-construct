---
description: Standard workflow for implementing a new feature from planning to verification
---

# New Feature Implementation

1. **Read the PRD and relevant context files:**
   - `PRD.md` — product requirements
   - `src/types/index.ts` — existing type definitions
   - `src/styles/variables.css` — design tokens

2. **Analyze and plan.** Before writing code:
   - Identify which files need changes
   - Determine if new types are needed in `src/types/index.ts`
   - Check if existing stores (`useGameStore`, `useChatStore`, `useFactionStore`) need updates
   - Write a brief plan to `doc/` folder

3. **Update types first** if the feature introduces new data structures:
   - Edit `src/types/index.ts`
   - Run `npm run build` to verify types
// turbo

4. **Implement the feature:**
   - Create new components in `src/components/`
   - Create new pages in `src/pages/`
   - Use vanilla CSS (no Tailwind, no UI libraries)
   - Use `@/` import alias — never relative paths
   - Follow the terminal/CRT aesthetic

5. **Add route** if it's a new page:
   - Edit `src/App.tsx` to add the route
   - Edit `src/components/layout/MainLayout.tsx` if navigation is needed

6. **Update localDB fallback** if a new store was created:
   - Edit `src/services/localDB.ts`

7. **Build and verify:**
   - Run the `/build-and-verify` workflow
// turbo

8. **Test all three environment modes:**
   - Offline (no Supabase)
   - Supabase only
   - Full (Supabase + AI)
