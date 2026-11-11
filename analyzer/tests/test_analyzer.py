from analyzer import analyze


def test_no_issues():
    code = "x = 1 + 1"
    result = analyze(code)
    assert result[0]["type"] == "info"


def test_nested_loop():
    code = """
for i in range(10):
    for j in range(10):
        print(i, j)
"""
    result = analyze(code)
    assert any(f["type"] == "warning" for f in result)


def test_list_membership_in_loop():
    code = """
items = [1, 2, 3]
for x in range(10):
    if x in items:
        print(x)
"""
    result = analyze(code)
    assert any("set" in f["message"] for f in result)


def test_repeated_len_in_loop():
    code = """
items = [1, 2, 3]
for i in range(len(items)):
    if i < len(items):
        print(items[i])
"""
    result = analyze(code)
    assert any("len" in f["message"] for f in result)
