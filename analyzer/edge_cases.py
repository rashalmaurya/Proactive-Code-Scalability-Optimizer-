def check_edge_cases(func) -> dict:
    edge_cases = {
        "empty": [],
        "single": [1],
        "duplicates": [1, 1, 1, 1],
        "negatives": [-3, -2, -1, 0, 1],
        "large": list(range(1000)),
        "single_char": ["a"],
        "mixed_order": [5, 3, 1, 4, 2]
    }

    results = {}
    for name, data in edge_cases.items():
        try:
            output = func(data)
            results[name] = {
                "passed": True,
                "output_type": type(output).__name__,
                "output_length": len(output) if hasattr(output, '__len__') else None
            }
        except Exception as e:
            results[name] = {
                "passed": False,
                "error": str(e)
            }

    failed = [k for k, v in results.items() if not v["passed"]]

    return {
        "results": results,
        "failed_cases": failed,
        "all_passed": len(failed) == 0,
        "message": f"Failed on: {', '.join(failed)}" if failed else "All edge cases passed!"
    }
