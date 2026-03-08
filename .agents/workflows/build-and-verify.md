---
description: Build the project and verify there are no TypeScript or bundler errors
---

# Build and Verify

// turbo-all

1. Run the TypeScript compiler and Vite bundler:
```bash
npm run build
```

2. If there are TypeScript errors, read the error output carefully. Fix the ROOT CAUSE — never use `@ts-ignore` or `any`.

3. After fixes, run the build again:
```bash
npm run build
```

4. Repeat steps 2–3 until the build passes with zero errors.

5. If the build passes, optionally start the dev server to verify visually:
```bash
npm run dev
```
