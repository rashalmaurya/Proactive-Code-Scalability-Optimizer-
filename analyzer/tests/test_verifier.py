from verifier import verify


def original(data):
    result = []
    for item in data:
        if item not in result:
            result.append(item)
    return sorted(result)


def optimized(data):
    return sorted(set(data))


def wrong_optimized(data):
    return sorted(set(data)) + [999]


def test_verify_passes():
    inputs = [[1, 2, 2, 3], [4, 4, 5], []]
    result = verify(original, optimized, inputs)
    assert result["all_passed"] is True
    assert len(result["results"]) == 3


def test_verify_fails():
    inputs = [[1, 2, 2, 3]]
    result = verify(original, wrong_optimized, inputs)
    assert result["all_passed"] is False
    assert result["results"][0]["passed"] is False
