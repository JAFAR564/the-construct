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

## 1. Agent Personas (Vibe Coding Enabled)

Each persona is optimized for its model's strengths. 

| Agent | File | Model | Best for |
|-------|------|-------|----------|
| **ARCHITECT** | `architect.md` | Gemini 3.1 Pro | New features, planning, architecture |
| **SPRINTER** | `sprinter.md` | Gemini 3 Flash | Quick fixes, unit tests, iteration |
| **AUDITOR** | `auditor.md` | Claude 4.6 | Security, edge cases, final review |
| **GRID_OPS** | `grid-ops.md` | - | Supabase, APIs, database work |
| **CONSTRUCT_OS** | `construct-os.md` | - | Writing in-game narrative content |
| **LOREKEEPER** | `lorekeeper.md` | - | World-building, faction lore, NPC writing |

### How to use with Antigravity (Claude)

To invoke a specific persona style, mention it:

> "Acting as the ARCHITECT agent, plan this migration..."
> "Use the SPRINTER persona to fix this type error."

---

## 2. Skills

Skills are domain-specific instruction sets in `.agents/skills/*/SKILL.md`. 

| Skill | Folder | Teaches the AI about... |
|-------|--------|------------------------|
| **TypeScript Patterns** | `typescript-patterns/` | Strict types, imports, Zustand patterns |
| **Supabase Integration** | `supabase-integration/` | DB setup, RLS, offline fallback |
| **Terminal Aesthetic** | `terminal-aesthetic/` | CSS design system, glassmorphism |
| **Offline First** | `offline-first/` | localDB, IndexedDB, 3 env modes |

---

## 3. Workflows

Workflows are invoked with slash commands.

| Command | Workflow | When to use |
|---------|----------|-------------|
| `/build-and-verify` | Build & test | After any code change |
| `/generate-handover` | Vibe-State | Before starting a fresh session |

---

## 4. Best Practices

1. **Stack skills** for complex tasks — more context = better results.
2. **Context Pinning**: "Pin" only the files you are currently editing.
3. **Session Reset**: Use `/generate-handover` and start a new session every 20-30 messages to avoid context decay.
