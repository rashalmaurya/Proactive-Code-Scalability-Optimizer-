import os
from repo_scanner import scan_repo


def test_scan_repo():
    current = os.path.dirname(os.path.abspath(__file__))
    result = scan_repo(current)
    assert "files_scanned" in result
    assert "total_findings" in result
    assert result["files_scanned"] >= 0


def test_scan_message():
    current = os.path.dirname(os.path.abspath(__file__))
    result = scan_repo(current)
    assert "message" in result
    assert "Scanned" in result["message"]
