import ast


COMPLEXITY_PATTERNS = {
    "O(1)": "Constant time — does not depend on input size.",
    "O(n)": "Linear time — grows proportionally with input size.",
    "O(n^2)": "Quadratic time — grows with the square of input size. Common with nested loops.",
    "O(log n)": "Logarithmic time — very efficient, common in binary search.",
    "O(n log n)": "Linearithmic time — common in efficient sorting algorithms."
}


def estimate_complexity(source_code: str) -> dict:
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return {"error": str(e)}

    max_depth = 0
    has_recursion = False
    func_name = None

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            func_name = node.name
            depth = _get_loop_depth(node)
            if depth > max_depth:
                max_depth = depth
            if _has_recursion(node):
                has_recursion = True

    if max_depth == 0:
        complexity = "O(1)"
    elif max_depth == 1:
        complexity = "O(n)"
    elif max_depth == 2:
        complexity = "O(n^2)"
    else:
        complexity = f"O(n^{max_depth})"

    if has_recursion:
        complexity = "O(log n) or O(n) — recursion detected, depends on implementation"

    return {
        "complexity": complexity,
        "explanation": COMPLEXITY_PATTERNS.get(complexity, "Complex — analyse manually."),
        "loop_depth": max_depth,
        "has_recursion": has_recursion
    }


def _get_loop_depth(node, current_depth=0) -> int:
    max_depth = current_depth
    for child in ast.iter_child_nodes(node):
        if isinstance(child, (ast.For, ast.While)):
            depth = _get_loop_depth(child, current_depth + 1)
            if depth > max_depth:
                max_depth = depth
        else:
            depth = _get_loop_depth(child, current_depth)
            if depth > max_depth:
                max_depth = depth
    return max_depth


def _has_recursion(func_node) -> bool:
    func_name = func_node.name
    for node in ast.walk(func_node):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == func_name:
                return True
    return False
