from complexity import estimate_complexity


def test_constant():
    code = """
def func(x):
    return x + 1
"""
    result = estimate_complexity(code)
    assert result["complexity"] == "O(1)"


def test_linear():
    code = """
def func(items):
    for item in items:
        print(item)
"""
    result = estimate_complexity(code)
    assert result["complexity"] == "O(n)"


def test_quadratic():
    code = """
def func(items):
    for i in items:
        for j in items:
            print(i, j)
"""
    result = estimate_complexity(code)
    assert result["complexity"] == "O(n^2)"


def test_recursion():
    code = """
def func(n):
    if n == 0:
        return 1
    return func(n - 1)
"""
    result = estimate_complexity(code)
    assert result["has_recursion"] is True
