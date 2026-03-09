---
description: Troubleshooting deployment crashes and Vite environment variable issues
name: Deployment Troubleshooting
---

# Deployment Troubleshooting

When deploying Vite applications to platforms like Vercel or Netlify, you may encounter edge cases where the app compiles successfully but crashes completely on client load (resulting in a blank screen).

## 1. Module Evaluation Errors from Environment Variables

**Symptom:** The screen is completely blank. The React tree never renders. The browser console shows an uncaught exception originating from a third-party SDK like Supabase.
**Cause:** Third-party SDKs often perform immediate validation when their client instances are created using `export const client = createClient(ENV_VAR)`. If `ENV_VAR` is `undefined` or `''` on the deployed environment (e.g., Preview branches where secrets aren't shared), the SDK constructor throws an error. Because this happens at module evaluation time, the entire JS bundle execution halts before React mounts.

### The Fix

*Never initialize third-party SDKs unconditionally with environment variables that might be missing.*

Instead of this:
```typescript
const url = import.meta.env.VITE_URL || '';
// This throws immediately during module load if url is empty
export const client = createClient(url); 
```

Use conditional initialization:
```typescript
const url = import.meta.env.VITE_URL || '';
export const isConfigured = url.length > 0;

// Initialize conditionally, use `any` cast to avoid strict typing errors downstream
// Any UI component using this must check `if (isConfigured)` first
export const client = isConfigured ? createClient(url) : null as any;
```

## 2. Empty State Validation

Always ensure your deployment troubleshooting includes:
1. Loading the app with a fresh Incognito profile.
2. Loading without any environment variables supplied to the build.
3. Checking for `window` or `document` references in Code that runs during SSR (if SSR is eventually implemented).

## 3. Error Boundaries

Remember that standard React `<ErrorBoundary>` components **cannot catch** errors that happen during top-level module evaluation, because React hasn't started rendering the tree yet. If an Error Boundary isn't catching the crash, look at your top-level module imports and SDK initializations.
