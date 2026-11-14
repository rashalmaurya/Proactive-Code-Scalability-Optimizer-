from edge_cases import check_edge_cases


def good_func(data):
    return sorted(set(data))


def bad_func(data):
    return [data[0]]


def test_edge_cases_all_pass():
    result = check_edge_cases(good_func)
    assert result["all_passed"] is True
    assert len(result["results"]) == 7


def test_edge_cases_some_fail():
    result = check_edge_cases(bad_func)
    assert result["all_passed"] is False
    assert "empty" in result["failed_cases"]
