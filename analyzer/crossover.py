from benchmark import benchmark


def find_crossover(func1, func2, max_size: int = 10000) -> dict:
    sizes = [10, 50, 100, 500, 1000, 5000, 10000]
    sizes = [s for s in sizes if s <= max_size]

    results1 = benchmark(func1, sizes)
    results2 = benchmark(func2, sizes)

    crossover = None

    for i in range(len(sizes)):
        t1 = results1[i].get("time_ms")
        t2 = results2[i].get("time_ms")
        if t1 is not None and t2 is not None:
            if t2 < t1:
                crossover = sizes[i]
                break

    return {
        "crossover_size": crossover,
        "message": f"Optimized version becomes faster at input size {crossover}" if crossover else "No crossover found in tested range",
        "original_times": results1,
        "optimized_times": results2
    }
