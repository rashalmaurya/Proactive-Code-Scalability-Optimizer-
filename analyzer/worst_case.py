import time


def find_worst_case(func, size: int = 100) -> dict:
    candidates = {
        "sorted_ascending": list(range(size)),
        "sorted_descending": list(range(size, 0, -1)),
        "all_same": [1] * size,
        "alternating": [i if i % 2 == 0 else -i for i in range(size)],
        "random_like": [((i * 7) + 3) % size for i in range(size)]
    }

    results = {}
    for name, data in candidates.items():
        try:
            start = time.perf_counter()
            func(data)
            end = time.perf_counter()
            results[name] = round((end - start) * 1000, 4)
        except Exception as e:
            results[name] = None

    worst = max((k for k, v in results.items() if v is not None),
                key=lambda k: results[k], default=None)

    return {
        "worst_case_input": worst,
        "times_ms": results,
        "message": f"Worst performance on '{worst}' input" if worst else "Could not determine worst case"
    }
