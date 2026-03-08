---
name: Offline First
description: LocalDB patterns, IndexedDB usage, and offline fallback strategies
---

# Offline First

## Philosophy

The Construct must work fully offline. Every feature must:
1. **Work without Supabase** — use `localDB` (localforage/IndexedDB)
2. **Work without AI proxy** — use fallback narratives
3. **Gracefully degrade** — never show errors for missing network

## localforage Setup

The app uses `localforage` (IndexedDB wrapper). See `src/services/localDB.ts`.

```typescript
import localforage from 'localforage';

// Configure
localforage.config({
  name: 'the-construct',
  storeName: 'game_data',
});

// Basic operations
await localforage.setItem('user', userData);
const user = await localforage.getItem<User>('user');
await localforage.removeItem('user');
```

## Data Persistence Pattern

Every Zustand store should persist to localforage:

```typescript
// In the store
const useMyStore = create<MyStore>((set, get) => ({
  data: [],
  
  save: async () => {
    await localforage.setItem('my_data', get().data);
  },
  
  load: async () => {
    const data = await localforage.getItem<MyData[]>('my_data');
    if (data) set({ data });
  },
}));
```

## Three Environment Modes

| Mode | VITE_SUPABASE_URL | VITE_API_ENDPOINT | Behavior |
|------|-------------------|-------------------|----------|
| **Offline** | empty | empty | localDB + fallback content |
| **Supabase** | set | empty | Postgres + fallback content |
| **Full** | set | set | Postgres + AI narrative |

## Testing Offline Mode

1. Remove or empty `VITE_SUPABASE_URL` in `.env`
2. Run `npm run dev`
3. Verify all pages load with local data
4. Verify new user onboarding works
5. Verify quests, map, faction hub all function

## Export/Import

The app supports exporting all local data as JSON and importing it back:

```typescript
// Export
const data = await localDB.exportSave();
// Returns JSON string of all stored data

// Import
await localDB.importSave(jsonString);
// Overwrites all local data
```
