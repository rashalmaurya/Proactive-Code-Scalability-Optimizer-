from secret_scanner import scan_secrets


def test_no_secrets():
    code = "x = 1 + 1\nprint(x)"
    result = scan_secrets(code)
    assert result["clean"] is True


def test_detects_api_key():
    code = 'api_key = "sk-abc123xyz789secret"'
    result = scan_secrets(code)
    assert result["clean"] is False
    assert len(result["findings"]) > 0


def test_detects_password():
    code = 'password = "mysecretpassword123"'
    result = scan_secrets(code)
    assert result["clean"] is False


def test_ignores_placeholder():
    code = 'api_key = "your_key_here"'
    result = scan_secrets(code)
    assert result["clean"] is True
