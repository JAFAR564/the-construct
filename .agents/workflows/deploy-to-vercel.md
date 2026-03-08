---
description: Deploy the application to Vercel (preview or production)
---

# Deploy to Vercel

1. Ensure the build passes locally first. Run the `/build-and-verify` workflow.

2. Stage all changes:
```bash
git add -A
```

3. Commit with a descriptive message:
```bash
git commit -m "description of changes"
```

4. Push to the remote repository:
```bash
git push origin main
```

5. For a **preview** deployment:
```bash
vercel
```

6. For a **production** deployment:
```bash
vercel --prod
```

7. Verify the deployment URL loads correctly. Check:
   - All pages render without errors
   - Faction themes switch correctly
   - Offline mode still works (disconnect network, reload)
   - Environment variables are set in Vercel dashboard
