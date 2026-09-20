# 🧠 AI Brain Memory Snapshot — HEXAGON
> **Status**: ACTIVE | **Total Memories**: 7 | **Last Compiled**: 2026-09-20 10:46:04
> **Universal Model Protocol**: *Any AI model interacting with this codebase MUST read and adhere to this memory snapshot before taking action.*

---

## ⚡ Current Working State
- **Active Task**: AI Brain Memory Updation Program Setup & Cross-Model Redirection
- **Last Updating Model**: `GitSync`
- **Blockers / Gotchas**: None
- **Active Goals & Next Steps**:
- Setup universal cross-model redirection files (AGENTS.md, GEMINI.md, CLAUDE.md)
- Build modern glassmorphic web dashboard
- Install git sync hook
- Verify end-to-end
- **Working Notes**: Git Branch: main
Recent Commits:
fc7235c Install dev dependencies for client build
a6ece94 Remove tsc from build script to avoid OOM on Render
aa6cd58 Add NODE_VERSION to render.yaml
Modified Files (10 total): M client/src/components/Navbar.jsx, M client/src/index.css, M client/src/pages/AdminDashboard.jsx, M client/src/pages/LandingPage.jsx, M server/models/Scheme.js, M server/routes/analytics.js, M server/server.js, ?? ai_brain/, ?? server/models/Notification.js, ?? server/routes/notifications.js

---

## 👤 Developer Profile & Preferred Stack
- **Developer**: Ashmeet
- **Frontend**: React 19 + Vite + Tailwind CSS v3 (dark-mode-first premium tech aesthetics)
- **Backend**: Node.js + Express + MongoDB/Mongoose with RESTful architecture
- **Core Code Rules**:
  - Always write modular, self-contained components and controllers
  - Ensure proper error handling with descriptive JSON responses
  - Avoid placeholders or stub functions — deliver working implementations
  - Never destroy existing working functionality when refactoring
  - Keep UI responsive, accessible, and visually stunning with micro-animations

---

## 🏛️ System Architecture & Stack Knowledge
### 🔹 HEXAGON System Architecture & Core Stack `[imp: 5/5]`
HEXAGON is a Unified Scheme Access, Verification, Rights-Awareness & Grievance Platform (SIH Problem Statement #92). Stack consists of: Frontend: React + Vite + Tailwind CSS v3 with custom dark-mode theme. Backend: Node.js + Express REST API with MongoDB/Mongoose. Key modules: Single-window matching engine, Duplicate-claim fingerprinting, VLE Assisted Mode, in-context grievance threads, and Rights Awareness panel.
*Tags*: `architecture,tech-stack,mern,vite,sih92,tailwind`

### 🔹 Universal Cross-Model Memory Protocol `[imp: 5/5]`
Any AI model (Gemini, Claude, GPT-4, DeepSeek, Cursor) working in this workspace must read ai_brain/brain_summary.md before responding. All key technical decisions, bug fixes, architecture changes, and active tasks must be committed to the brain via 'python ai_brain/brain.py remember' to ensure continuity across model switches.
*Tags*: `cross-model,ai-brain,memory-protocol,rules`

## ⚖️ Key Technical & Product Decisions
- **Cross-Model Hand-off Protocol Verified**: Successfully validated that any AI model can query, remember, and update brain state seamlessly without data loss. *(Tags: cross-model,validation,verified)*
- **Authentication Architecture for Demo & Hackathon**: Role-based JWT authentication with pre-seeded demo accounts for quick role-switching between Applicant (citizen), VLE Operator, and Ministry Official. Avoid external SMS/OTP dependencies in local/demo mode for guaranteed reliability. *(Tags: auth,jwt,demo,roles,security)*

---

## 🐛 Known Gotchas & Solved Bugs
- **PowerShell & Windows Path Handling Gotcha**: When executing commands in pwsh on Windows, use Get-ChildItem instead of 'ls -la'. Use forward slashes in markdown file links (file:///d:/...). Always wrap JSON or complex arguments properly in CLI calls.

---

## 🔄 Redirection Instructions for Any Model

When you (any AI model) receive a prompt in this workspace:
1. **Recall**: Run `python ai_brain/brain.py recall "<topic>"` to retrieve specific deep memories if needed.
2. **Adhere**: Never overwrite decisions or styles established in this memory snapshot without user confirmation.
3. **Persist**: When you make a new decision, write new architectural components, or solve a bug, run:
   ```bash
   python ai_brain/brain.py remember "<Title>" "<Details>" --category [decision|architecture|bugfix|preference|task] --importance [1-5] --tags "<t1,t2>"
   ```
4. **State**: When finishing or pausing a task, update the working state:
   ```bash
   python ai_brain/brain.py update-state --task "<Current Task>" --goals "<Next Goals>" --model "<Your Model Name>"
   ```
