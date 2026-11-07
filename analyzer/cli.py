import sys
import json
from analyzer import analyze

def main():
    source_code = sys.stdin.read()
    findings = analyze(source_code)
    print(json.dumps({"findings": findings}))

if __name__ == "__main__":
    main()