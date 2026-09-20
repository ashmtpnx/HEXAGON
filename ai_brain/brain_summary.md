# 🧠 AI Brain Memory Snapshot — HEXAGON
> **Status**: ACTIVE | **Total Memories**: 12 | **Last Compiled**: 2026-09-20 12:04:58
> **Universal Model Protocol**: *Any AI model interacting with this codebase MUST read and adhere to this memory snapshot before taking action.*

---

## ⚡ Current Working State
- **Active Task**: Fix application submission API routes
- **Last Updating Model**: `Gemini`
- **Blockers / Gotchas**: None
- **Active Goals & Next Steps**:
Commit & push application route fixes to GitHub
- **Working Notes**: Git Branch: main
Recent Commits:
c2f4c66 fix: add GET /api/match/me and GET /api/match/user/:userId routes for scheme matching
84570e6 fix: add demo user accounts to seedData and auto-seed on server startup
8aaad13 feat: redesign UI using Cleopatra minimal template system
Modified Files (2 total): M ai_brain/brain.db, M ai_brain/brain_summary.md

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
### 🔹 Cleopatra Minimal UI Overhaul `[imp: 5/5]`
Transformed HEXAGON frontend using Cleopatra design template variables, clean grid patterns, custom .cleo-card, .cleo-btn, .cleo-input, .cleo-badge components, removing generic Tailwind appearance.
*Tags*: `ui,cleopatra,design,frontend`

### 🔹 Government Official Light-Theme UI & Core Redesign `[imp: 5/5]`
Redesigned frontend UI from dark glassmorphic to minimal, clean, professional official Indian government portal aesthetic (Navy #0A2540, Saffron #E65100, Green #2E7D32). Updated Navbar, StatusBadge, Timeline, ProgressBar, LandingPage, Login, Dashboard, AdminDashboard, MatchResults, ApplicationDetail, AssistedMode, index.css, plus added AI Brain memory system.
*Tags*: `ui,theme,design,frontend,governance`

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
- **Fix Application Submission & Route Aliases**: Added /apply, /my-applications, PUT /:id/status route handlers in server/routes/applications.js and added applicationNumber virtual to Application schema.
- **Fix Scheme Matching Routes GET /api/match/me**: Added GET /api/match/me and GET /api/match/user/:userId endpoints in server/routes/match.js, added default 30 for age in User schema, ensuring matching engine calculates entitlements for demo applicants.
- **Fix Demo Accounts & Auto-Seeding**: Added applicant@example.com, ngo@example.com, admin@example.com demo users to seedData.js and added auto-seeding on server start plus /api/auth/seed endpoint.
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
