# How to Use Agents, Skills & Workflows

This guide explains how the `.agents/` system works in The Construct workspace and how to get the most out of it across different AI tools.

---

## Quick Reference

| What | Where | How to invoke |
|------|-------|---------------|
| Agent personas | `.agents/agents/*.md` | Mention the agent role in your prompt |
| Skills | `.agents/skills/*/SKILL.md` | Auto-loaded by Antigravity; paste into other tools |
| Workflows | `.agents/workflows/*.md` | Use `/slash-command` in Antigravity |

---

## 1. Agent Personas

Each `.md` file in `.agents/agents/` defines an AI persona with a specific role, behavioral rules, and context files. You have 6 agents:

| Agent | File | Best for |
|-------|------|----------|
| **ARCHITECT** | `architect.md` | New features, components, refactoring |
| **GRID_OPS** | `grid-ops.md` | Supabase, APIs, database work |
| **CONSTRUCT_OS** | `construct-os.md` | Writing in-game narrative content |
| **DEBUGGER** | `debugger.md` | Fixing bugs, build errors, performance |
| **DEPLOYER** | `deployer.md` | Deployment, CI/CD, Vercel |
| **LOREKEEPER** | `lorekeeper.md` | World-building, faction lore, NPC writing |

### How to use with Antigravity (Claude)

Antigravity automatically reads `.agents/` files. Just work naturally — it already knows about your agents, skills, and workflows. To invoke a specific persona style, mention it:

> "Acting as the DEBUGGER agent, fix this build error..."
> "Using the LOREKEEPER persona, write lore for Sector 12..."

### How to use with other AI tools (ChatGPT, Gemini, etc.)

1. Open the relevant agent `.md` file
2. Copy-paste the contents into your system prompt or first message
3. Add the task after it

**Example prompt for ChatGPT:**
```
[paste contents of .agents/agents/construct-os.md]

Now write a greeting message for a new Technocrat player entering the Terminal.
```

---

## 2. Skills

Skills are domain-specific instruction sets in `.agents/skills/*/SKILL.md`. They contain reusable knowledge that any agent can reference.

| Skill | Folder | Teaches the AI about... |
|-------|--------|------------------------|
| **TypeScript Patterns** | `typescript-patterns/` | Strict types, imports, Zustand patterns |
| **Supabase Integration** | `supabase-integration/` | DB setup, RLS, offline fallback |
| **CONSTRUCT OS Voice** | `construct-os-voice/` | Narrative tone, JSON format, persona |
| **Terminal Aesthetic** | `terminal-aesthetic/` | CSS design system, glassmorphism |
| **Offline First** | `offline-first/` | localDB, IndexedDB, 3 env modes |
| **Faction Theming** | `faction-theming/` | Faction colors, CSS vars, speech |

### How skills work in Antigravity

Antigravity automatically discovers skills from the `.agents/skills/` directory. When a task is relevant to a skill, Antigravity reads the `SKILL.md` before proceeding. You can also explicitly request it:

> "Read the terminal-aesthetic skill before redesigning this component."

### How to use skills in other tools

1. Open the relevant `SKILL.md`
2. Paste it into your prompt as context
3. The AI will follow the rules and patterns defined in the skill

**Example:** Before asking any AI to write CSS for your app, paste the `terminal-aesthetic/SKILL.md` so it knows your design system.

### Combining skills

For complex tasks, combine multiple skills:

| Task | Skills to combine |
|------|-------------------|
| New React component | `typescript-patterns` + `terminal-aesthetic` + `faction-theming` |
| Database migration | `supabase-integration` + `offline-first` |
| Quest content | `construct-os-voice` + `faction-theming` |
| Bug fixing | `typescript-patterns` + `offline-first` |

---

## 3. Workflows

Workflows are step-by-step procedures in `.agents/workflows/`. In Antigravity, invoke them with slash commands.

| Command | Workflow | When to use |
|---------|----------|-------------|
| `/build-and-verify` | Build & test | After any code change |
| `/deploy-to-vercel` | Deploy | Ready to ship |
| `/new-feature` | Feature dev | Starting new feature work |

### Using workflows

**In Antigravity:** Just type the slash command:
```
/build-and-verify
```

**In other tools:** Open the workflow `.md` file and follow the steps manually, or paste them into the AI tool as instructions.

### Turbo annotations

Some workflow steps have `// turbo` or `// turbo-all` annotations. This means Antigravity will auto-run those terminal commands without asking for confirmation.

- `// turbo` — auto-run the next step only
- `// turbo-all` — auto-run ALL steps in the workflow

---

## 4. Adding New Agents, Skills, or Workflows

### New Agent
Create `.agents/agents/your-agent.md` with:
- Model and role
- Responsibilities
- Behavioral rules
- Context files to read
- Relevant skills (links)

### New Skill
Create `.agents/skills/your-skill/SKILL.md` with YAML frontmatter:
```yaml
---
name: Your Skill Name
description: One-line description
---
# Your Skill Name
[Instructions, patterns, examples...]
```

### New Workflow
Create `.agents/workflows/your-workflow.md` with YAML frontmatter:
```yaml
---
description: What this workflow does
---
# Steps
1. First step...
2. Second step...
```

---

## 5. Best Practices

1. **Always specify the agent** when switching contexts (dev → lore → debugging)
2. **Stack skills** for complex tasks — more context = better results
3. **Run `/build-and-verify`** after every code change
4. **Keep skills updated** — when you change patterns, update the skill file
5. **Each agent reads its own context files** — those files are listed in the agent persona so the AI knows what to read before working
