# Claude Model Instructions — AI Brain Memory Redirection

> **MANDATORY FOR CLAUDE (Claude Code, Sonnet, Opus, Haiku)**:
> This repository uses a central AI Brain Memory in `ai_brain/`.
> You must synchronize with and contribute to this brain on every turn.

---

## 🎯 Protocol for Claude:

1. **Before Action**:
   - Always read `ai_brain/brain_summary.md` first.
   - For specific domain queries, execute:
     ```bash
     python ai_brain/brain.py recall "<topic>"
     ```
2. **After Action**:
   - Persist any architectural choice, bug resolution, or user preference:
     ```bash
     python ai_brain/brain.py remember "<Title>" "<Details>" --category [decision|architecture|bugfix|preference|task] --importance [1-5] --tags "<tags>" --model "Claude"
     ```
   - Update working state before concluding:
     ```bash
     python ai_brain/brain.py update-state --task "<Task>" --goals "<Goals>" --model "Claude"
     ```
3. **Coding Standards**:
   - Respect developer rules in `ai_brain/user_profile.json`.
   - Complete, production-ready code with error handling.
