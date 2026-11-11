from benchmark import benchmark, compare


def slow_search(data):
    result = []
    for item in data:
        if item in data:
            result.append(item)
    return result


def fast_search(data):
    data_set = set(data)
    result = []
    for item in data:
        if item in data_set:
            result.append(item)
    return result


def test_benchmark_returns_results():
    results = benchmark(slow_search, [10, 100])
    assert len(results) == 2
    assert results[0]["size"] == 10
    assert results[0]["time_ms"] is not None


def test_compare_returns_both():
    results = compare(slow_search, fast_search, [10, 100])
    assert "original" in results
    assert "optimized" in results
    assert len(results["original"]) == 2
    assert len(results["optimized"]) == 2