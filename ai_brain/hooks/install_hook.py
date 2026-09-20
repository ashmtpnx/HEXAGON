#!/usr/bin/env python3
"""
Installer for AI Brain Git Post-Commit Hook.
Automatically synchronizes commits and modified files into the AI Brain.
"""

import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

HOOK_DIR = Path(__file__).resolve().parent

WORKSPACE_DIR = HOOK_DIR.parent.parent
GIT_HOOKS_DIR = WORKSPACE_DIR / ".git" / "hooks"

HOOK_CONTENT = """#!/bin/sh
# AI Brain Memory Auto-Sync Hook
python ai_brain/brain.py sync > /dev/null 2>&1 &
"""

def install():
    if not GIT_HOOKS_DIR.exists():
        print(f"Error: Git hooks directory not found at {GIT_HOOKS_DIR}")
        return False

    hook_file = GIT_HOOKS_DIR / "post-commit"
    with open(hook_file, "w", encoding="utf-8") as f:
        f.write(HOOK_CONTENT)

    print(f"✅ AI Brain post-commit hook successfully installed at: {hook_file}")
    return True

def uninstall():
    hook_file = GIT_HOOKS_DIR / "post-commit"
    if hook_file.exists():
        hook_file.unlink()
        print(f"🗑️ AI Brain post-commit hook removed.")
    else:
        print("No hook found to remove.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "uninstall":
        uninstall()
    else:
        install()
