---
name: ai-brain-memory
description: Persistent multi-tiered AI Brain Memory manager. Use to recall past architectural decisions, user preferences, bug fixes, working state, and to persist new memories across model switches.
---

# AI Brain Memory Skill

This skill provides persistent, cross-model memory for the workspace using the local engine in `ai_brain/brain.py`.

## When to Use

- **Start of Complex Tasks**: Recall prior architectural decisions or past solutions related to the current task.
- **Checking Project State**: View active goals, blockers, and recent changes.
- **Completing Major Changes**: Record new decisions, solutions to tricky bugs, or user preferences.
- **Model Hand-off**: When switching models or concluding a session, update working state so the next model seamlessly continues.

## Commands

### 1. Recall Memories
Search the brain using full-text BM25 search across titles, contents, and tags:
```bash
python ai_brain/brain.py recall "<search term or question>" --limit 5
```

### 2. Record a New Memory
Save a crucial decision, architecture rule, bug fix, or user preference:
```bash
python ai_brain/brain.py remember "<Title>" "<Detailed Content>" --category <decision|architecture|preference|bugfix|task|insight> --importance <1-5> --tags "<comma_separated_tags>"
```

### 3. Update Working State
Keep track of what's currently in progress:
```bash
python ai_brain/brain.py update-state --task "<Active Task>" --goals "<Next Steps>" --blockers "<Blockers if any>"
```

### 4. Inspect Summary Snapshot
Directly view the compiled markdown snapshot:
[brain_summary.md](file:///d:/PROJECTS/HEXAGON/ai_brain/brain_summary.md)
