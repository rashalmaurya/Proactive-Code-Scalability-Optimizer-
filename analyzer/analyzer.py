import ast

def analyze(source_code: str) -> list:
    findings = []
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return [{"type": "error", "message": f"Syntax error: {e}"}]

    for node in ast.walk(tree):
        if isinstance(node, ast.For):
            for child in ast.walk(node):
                if isinstance(child, ast.For) and child is not node:
                    findings.append({
                        "type": "warning",
                        "line": node.lineno,
                        "message": "Nested loop detected — may be O(n²). Consider a more efficient approach."
                    })
                    break

    if not findings:
        findings.append({
            "type": "info",
            "message": "No obvious inefficiencies detected."
        })

    return findings