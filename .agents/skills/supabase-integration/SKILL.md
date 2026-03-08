---
name: Supabase Integration
description: Supabase connection, Row Level Security, migrations, and offline fallback patterns
---

# Supabase Integration

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app checks `isSupabaseConfigured` before making any Supabase calls. If not configured, it falls back to `localDB`.

## Connection Setup

See `src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;
```

## Row Level Security (RLS)

**Every new table MUST have RLS enabled.** Standard patterns:

```sql
-- Enable RLS
ALTER TABLE some_table ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users manage own data" ON some_table
  FOR ALL USING (auth.uid() = user_id);

-- Public read access
CREATE POLICY "Public read" ON some_table
  FOR SELECT USING (true);
```

## Offline Fallback Pattern

Every data access function must work without Supabase:

```typescript
export async function getData(userId: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('table').select('*').eq('user_id', userId);
    if (!error && data) return data;
  }
  // Fallback to local storage
  return localDB.getData(userId);
}
```

## Schema Reference

See `supabase/schema.sql` for the current database design.

## Migration Workflow

1. Edit `supabase/schema.sql`
2. Run migration via Supabase CLI or dashboard
3. Update `src/services/supabaseDB.ts` to match
4. Ensure `src/services/localDB.ts` fallback handles the same data shape
5. Test in all 3 environment modes
