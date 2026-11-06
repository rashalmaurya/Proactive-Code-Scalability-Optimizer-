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
    assert result[0]["type"] == "warning"