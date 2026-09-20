# Universal Agent Guidelines & AI Brain Memory Protocol

> **CRITICAL PROTOCOL FOR ALL AI MODELS (Gemini, Claude, GPT, DeepSeek, Cursor, Antigravity, etc.)**:
> This project has a persistent, multi-tiered AI Brain Memory system located in [ai_brain/](file:///d:/PROJECTS/HEXAGON/ai_brain/).
> You MUST follow this protocol on every user turn and across model switches.

---

## 🚨 1. Turn Start Protocol (Mandatory First Action)

Before writing code, designing architecture, or giving advice:
1. **Read the AI Brain Memory Snapshot**:
   - Inspect [brain_summary.md](file:///d:/PROJECTS/HEXAGON/ai_brain/brain_summary.md).
   - This document gives you full context: current active task, goals, blockers, developer preferences, architectural decisions, and solved gotchas.
2. **Deep Memory Query (Optional / On-Demand)**:
   - If the user asks about a specific feature, bug, or topic, run:
     ```bash
     python ai_brain/brain.py recall "<topic or keywords>"
     ```
3. **Respect Established Context**:
   - Never override past architectural decisions or coding style guidelines recorded in the Brain without explicit user confirmation.

---

## 💾 2. Turn Finish & Decision Protocol (Mandatory Persistence)

Whenever you:
- Make an architectural or system decision
- Implement or modify a major component or database model
- Discover or fix a bug or gotcha
- Complete or pause a task

You **MUST** update the AI Brain Memory using the CLI:

### A. Record a New Memory
```bash
python ai_brain/brain.py remember "<Title>" "<Detailed Context & Solution>" --category [decision|architecture|preference|bugfix|task|insight] --importance [1-5] --tags "<comma,separated,tags>" --model "<Your Model Name>"
```

### B. Update Active Working State
```bash
python ai_brain/brain.py update-state --task "<Active Task>" --goals "<Next Goals>" --blockers "<Blockers if any>" --model "<Your Model Name>"
```

### C. Auto-Sync Git Changes
```bash
python ai_brain/brain.py sync
```

---

## 🛠️ Developer Profile & Style Rules
- **Stack**: React 19 + Vite + Tailwind CSS v3 (Frontend) | Node.js + Express + MongoDB (Backend).
- **Aesthetic**: Premium dark-mode tech aesthetic with glowing accents, glassmorphic cards, micro-animations, and responsive layout.
- **Code Quality**: Modular, zero placeholder stubs, complete error handling with informative JSON.
- **Tone**: Highly concise, direct, technical, and actionable.
