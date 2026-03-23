# Lore Repository

This central repository stores the "Source of Truth" for the world history, mythology, NPC backgrounds, and faction dynamics of **The Construct** (Project-1).

## Entry Format
All lore entries should follow the **LOREKEEPER** standard to ensure consistency and facilitate AI cross-referencing.

```markdown
# [ENTRY TITLE]
**Classification:** [FACTION_INTEL | SECTOR_REPORT | HISTORICAL_RECORD | ANOMALY_LOG | NPC_DOSSIER]
**Clearance Level:** [INITIATE | OPERATIVE | SENTINEL | SOVEREIGN]
**Filed By:** [NPC designation or CONSTRUCT OS]

[Content...]

> CROSS-REFERENCE: [links to related lore entries]
> STATUS: [VERIFIED | UNCONFIRMED | REDACTED | CORRUPTED]
```

## Maintenance
1.  **Creation**: Use the `LOREKEEPER` agent to draft new entries.
2.  **Indexing**: Ensure this directory is synced to the **Project 1: The Construct** NotebookLM (ID: `df413add-177b-46f6-a54a-5001925cdff9`).
3.  **Cross-Ref**: Update links when new related entries are created.
