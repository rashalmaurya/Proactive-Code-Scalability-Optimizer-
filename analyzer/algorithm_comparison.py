from benchmark import benchmark


def compare_algorithms(algorithms: dict, input_sizes: list) -> dict:
    results = {}

    for name, func in algorithms.items():
        try:
            results[name] = benchmark(func, input_sizes)
        except Exception as e:
            results[name] = [{"error": str(e)}]

    comparison = []
    for size_idx in range(len(input_sizes)):
        size = input_sizes[size_idx]
        size_result = {"size": size, "times": {}}
        for name in algorithms:
            r = results[name]
            if size_idx < len(r) and "time_ms" in r[size_idx]:
                size_result["times"][name] = r[size_idx]["time_ms"]
        if size_result["times"]:
            fastest = min(size_result["times"], key=lambda k: size_result["times"][k] or float('inf'))
            size_result["fastest"] = fastest
            comparison.append(size_result)

    winner = None
    if comparison:
        winner_counts = {}
        for c in comparison:
            if "fastest" in c:
                w = c["fastest"]
                winner_counts[w] = winner_counts.get(w, 0) + 1
        winner = max(winner_counts, key=winner_counts.get)

    return {
        "results": results,
        "comparison": comparison,
        "overall_winner": winner,
        "message": f"'{winner}' is generally faster across tested input sizes" if winner else "Could not determine winner"
    }
