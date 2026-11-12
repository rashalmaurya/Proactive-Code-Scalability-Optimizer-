from suggestions import get_suggestion


def test_nested_loop_suggestion():
    result = get_suggestion("Nested loop detected — may be O(n²).")
    assert result["title"] == "Replace nested loop with a more efficient approach"
    assert "dictionary" in result["explanation"]


def test_list_membership_suggestion():
    result = get_suggestion("Membership test on a list inside a loop — use a set for O(1) average lookup instead of O(n).")
    assert "set" in result["title"].lower()


def test_len_suggestion():
    result = get_suggestion("Multiple calls to len() inside a loop.")
    assert "len()" in result["title"]
