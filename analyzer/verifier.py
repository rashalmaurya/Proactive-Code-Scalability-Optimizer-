def verify(func1, func2, test_inputs: list) -> dict:
    results = []
    all_passed = True

    for inp in test_inputs:
        try:
            out1 = func1(inp)
            out2 = func2(inp)
            passed = out1 == out2
            if not passed:
                all_passed = False
            results.append({
                "input": inp,
                "original_output": out1,
                "optimized_output": out2,
                "passed": passed
            })
        except Exception as e:
            all_passed = False
            results.append({
                "input": inp,
                "error": str(e),
                "passed": False
            })

    return {
        "all_passed": all_passed,
        "results": results
    }