# Navigation & Routing Audit

## 1. Overview
The current routing system is built on **React Router v6** (`react-router-dom`), utilizing `BrowserRouter` and centralized route definitions in [src/App.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/App.tsx). 

## 2. Configuration Issues Discovered

### A. Fragmented Navigation State (Missing Links)
There are two completely separate navigation components in the application, and they are out of sync with each other:

1. **[src/components/layout/MainLayout.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/MainLayout.tsx)**  
   - **Type**: Global Bottom Navigation  
   - **Current Links**: `/terminal`, `/profile`, `/world`, `/quests`, `/faction`, `/codex`, `/config` 
   - **Issue**: **Missing `/ranks` (Leaderboard)**. Users relying on the bottom navigation cannot access the Leaderboard organically.

2. **[src/components/feed/FeedLayout.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/feed/FeedLayout.tsx)**
   - **Type**: Sidebar Navigation (rendered specifically inside the Terminal interface)
   - **Current Links**: `/terminal`, `/quests`, `/world`, `/faction`, `/profile`, `/ranks`, `/config`
   - **Issue**: **Missing `/codex` (Lore/Codex)**. Users relying on the sidebar cannot access the Codex organically.

### B. Routing Definitions & Role-Based Security
- **[src/App.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/App.tsx)**: Properly defines all 8 primary application routes, plus the 2 privileged dashboards (`/admin`, `/moderator`).
- **[src/components/auth/RequireRole.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/auth/RequireRole.tsx)**: Successfully intercepting unauthenticated or under-privileged users and enforcing a hard redirect to `/terminal`. No unauthorized bypasses were detected in the DOM hierarchy.
- **HUD Access**: The `[SYS_ADMIN]` and `[SYS_MOD]` links in the top `hud-header` correctly check `user.role` before rendering.

---

## Phase 2: Architecture Proposal

To remediate these configuration issues and standardize the user experience, I propose the following:

**1. Standardize Navigation Items**
We will update both [MainLayout.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/layout/MainLayout.tsx) and [FeedLayout.tsx](file://wsl.localhost/Ubuntu/home/vortex/WebApp/src/components/feed/FeedLayout.tsx) so that they contain the exact same 8 core routes:
- `/terminal` (FEED / TERM)
- `/profile` (PROFILE / ARCH)
- `/world` (WORLD / GRID)
- `/quests` (QUESTS / DIR)
- `/faction` (FACTION / FAC)
- **`/codex`** (LORE) -> *Add to FeedLayout*
- **`/ranks`** (RANKS) -> *Add to MainLayout*
- `/config` (CONFIG / SYS)

**2. Synchronize Icons**
Ensure both components use consistent iconography or labeling schemes for mental mapping, utilizing the `lucide-react` library or emojis as appropriate.

Please reply with your explicit approval (e.g., "approve") to proceed to **Phase 3: Implementation & Verification**.
