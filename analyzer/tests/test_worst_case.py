from worst_case import find_worst_case


def bubble_sort(data):
    arr = data.copy()
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr


def test_worst_case_returns_result():
    result = find_worst_case(bubble_sort, size=50)
    assert "worst_case_input" in result
    assert "times_ms" in result
    assert len(result["times_ms"]) == 5


def test_worst_case_has_message():
    result = find_worst_case(bubble_sort, size=50)
    assert "message" in result
    assert len(result["message"]) > 0
