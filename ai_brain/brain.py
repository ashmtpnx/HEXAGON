#!/usr/bin/env python3
"""
AI Brain Memory Updation Engine (Universal Cross-Model Memory System)
Author: Ashmeet (HEXAGON)
Description:
    Persistent, multi-tiered SQLite & FTS5 memory manager, snapshot compiler,
    universal model redirector, and local visual dashboard server.
"""

import os
import sys
import json
import sqlite3
import datetime
import argparse
import subprocess
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Ensure UTF-8 output on Windows terminals
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Base Directories
BRAIN_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = BRAIN_DIR.parent
DB_PATH = BRAIN_DIR / "brain.db"
SUMMARY_PATH = BRAIN_DIR / "brain_summary.md"
PROFILE_PATH = BRAIN_DIR / "user_profile.json"
SEED_PATH = BRAIN_DIR / "seed_memories.json"
WEB_DIR = BRAIN_DIR / "web"



def get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    con = get_db()
    with con:
        # 1. Main memories table
        con.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT DEFAULT '',
                importance INTEGER DEFAULT 3,
                model TEXT DEFAULT 'System',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # 2. FTS5 full-text search table
        try:
            con.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
                    title,
                    content,
                    tags,
                    category,
                    content='memories',
                    content_rowid='id'
                )
            """)

            # Triggers to keep FTS index synchronized
            con.execute("""
                CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
                    INSERT INTO memories_fts(rowid, title, content, tags, category)
                    VALUES (new.id, new.title, new.content, new.tags, new.category);
                END;
            """)
            con.execute("""
                CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
                    INSERT INTO memories_fts(memories_fts, rowid, title, content, tags, category)
                    VALUES ('delete', old.id, old.title, old.content, old.tags, old.category);
                END;
            """)
            con.execute("""
                CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
                    INSERT INTO memories_fts(memories_fts, rowid, title, content, tags, category)
                    VALUES ('delete', old.id, old.title, old.content, old.tags, old.category);
                    INSERT INTO memories_fts(rowid, title, content, tags, category)
                    VALUES (new.id, new.title, new.content, new.tags, new.category);
                END;
            """)
        except sqlite3.OperationalError as e:
            # Fallback if FTS5 not compiled in some environments
            pass

        # 3. Working state table
        con.execute("""
            CREATE TABLE IF NOT EXISTS working_state (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # 4. History log
        con.execute("""
            CREATE TABLE IF NOT EXISTS history_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                details TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)

        # Initialize default working state keys if missing
        default_state = {
            "active_task": "Full-stack development of HEXAGON & AI Brain Memory System",
            "active_goals": "- Keep AI Brain Memory in sync across model switches\n- Refine HEXAGON MERN features\n- Maintain clean architecture",
            "blockers": "None",
            "notes": "Brain Memory active and listening. Cross-model rules enabled.",
            "last_model": "System"
        }
        for k, v in default_state.items():
            con.execute("""
                INSERT OR IGNORE INTO working_state (key, value, updated_at)
                VALUES (?, ?, ?)
            """, (k, v, get_timestamp()))

    con.close()


def remember(title, content, category="general", importance=3, tags="", model="Unknown"):
    init_db()
    ts = get_timestamp()
    con = get_db()
    with con:
        cur = con.execute("""
            INSERT INTO memories (category, title, content, tags, importance, model, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (category.lower(), title, content, tags, int(importance), model, ts, ts))
        mem_id = cur.lastrowid
        con.execute("""
            INSERT INTO history_log (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("REMEMBER", f"Added memory #{mem_id}: {title} ({category})", ts))

    con.close()
    compile_summary()
    return mem_id


def update_memory(mem_id, title=None, content=None, category=None, importance=None, tags=None, model=None):
    init_db()
    con = get_db()
    ts = get_timestamp()
    fields = []
    values = []

    if title is not None:
        fields.append("title = ?")
        values.append(title)
    if content is not None:
        fields.append("content = ?")
        values.append(content)
    if category is not None:
        fields.append("category = ?")
        values.append(category.lower())
    if importance is not None:
        fields.append("importance = ?")
        values.append(int(importance))
    if tags is not None:
        fields.append("tags = ?")
        values.append(tags)
    if model is not None:
        fields.append("model = ?")
        values.append(model)

    if not fields:
        con.close()
        return False

    fields.append("updated_at = ?")
    values.append(ts)
    values.append(mem_id)

    with con:
        con.execute(f"UPDATE memories SET {', '.join(fields)} WHERE id = ?", values)
        con.execute("""
            INSERT INTO history_log (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("UPDATE", f"Updated memory #{mem_id}", ts))

    con.close()
    compile_summary()
    return True


def delete_memory(mem_id):
    init_db()
    con = get_db()
    ts = get_timestamp()
    with con:
        con.execute("DELETE FROM memories WHERE id = ?", (mem_id,))
        con.execute("""
            INSERT INTO history_log (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("DELETE", f"Deleted memory #{mem_id}", ts))
    con.close()
    compile_summary()
    return True


def recall(query, limit=5, category=None):
    init_db()
    con = get_db()
    results = []

    # Clean query for FTS5
    clean_q = "".join(c for c in query if c.isalnum() or c in " _-").strip()

    # Attempt FTS5 query with BM25 score
    if clean_q:
        try:
            fts_query = " OR ".join([f'"{word}"*' for word in clean_q.split() if word])
            sql = """
                SELECT m.*, rank
                FROM memories_fts fts
                JOIN memories m ON m.id = fts.rowid
                WHERE memories_fts MATCH ?
            """
            params = [fts_query]
            if category:
                sql += " AND m.category = ?"
                params.append(category.lower())
            sql += " ORDER BY rank ASC, m.importance DESC LIMIT ?"
            params.append(limit)

            rows = con.execute(sql, params).fetchall()
            for r in rows:
                results.append(dict(r))
        except Exception:
            results = []

    # Fallback to standard LIKE if FTS gave no hits or query had no alphanumeric words
    if not results:
        like_term = f"%{query}%"
        sql = """
            SELECT * FROM memories
            WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?)
        """
        params = [like_term, like_term, like_term]
        if category:
            sql += " AND category = ?"
            params.append(category.lower())
        sql += " ORDER BY importance DESC, updated_at DESC LIMIT ?"
        params.append(limit)
        rows = con.execute(sql, params).fetchall()
        for r in rows:
            results.append(dict(r))

    con.close()
    return results


def list_memories(category=None, limit=100):
    init_db()
    con = get_db()
    sql = "SELECT * FROM memories"
    params = []
    if category:
        sql += " WHERE category = ?"
        params.append(category.lower())
    sql += " ORDER BY importance DESC, updated_at DESC LIMIT ?"
    params.append(limit)
    rows = con.execute(sql, params).fetchall()
    con.close()
    return [dict(r) for r in rows]


def get_working_state():
    init_db()
    con = get_db()
    rows = con.execute("SELECT key, value, updated_at FROM working_state").fetchall()
    con.close()
    return {r["key"]: {"value": r["value"], "updated_at": r["updated_at"]} for r in rows}


def update_working_state(task=None, goals=None, blockers=None, notes=None, model=None):
    init_db()
    con = get_db()
    ts = get_timestamp()
    updates = {}
    if task is not None:
        updates["active_task"] = task
    if goals is not None:
        updates["active_goals"] = goals
    if blockers is not None:
        updates["blockers"] = blockers
    if notes is not None:
        updates["notes"] = notes
    if model is not None:
        updates["last_model"] = model

    with con:
        for k, v in updates.items():
            con.execute("""
                INSERT INTO working_state (key, value, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
            """, (k, v, ts))
        con.execute("""
            INSERT INTO history_log (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("STATE_UPDATE", f"Updated keys: {', '.join(updates.keys())}", ts))

    con.close()
    compile_summary()
    return True


def compile_summary():
    """Compiles the entire brain memory into a dense, high-signal Markdown document for LLM ingestion."""
    init_db()
    con = get_db()

    # Load profile
    profile = {}
    if PROFILE_PATH.exists():
        try:
            with open(PROFILE_PATH, "r", encoding="utf-8") as f:
                profile = json.load(f)
        except Exception:
            profile = {}

    # Load state
    state = get_working_state()

    # Fetch categorized memories
    decisions = [dict(r) for r in con.execute(
        "SELECT * FROM memories WHERE category='decision' ORDER BY importance DESC, updated_at DESC LIMIT 10"
    ).fetchall()]

    architecture = [dict(r) for r in con.execute(
        "SELECT * FROM memories WHERE category='architecture' ORDER BY importance DESC, updated_at DESC LIMIT 10"
    ).fetchall()]

    preferences = [dict(r) for r in con.execute(
        "SELECT * FROM memories WHERE category='preference' ORDER BY importance DESC, updated_at DESC LIMIT 10"
    ).fetchall()]

    bugfixes = [dict(r) for r in con.execute(
        "SELECT * FROM memories WHERE category='bugfix' ORDER BY importance DESC, updated_at DESC LIMIT 8"
    ).fetchall()]

    tasks = [dict(r) for r in con.execute(
        "SELECT * FROM memories WHERE category='task' ORDER BY importance DESC, updated_at DESC LIMIT 8"
    ).fetchall()]

    recent = [dict(r) for r in con.execute(
        "SELECT * FROM memories ORDER BY updated_at DESC LIMIT 5"
    ).fetchall()]

    stats_row = con.execute("SELECT COUNT(*) as total FROM memories").fetchone()
    total_memories = stats_row["total"] if stats_row else 0

    con.close()

    dev_name = profile.get("developer", {}).get("name", "Lead Developer")
    project_name = profile.get("developer", {}).get("project", "HEXAGON")

    md = []
    md.append(f"# 🧠 AI Brain Memory Snapshot — {project_name}")
    md.append(f"> **Status**: ACTIVE | **Total Memories**: {total_memories} | **Last Compiled**: {get_timestamp()}")
    md.append("> **Universal Model Protocol**: *Any AI model interacting with this codebase MUST read and adhere to this memory snapshot before taking action.*")
    md.append("")
    md.append("---")
    md.append("")

    # Section 1: Working State
    md.append("## ⚡ Current Working State")
    task_val = state.get("active_task", {}).get("value", "Not set")
    goals_val = state.get("active_goals", {}).get("value", "None")
    block_val = state.get("blockers", {}).get("value", "None")
    notes_val = state.get("notes", {}).get("value", "None")
    model_val = state.get("last_model", {}).get("value", "Unknown")

    md.append(f"- **Active Task**: {task_val}")
    md.append(f"- **Last Updating Model**: `{model_val}`")
    md.append(f"- **Blockers / Gotchas**: {block_val}")
    md.append(f"- **Active Goals & Next Steps**:\n{goals_val}")
    if notes_val and notes_val != "None":
        md.append(f"- **Working Notes**: {notes_val}")
    md.append("")
    md.append("---")
    md.append("")

    # Section 2: Developer Profile & Principles
    md.append("## 👤 Developer Profile & Preferred Stack")
    md.append(f"- **Developer**: {dev_name}")
    prefs = profile.get("preferences", {})
    if "frontend" in prefs:
        md.append(f"- **Frontend**: {prefs['frontend']}")
    if "backend" in prefs:
        md.append(f"- **Backend**: {prefs['backend']}")
    if "code_rules" in prefs and isinstance(prefs["code_rules"], list):
        md.append("- **Core Code Rules**:")
        for r in prefs["code_rules"]:
            md.append(f"  - {r}")
    md.append("")
    md.append("---")
    md.append("")

    # Section 3: Architecture & System Decisions
    md.append("## 🏛️ System Architecture & Stack Knowledge")
    if architecture:
        for a in architecture:
            md.append(f"### 🔹 {a['title']} `[imp: {a['importance']}/5]`")
            md.append(f"{a['content']}")
            if a["tags"]:
                md.append(f"*Tags*: `{a['tags']}`")
            md.append("")
    else:
        md.append("*No architectural memories recorded yet.*")
        md.append("")

    # Section 4: Key Decisions
    md.append("## ⚖️ Key Technical & Product Decisions")
    if decisions:
        for d in decisions:
            md.append(f"- **{d['title']}**: {d['content']} *(Tags: {d['tags']})*")
    else:
        md.append("*No decision memories recorded yet.*")
    md.append("")
    md.append("---")
    md.append("")

    # Section 5: Critical Bug Fixes & Gotchas
    md.append("## 🐛 Known Gotchas & Solved Bugs")
    if bugfixes:
        for b in bugfixes:
            md.append(f"- **{b['title']}**: {b['content']}")
    else:
        md.append("*No known bugfixes recorded yet.*")
    md.append("")
    md.append("---")
    md.append("")

    # Section 6: How Another Model Must Use This Brain
    md.append("## 🔄 Redirection Instructions for Any Model")
    md.append("""
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
""")

    content = "\n".join(md)
    with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    return True


def seed_database():
    """Loads seed memories into database if empty or explicitly called."""
    init_db()
    if not SEED_PATH.exists():
        return 0

    with open(SEED_PATH, "r", encoding="utf-8") as f:
        seeds = json.load(f)

    con = get_db()
    count = 0
    for item in seeds:
        exists = con.execute("SELECT id FROM memories WHERE title = ?", (item["title"],)).fetchone()
        if not exists:
            ts = get_timestamp()
            con.execute("""
                INSERT INTO memories (category, title, content, tags, importance, model, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item.get("category", "general"),
                item["title"],
                item["content"],
                item.get("tags", ""),
                item.get("importance", 3),
                "System Seed",
                ts,
                ts
            ))
            count += 1
    con.commit()
    con.close()
    compile_summary()
    return count


def sync_git():
    """Scans git status and logs to automatically capture recent code progress into the brain."""
    try:
        branch = subprocess.check_output(
            ["git", "branch", "--show-current"], cwd=WORKSPACE_DIR, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        branch = "main"

    try:
        status = subprocess.check_output(
            ["git", "status", "-s"], cwd=WORKSPACE_DIR, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        status = ""

    try:
        recent_commits = subprocess.check_output(
            ["git", "log", "-n", "3", "--oneline"], cwd=WORKSPACE_DIR, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        recent_commits = ""

    notes = f"Git Branch: {branch}\nRecent Commits:\n{recent_commits if recent_commits else 'No commits'}"
    if status:
        changed_files = [line.strip() for line in status.splitlines()[:10]]
        notes += f"\nModified Files ({len(status.splitlines())} total): " + ", ".join(changed_files)

    update_working_state(notes=notes, model="GitSync")
    return notes


def export_prompt():
    """Returns a dense memory block ready to be pasted into ChatGPT, Claude.ai, Gemini web, etc."""
    if not SUMMARY_PATH.exists():
        compile_summary()
    with open(SUMMARY_PATH, "r", encoding="utf-8") as f:
        return f.read()


def get_stats():
    init_db()
    con = get_db()
    total = con.execute("SELECT COUNT(*) as count FROM memories").fetchone()["count"]
    categories = con.execute(
        "SELECT category, COUNT(*) as count FROM memories GROUP BY category"
    ).fetchall()
    cat_counts = {r["category"]: r["count"] for r in categories}
    avg_imp = con.execute("SELECT AVG(importance) as avg_imp FROM memories").fetchone()["avg_imp"]
    recent_logs = [dict(r) for r in con.execute(
        "SELECT * FROM history_log ORDER BY id DESC LIMIT 5"
    ).fetchall()]
    con.close()
    return {
        "total": total,
        "categories": cat_counts,
        "avg_importance": round(avg_imp, 1) if avg_imp else 0,
        "recent_logs": recent_logs,
        "last_sync": get_timestamp()
    }


# ==========================================
# Local Visual Dashboard & REST API Server
# ==========================================
class BrainAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/api/memories":
            category = qs.get("category", [None])[0]
            limit = int(qs.get("limit", [100])[0])
            self._send_json({"memories": list_memories(category=category, limit=limit)})
        elif path == "/api/state":
            self._send_json({"state": get_working_state()})
        elif path == "/api/stats":
            self._send_json({"stats": get_stats()})
        elif path == "/api/recall":
            q = qs.get("q", [""])[0]
            cat = qs.get("category", [None])[0]
            limit = int(qs.get("limit", [5])[0])
            self._send_json({"results": recall(q, limit=limit, category=cat)})
        elif path == "/api/export-prompt":
            self._send_json({"prompt": export_prompt()})
        else:
            # Serve web dashboard static files
            file_name = path.lstrip("/") or "index.html"
            target_file = WEB_DIR / file_name
            if target_file.exists() and target_file.is_file():
                content_type = "text/html"
                if file_name.endswith(".css"):
                    content_type = "text/css"
                elif file_name.endswith(".js"):
                    content_type = "application/javascript"
                elif file_name.endswith(".json"):
                    content_type = "application/json"
                elif file_name.endswith(".svg"):
                    content_type = "image/svg+xml"

                self.send_response(200)
                self.send_header("Content-Type", f"{content_type}; charset=utf-8")
                self.end_headers()
                with open(target_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"File not found in Brain Dashboard")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}

        if path == "/api/remember":
            mem_id = remember(
                title=body.get("title", ""),
                content=body.get("content", ""),
                category=body.get("category", "general"),
                importance=body.get("importance", 3),
                tags=body.get("tags", ""),
                model=body.get("model", "Dashboard UI")
            )
            self._send_json({"success": True, "id": mem_id})
        elif path == "/api/state":
            update_working_state(
                task=body.get("task"),
                goals=body.get("goals"),
                blockers=body.get("blockers"),
                notes=body.get("notes"),
                model=body.get("model", "Dashboard UI")
            )
            self._send_json({"success": True})
        elif path == "/api/sync":
            notes = sync_git()
            self._send_json({"success": True, "notes": notes})
        elif path == "/api/delete":
            mem_id = body.get("id")
            if mem_id:
                delete_memory(mem_id)
                self._send_json({"success": True})
            else:
                self._send_json({"error": "id required"}, status=400)
        else:
            self.send_response(404)
            self.end_headers()

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}

        if path.startswith("/api/memories/"):
            try:
                mem_id = int(path.split("/")[-1])
                success = update_memory(
                    mem_id=mem_id,
                    title=body.get("title"),
                    content=body.get("content"),
                    category=body.get("category"),
                    importance=body.get("importance"),
                    tags=body.get("tags"),
                    model=body.get("model", "Dashboard UI")
                )
                self._send_json({"success": success})
            except Exception as e:
                self._send_json({"error": str(e)}, status=400)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence routine HTTP requests in terminal output
        pass


def run_dashboard(port=4100, host="127.0.0.1"):
    init_db()
    compile_summary()
    server = HTTPServer((host, port), BrainAPIHandler)
    print(f"==================================================")
    print(f"🧠 AI Brain Memory Dashboard running at:")
    print(f"   👉 http://{host}:{port}/")
    print(f"==================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Brain Dashboard server...")
        server.server_close()


# ==========================================
# Self-Test Suite
# ==========================================
def run_tests():
    print("🧪 Running AI Brain Memory Test Suite...")
    init_db()
    seed_database()

    test_title = f"Test Memory {datetime.datetime.now().microsecond}"
    test_content = "Antigravity testing brain persistence and full-text index recall."
    mem_id = remember(test_title, test_content, category="bugfix", importance=5, tags="test,autocheck", model="Tester")
    print(f"  [PASS] Added memory ID: {mem_id}")

    results = recall("Antigravity testing")
    assert any(r["id"] == mem_id for r in results), "Recall failed to find newly added memory!"
    print(f"  [PASS] Recall verified with FTS5 search (found {len(results)} matches).")

    update_working_state(task="Automated Verification Running", model="TestRunner")
    state = get_working_state()
    assert state.get("active_task", {}).get("value") == "Automated Verification Running", "State update failed!"
    print(f"  [PASS] Working state update verified.")

    assert SUMMARY_PATH.exists(), "brain_summary.md was not generated!"
    print(f"  [PASS] brain_summary.md snapshot compilation verified.")

    delete_memory(mem_id)
    post_delete = recall(test_title)
    assert not any(r["id"] == mem_id for r in post_delete), "Memory deletion failed!"
    print(f"  [PASS] Memory deletion verified.")

    print("🎉 All AI Brain Memory tests passed successfully!")
    return True


# ==========================================
# CLI Entry Point
# ==========================================
def main():
    parser = argparse.ArgumentParser(description="AI Brain Memory Updation Program")
    subparsers = parser.add_subparsers(dest="command", help="Sub-command to execute")

    # remember
    p_rem = subparsers.add_parser("remember", help="Save a memory into the AI Brain")
    p_rem.add_argument("title", help="Short descriptive title of memory")
    p_rem.add_argument("content", help="Full details, context, and code/solution")
    p_rem.add_argument("--category", "-c", default="general", choices=["decision", "architecture", "preference", "bugfix", "task", "insight", "general"])
    p_rem.add_argument("--importance", "-i", type=int, default=3, choices=[1, 2, 3, 4, 5])
    p_rem.add_argument("--tags", "-t", default="", help="Comma-separated tags")
    p_rem.add_argument("--model", "-m", default="CLI", help="Model name recording this memory")

    # recall
    p_rec = subparsers.add_parser("recall", help="Search and recall memories")
    p_rec.add_argument("query", help="Search query (keywords, problem, topic)")
    p_rec.add_argument("--limit", "-l", type=int, default=5)
    p_rec.add_argument("--category", "-c", default=None)
    p_rec.add_argument("--json", action="store_true")

    # update-state
    p_state = subparsers.add_parser("update-state", help="Update current working state")
    p_state.add_argument("--task", default=None, help="Active task description")
    p_state.add_argument("--goals", default=None, help="Active goals and next steps")
    p_state.add_argument("--blockers", default=None, help="Current blockers or warnings")
    p_state.add_argument("--notes", default=None, help="Working notes")
    p_state.add_argument("--model", default=None, help="Model updating state")

    # get-state
    p_gstate = subparsers.add_parser("get-state", help="Print current working state")
    p_gstate.add_argument("--json", action="store_true")

    # list
    p_list = subparsers.add_parser("list", help="List memories")
    p_list.add_argument("--category", "-c", default=None)
    p_list.add_argument("--limit", "-l", type=int, default=20)
    p_list.add_argument("--json", action="store_true")

    # delete
    p_del = subparsers.add_parser("delete", help="Delete a memory by ID")
    p_del.add_argument("id", type=int)

    # compile
    subparsers.add_parser("compile", help="Compile brain_summary.md snapshot")

    # seed
    subparsers.add_parser("seed", help="Seed database with initial memories")

    # sync
    subparsers.add_parser("sync", help="Sync git status and commits into working state")

    # export
    p_exp = subparsers.add_parser("export", help="Export memories or generate prompt for external models")
    p_exp.add_argument("--prompt", action="store_true", help="Print prompt ready for ChatGPT/Claude web")

    # dashboard
    p_dash = subparsers.add_parser("dashboard", help="Start visual dashboard web server")
    p_dash.add_argument("--port", "-p", type=int, default=4100)
    p_dash.add_argument("--host", default="127.0.0.1")

    # test
    subparsers.add_parser("test", help="Run self-test suite")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "remember":
        mem_id = remember(args.title, args.content, args.category, args.importance, args.tags, args.model)
        print(f"✅ Memory #{mem_id} committed to AI Brain ({args.category}, imp: {args.importance}/5).")
        print(f"📄 Snapshot updated: {SUMMARY_PATH}")

    elif args.command == "recall":
        results = recall(args.query, limit=args.limit, category=args.category)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"🔍 Recalled {len(results)} memories for: '{args.query}'\n")
            for r in results:
                print(f"[{r['category'].upper()}] #{r['id']} {r['title']} (Imp: {r['importance']}/5)")
                print(f"  {r['content']}")
                if r['tags']:
                    print(f"  Tags: {r['tags']}")
                print(f"  Model: {r['model']} | Updated: {r['updated_at']}\n")

    elif args.command == "update-state":
        update_working_state(args.task, args.goals, args.blockers, args.notes, args.model)
        print("✅ Working state updated and brain snapshot re-compiled.")

    elif args.command == "get-state":
        state = get_working_state()
        if args.json:
            print(json.dumps(state, indent=2))
        else:
            print("⚡ Current AI Brain Working State:")
            for k, v in state.items():
                print(f"- {k}: {v['value']} (last updated: {v['updated_at']})")

    elif args.command == "list":
        mems = list_memories(args.category, args.limit)
        if args.json:
            print(json.dumps(mems, indent=2))
        else:
            print(f"📋 AI Brain Memories ({len(mems)} total):")
            for r in mems:
                print(f"#{r['id']} [{r['category']}] {r['title']} (Imp: {r['importance']}/5) - {r['updated_at']}")

    elif args.command == "delete":
        delete_memory(args.id)
        print(f"🗑️ Memory #{args.id} deleted.")

    elif args.command == "compile":
        compile_summary()
        print(f"📄 Brain summary snapshot compiled: {SUMMARY_PATH}")

    elif args.command == "seed":
        count = seed_database()
        print(f"🌱 Seeded {count} initial memories into AI Brain.")

    elif args.command == "sync":
        notes = sync_git()
        print(f"🔄 Git state synchronized into AI Brain Working State:\n{notes}")

    elif args.command == "export":
        if args.prompt:
            print(export_prompt())
        else:
            print(json.dumps(list_memories(limit=1000), indent=2))

    elif args.command == "dashboard":
        run_dashboard(port=args.port, host=args.host)

    elif args.command == "test":
        run_tests()


if __name__ == "__main__":
    main()
