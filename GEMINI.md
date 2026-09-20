# Gemini Model Instructions — AI Brain Memory Redirection

> **MANDATORY FOR GEMINI / ANTIGRAVITY**:
> You are connected to the persistent AI Brain Memory system in [ai_brain/](file:///d:/PROJECTS/HEXAGON/ai_brain/).
> Always maintain memory continuity across sessions and model switches.

---

## 🧠 Brain Memory Directive

1. **Step 1 — Consult Memory Snapshot**:
   At the start of every session or when responding to technical requests, read [brain_summary.md](file:///d:/PROJECTS/HEXAGON/ai_brain/brain_summary.md) to recall project context, developer preferences, and current working state.

2. **Step 2 — Deep Search (When Needed)**:
   Use the tool `run_command` with:
   ```bash
   python ai_brain/brain.py recall "<search term>"
   ```
   to find specific past decisions, bugfixes, or technical patterns.

3. **Step 3 — Persist New Information**:
   Whenever you make significant architectural progress, solve a tricky bug, or conclude a task, invoke:
   ```bash
   python ai_brain/brain.py remember "<Title>" "<Context>" --category [decision|architecture|bugfix|preference|task] --importance [1-5] --tags "<tags>" --model "Gemini"
   ```
   and update working state:
   ```bash
   python ai_brain/brain.py update-state --task "<Current Task>" --goals "<Next Goals>" --model "Gemini"
   ```

4. **Step 4 — Follow Developer Style Guidelines**:
   - Clean, modular MERN architecture.
   - Dark-mode-first aesthetic with Tailwind CSS v3.
   - Full functional code with zero stub placeholders.
