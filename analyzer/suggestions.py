SUGGESTIONS = {
    "nested_loop": {
        "title": "Replace nested loop with a more efficient approach",
        "explanation": "Nested loops are O(n²). Consider using a dictionary or set to reduce to O(n).",
        "example_before": "for i in items:\n    for j in items:\n        if i == j:\n            print(i)",
        "example_after": "seen = set(items)\nfor i in items:\n    if i in seen:\n        print(i)"
    },
    "list_membership": {
        "title": "Use a set for membership checks",
        "explanation": "Checking 'x in list' is O(n). Convert to a set first for O(1) average lookup.",
        "example_before": "items = [1, 2, 3]\nfor x in data:\n    if x in items:\n        print(x)",
        "example_after": "items_set = set([1, 2, 3])\nfor x in data:\n    if x in items_set:\n        print(x)"
    },
    "repeated_len": {
        "title": "Cache len() result before the loop",
        "explanation": "Calling len() repeatedly is wasteful. Store the result in a variable before the loop.",
        "example_before": "for i in range(len(items)):\n    if i < len(items):\n        print(items[i])",
        "example_after": "n = len(items)\nfor i in range(n):\n    if i < n:\n        print(items[i])"
    }
}


def get_suggestion(finding_message: str) -> dict:
    message = finding_message.lower()
    if "nested loop" in message:
        return SUGGESTIONS["nested_loop"]
    elif "set" in message and "membership" in message:
        return SUGGESTIONS["list_membership"]
    elif "len()" in message:
        return SUGGESTIONS["repeated_len"]
    return {
        "title": "Review this code for efficiency",
        "explanation": finding_message,
        "example_before": "",
        "example_after": ""
    }
