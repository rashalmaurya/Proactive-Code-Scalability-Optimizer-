import re

SECRET_PATTERNS = [
    (r'api[_-]?key\s*=\s*["\']([^"\']+)["\']', 'API Key'),
    (r'password\s*=\s*["\']([^"\']+)["\']', 'Password'),
    (r'secret\s*=\s*["\']([^"\']+)["\']', 'Secret'),
    (r'token\s*=\s*["\']([^"\']+)["\']', 'Token'),
    (r'aws_access_key_id\s*=\s*["\']([^"\']+)["\']', 'AWS Access Key'),
    (r'private_key\s*=\s*["\']([^"\']+)["\']', 'Private Key'),
]

SAFE_VALUES = ['your_key_here', 'your_token', 'example', 'placeholder', 'xxx', 'changeme', '']


def scan_secrets(source_code: str) -> dict:
    findings = []

    for pattern, label in SECRET_PATTERNS:
        matches = re.finditer(pattern, source_code, re.IGNORECASE)
        for match in matches:
            value = match.group(1)
            if value.lower() not in SAFE_VALUES and len(value) > 3:
                line = source_code[:match.start()].count('\n') + 1
                findings.append({
                    "type": label,
                    "line": line,
                    "message": f"Possible {label} found — do not commit secrets to version control!"
                })

    return {
        "findings": findings,
        "clean": len(findings) == 0,
        "message": "No secrets detected!" if not findings else f"{len(findings)} potential secret(s) found!"
    }
