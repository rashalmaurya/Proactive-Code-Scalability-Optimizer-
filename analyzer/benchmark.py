import time
import tracemalloc


def benchmark(func, input_sizes: list) -> list:
    results = []
    for size in input_sizes:
        data = list(range(size))

        tracemalloc.start()
        start = time.perf_counter()

        try:
            func(data)
        except Exception as e:
            results.append({
                "size": size,
                "time_ms": None,
                "memory_kb": None,
                "error": str(e)
            })
            tracemalloc.stop()
            continue

        end = time.perf_counter()
        _, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        results.append({
            "size": size,
            "time_ms": round((end - start) * 1000, 4),
            "memory_kb": round(peak / 1024, 2)
        })

    return results


def compare(func1, func2, input_sizes: list) -> dict:
    results1 = benchmark(func1, input_sizes)
    results2 = benchmark(func2, input_sizes)

    return {
        "original": results1,
        "optimized": results2
    }