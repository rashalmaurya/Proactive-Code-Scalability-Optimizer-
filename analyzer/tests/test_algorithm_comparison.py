from algorithm_comparison import compare_algorithms


def linear_search(data):
    target = data[-1] if data else 0
    for item in data:
        if item == target:
            return item
    return None


def set_search(data):
    target = data[-1] if data else 0
    return target if target in set(data) else None


def test_comparison_returns_result():
    algos = {"linear": linear_search, "set": set_search}
    result = compare_algorithms(algos, [10, 100])
    assert "results" in result
    assert "overall_winner" in result
    assert "comparison" in result


def test_comparison_has_winner():
    algos = {"linear": linear_search, "set": set_search}
    result = compare_algorithms(algos, [10, 100, 500])
    assert result["overall_winner"] in ["linear", "set"]
