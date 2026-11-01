# CodeScale AI — Architecture

> Status legend: ✅ verified exists | 🟡 started, unverified | ⬜ planned (does NOT exist yet)
> Rule: a component is only marked ✅ after it has been run and checked.
> Last updated: 2026-10-28

---

## 1. What CodeScale AI Is

CodeScale AI is a VS Code extension that finds code which works on small inputs but becomes slow or unreliable on large inputs. It uses **static analysis (Python ast) + real measurements (benchmarks) + tests** as evidence, and uses an LLM (Groq) only to explain findings and draft code changes.

Core loop: **Detect → Recommend → Verify → Measure → Report**

Signature feature: **Scalability Crossover Finder**

---

## 2. Design Principles

| Principle | Why |
|---|---|
| Local-first | No cost, works offline, user code stays on their machine. |
| Evidence over AI opinion | Complexity, timings, test results are computed, not hallucinated. |
| Label everything: estimated vs measured vs proven | Judges and users must trust the numbers. |
| Never silently change user files | Always show a diff; user accepts or rejects. |
| Free tools only | Groq free tier, Render/Vercel/Neon free tiers. |
| Modular, one responsibility per module | Easy to test and extend. |
| Structured JSON between extension and engine | Easy to validate. |

---

## 3. Module Responsibilities

| # | Module | Status |
|---|---|---|
| 1 | Activation & commands | ⬜ |
| 2 | Secret handling | ⬜ |
| 3 | Groq service | ⬜ |
| 4 | Static analyzer | ⬜ |
| 5 | Complexity estimator | ⬜ |
| 6 | Benchmark runner | ⬜ |
| 7 | Crossover finder | ⬜ |
| 8 | Verifier | ⬜ |
| 9 | Worst-case finder | ⬜ |
| 10 | Edge-case advisor | ⬜ |
| 11 | Optimization recommender | ⬜ |
| 12 | Editor integration | ⬜ |
| 13 | Webview UI | ⬜ |
| 14 | Secret scanner | ⬜ |
| 15 | Data cleaner | ⬜ |
| 16 | Repo analyzer | ⬜ |
| 17 | History & reports | ⬜ |

---

## 4. Safety Model

- Benchmarks run in a separate Python subprocess with timeout and memory cap.
- No destructive filesystem commands.
- AI code changes show a diff preview — user accepts or rejects.
- Source code sent to Groq only after explicit consent.
- API key only in Secret Storage, never in logs or Git.

---

## 5. Key Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-28 | Extension in JavaScript | Matches existing scaffold. |
| 2026-10-28 | Python engine via child process + JSON | Python ast is ideal for analysis. |
| 2026-10-28 | Groq openai/gpt-oss-120b | Free tier, already configured. |
| 2026-10-28 | Backend deferred | Local-first is simpler, free, private. |
