# CodeScale AI — Proactive Code Scalability Optimizer

> Find code that works small but breaks big. Evidence first, AI second.

## What is CodeScale AI?

CodeScale AI is a VS Code extension that analyses Python code for performance issues, scalability problems, and potential bugs — before they become serious problems in production.

## Features

- 🔍 **Smart Code Analysis** — Detects nested loops, inefficient data structures, repeated operations
- 📊 **Complexity Estimation** — Estimates time and space complexity (O(1), O(n), O(n²))
- ⚡ **Benchmark Runner** — Measures actual execution time and memory usage
- 🔄 **Scalability Crossover Finder** — Finds the input size where optimized code becomes faster
- ✅ **Correctness Verifier** — Ensures optimized code produces the same results
- 💡 **DSA-Aware Suggestions** — Recommends better algorithms and data structures
- 🔒 **Secret Scanner** — Detects accidentally committed API keys and passwords
- 🧪 **Edge Case Advisor** — Tests your code against empty, large, and unusual inputs
- 📈 **Algorithm Comparison** — Compares two algorithms side by side
- 🕐 **History and Reports** — Tracks analysis results over time
- 🧹 **Data Cleaner** — Cleans CSV files by removing duplicates and fixing missing values
- 🗂️ **Repo-wide Analysis** — Scans your entire project for issues

## How to Use

1. Open a Python file in VS Code
2. Press **Ctrl + Shift + P**
3. Type **CodeScale AI: Analyze Code**
4. Press Enter
5. The CodeScale AI dashboard opens on the right

## Requirements

- VS Code 1.144+
- Python 3.12+
- uv (Python package manager)

## Tech Stack

- VS Code Extension API (JavaScript)
- Python 3.12 via uv
- Python AST for static analysis
- pytest for testing

## Author

Built for the International AI Coding Competition.
