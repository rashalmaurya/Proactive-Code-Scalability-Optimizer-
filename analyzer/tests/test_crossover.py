from crossover import find_crossover


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


def test_crossover_returns_result():
    result = find_crossover(slow_search, fast_search, max_size=1000)
    assert "crossover_size" in result
    assert "original_times" in result
    assert "optimized_times" in result


def test_crossover_has_times():
    result = find_crossover(slow_search, fast_search, max_size=100)
    assert len(result["original_times"]) > 0
    assert len(result["optimized_times"]) > 0
