from history import save_report, load_history, get_summary, clear_history


def test_save_and_load():
    clear_history()
    findings = [{"type": "warning", "line": 1, "message": "Test warning"}]
    report = save_report("test.py", findings, "O(n)")
    assert report["filename"] == "test.py"
    assert report["warnings"] == 1
    history = load_history()
    assert len(history) == 1
    clear_history()


def test_summary():
    clear_history()
    findings = [{"type": "warning", "line": 1, "message": "Test"}]
    save_report("test.py", findings)
    summary = get_summary()
    assert summary["total_analyses"] == 1
    assert "test.py" in summary["files_analysed"]
    clear_history()


def test_empty_summary():
    clear_history()
    summary = get_summary()
    assert summary["total_analyses"] == 0
    clear_history()
