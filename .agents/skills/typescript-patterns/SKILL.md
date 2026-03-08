---
name: TypeScript Patterns
description: Strict TypeScript coding rules, import conventions, and type system patterns for The Construct
---

# TypeScript Patterns

## Strict Mode Rules

- **No `any` types** — ever. Find the real type or use generic constraints.
- **No `@ts-ignore`** or `@ts-expect-error` — fix the root cause.
- Enable `strict: true` in `tsconfig.json` (already configured).
- Always define return types for exported functions.

## Import Conventions

- Always use the `@/` path alias. Never use relative imports (`../`, `./`).
- Alias is configured in `tsconfig.app.json` and `vite.config.ts`:

```typescript
// ✅ Correct
import { useGameStore } from '@/stores/useGameStore';
import type { Quest, User } from '@/types';

// ❌ Wrong
import { useGameStore } from '../../stores/useGameStore';
```

## Type Definitions

All shared types live in `src/types/index.ts`. Key types:

| Type | Purpose |
|------|---------|
| `User` | Player profile, stats, skills, equipment, faction |
| `Quest` | Quest data with stages, choices, narrative, rewards |
| `Sector` | World map sector with terrain, POIs, NPCs, weather |
| `ChatChannel` / `ChannelMessage` | Faction hub messaging |
| `Equipment` / `Ability` | Gear and ability system |
| `Faction` | Faction enum and related types |

## Patterns

### State Management (Zustand)

```typescript
import { create } from 'zustand';

interface SomeStore {
  data: SomeType[];
  addItem: (item: SomeType) => void;
}

export const useSomeStore = create<SomeStore>((set) => ({
  data: [],
  addItem: (item) => set((state) => ({ data: [...state.data, item] })),
}));
```

### Component Pattern

```typescript
import React from 'react';
import type { SomeType } from '@/types';

interface Props {
  item: SomeType;
  onAction: (id: string) => void;
}

export const SomeComponent: React.FC<Props> = ({ item, onAction }) => {
  // ...
};
```

### Null Safety

Always handle `null`/`undefined` user state:

```typescript
const user = useGameStore(state => state.user);
if (!user) return null; // or loading state
```
