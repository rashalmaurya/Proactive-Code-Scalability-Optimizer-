import ast

def analyze(source_code: str) -> list:
    findings = []
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return [{"type": "error", "message": f"Syntax error: {e}"}]

    for node in ast.walk(tree):
        # Check for nested loops
        if isinstance(node, ast.For):
            for child in ast.walk(node):
                if isinstance(child, ast.For) and child is not node:
                    findings.append({
                        "type": "warning",
                        "line": node.lineno,
                        "message": "Nested loop detected — may be O(n²). Consider a more efficient approach."
                    })
                    break

        # Check for membership test in list inside loop
        if isinstance(node, (ast.For, ast.While)):
            for child in ast.walk(node):
                if isinstance(child, ast.Compare):
                    for op in child.ops:
                        if isinstance(op, (ast.In, ast.NotIn)):
                            for comparator in child.comparators:
                                if isinstance(comparator, (ast.List, ast.Name)):
                                    findings.append({
                                        "type": "warning",
                                        "line": child.lineno,
                                        "message": "Membership test on a list inside a loop — use a set for O(1) average lookup instead of O(n)."
                                    })

        # Check for repeated calls to len() inside loops
        if isinstance(node, (ast.For, ast.While)):
            len_calls = []
            for child in ast.walk(node):
                if isinstance(child, ast.Call):
                    if isinstance(child.func, ast.Name) and child.func.id == 'len':
                        len_calls.append(child)
            if len(len_calls) > 1:
                findings.append({
                    "type": "warning",
                    "line": node.lineno,
                    "message": "Multiple calls to len() inside a loop — store the result in a variable before the loop."
                })

    if not findings:
        findings.append({
            "type": "info",
            "message": "No obvious inefficiencies detected."
        })

    return findings