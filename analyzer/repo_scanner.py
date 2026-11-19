import os
from analyzer import analyze


def scan_repo(folder_path: str) -> dict:
    results = []
    total_findings = 0
    files_scanned = 0
    files_with_issues = 0

    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if d not in ['__pycache__', '.venv', 'node_modules', '.git']]
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        source = f.read()
                    findings = analyze(source)
                    files_scanned += 1
                    warnings = [f for f in findings if f.get('type') == 'warning']
                    if warnings:
                        files_with_issues += 1
                        total_findings += len(warnings)
                    results.append({
                        "file": filepath,
                        "findings": findings,
                        "warnings": len(warnings)
                    })
                except Exception as e:
                    results.append({
                        "file": filepath,
                        "error": str(e),
                        "warnings": 0
                    })

    return {
        "files_scanned": files_scanned,
        "files_with_issues": files_with_issues,
        "total_findings": total_findings,
        "results": results,
        "message": f"Scanned {files_scanned} files, found issues in {files_with_issues} files"
    }
