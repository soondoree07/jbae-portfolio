#!/usr/bin/env python3
"""
artist_portfolio 자동 로거
PostToolUse 훅에서 stdin으로 JSON을 받아 activity.ndjson에 기록
"""
import sys
import json
import datetime
import os

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "activity.ndjson")
PROJECT_MARKER = "artist_portfolio"

# 항상 기록할 git 명령
GIT_ALWAYS = ("git commit", "git push", "git pull", "git merge")


def is_project_related(tool_name, tool_input):
    """artist_portfolio 관련 작업인지 판단"""
    if tool_name in ("Write", "Edit"):
        return PROJECT_MARKER in tool_input.get("file_path", "")

    if tool_name == "Bash":
        cmd  = tool_input.get("command", "")
        desc = tool_input.get("description", "")
        # 경로에 프로젝트명 포함
        if PROJECT_MARKER in cmd or PROJECT_MARKER in desc:
            return True
        # git commit / push 는 경로가 없어도 기록
        if any(cmd.lstrip().startswith(g) for g in GIT_ALWAYS):
            return True

    return False


def make_entry(tool_name, tool_input):
    ts = datetime.datetime.now().astimezone().isoformat()

    if tool_name == "Write":
        path  = tool_input.get("file_path", "")
        fname = os.path.basename(path)
        return {
            "ts":     ts,
            "type":   "file",
            "action": "create",
            "tool":   "Write",
            "file":   fname,
            "path":   path,
            "desc":   f"파일 생성: {fname}",
        }

    if tool_name == "Edit":
        path    = tool_input.get("file_path", "")
        fname   = os.path.basename(path)
        snippet = tool_input.get("old_string", "")[:60].replace("\n", " ")
        return {
            "ts":      ts,
            "type":    "file",
            "action":  "edit",
            "tool":    "Edit",
            "file":    fname,
            "path":    path,
            "desc":    f"파일 수정: {fname}",
            "snippet": snippet,
        }

    if tool_name == "Bash":
        cmd  = tool_input.get("command", "")
        desc = tool_input.get("description", "")

        if cmd.lstrip().startswith("git commit"):
            # 커밋 메시지 추출 시도
            import re
            m = re.search(r'-m\s+"([^"]+)"', cmd) or re.search(r"-m\s+'([^']+)'", cmd)
            msg = m.group(1)[:80] if m else cmd[:80]
            return {
                "ts":     ts,
                "type":   "git",
                "action": "commit",
                "tool":   "Bash",
                "desc":   msg,
            }

        if cmd.lstrip().startswith("git push"):
            return {
                "ts":     ts,
                "type":   "git",
                "action": "push",
                "tool":   "Bash",
                "desc":   "GitHub push",
            }

        return {
            "ts":     ts,
            "type":   "bash",
            "action": "command",
            "tool":   "Bash",
            "desc":   desc or cmd[:120],
        }

    return None


def main():
    try:
        raw = sys.stdin.read()
        data = json.loads(raw)
    except Exception:
        sys.exit(0)

    tool_name  = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})

    if not is_project_related(tool_name, tool_input):
        sys.exit(0)

    entry = make_entry(tool_name, tool_input)
    if not entry:
        sys.exit(0)

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
