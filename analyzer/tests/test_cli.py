import subprocess
import json

def test_cli_nested_loop():
    code = "for i in range(10):\n    for j in range(10):\n        print(i,j)"
    result = subprocess.run(
        ["uv", "run", "python", "cli.py"],
        input=code,
        capture_output=True,
        text=True
    )
    output = json.loads(result.stdout)
    assert output["findings"][0]["type"] == "warning"

def test_cli_no_issues():
    code = "x = 1 + 1"
    result = subprocess.run(
        ["uv", "run", "python", "cli.py"],
        input=code,
        capture_output=True,
        text=True
    )
    output = json.loads(result.stdout)
    assert output["findings"][0]["type"] == "info"