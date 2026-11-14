import json
import os
from datetime import datetime


HISTORY_FILE = "analysis_history.json"


def save_report(filename: str, findings: list, complexity: str = None) -> dict:
    history = load_history()

    report = {
        "id": len(history) + 1,
        "timestamp": datetime.now().isoformat(),
        "filename": filename,
        "findings_count": len(findings),
        "warnings": len([f for f in findings if f.get("type") == "warning"]),
        "errors": len([f for f in findings if f.get("type") == "error"]),
        "complexity": complexity or "Unknown",
        "findings": findings
    }

    history.append(report)

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

    return report


def load_history() -> list:
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []


def get_summary() -> dict:
    history = load_history()
    if not history:
        return {"total_analyses": 0, "message": "No analyses recorded yet."}

    total = len(history)
    total_warnings = sum(r["warnings"] for r in history)
    files = list(set(r["filename"] for r in history))

    return {
        "total_analyses": total,
        "total_warnings": total_warnings,
        "files_analysed": files,
        "last_analysis": history[-1]["timestamp"],
        "message": f"{total} analyses recorded across {len(files)} file(s)"
    }


def clear_history() -> bool:
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
    return True
