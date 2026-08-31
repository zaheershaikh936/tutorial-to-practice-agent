I need you to implement a reproducible evaluation/benchmark system for this project.

IMPORTANT:
- Do NOT change the existing application behavior.
- Do NOT rewrite the baseline or advanced implementation.
- First inspect the entire repository and understand how the baseline and advanced solutions currently work.
- Reuse the project's existing architecture, dependencies, scripts, and testing conventions where possible.
- Do not invent metrics or results.
- The evaluation must run against the actual implementations and produce real measurements.

Context:
This project has:
1. A BASELINE implementation — the original/simple solution. is in the (branch feat/baseline-pipeline)
2. An ADVANCED implementation — the improved solution with: 
   - caching
   - retry handling
   - validation
   - agent-based verification

Goal:
Create an evaluation script that runs the SAME set of test cases against both the baseline and advanced implementations and objectively compares their results.

Tasks:

1. Inspect the repository
   - Identify the baseline entry point.
   - Identify the advanced entry point.
   - Identify how inputs are provided.
   - Identify the expected outputs.
   - Identify existing tests.
   - Identify where caching, retries, validation, and agent verification are implemented.
   - Understand how the application is executed.

2. Design an evaluation dataset
   Create:

   evaluation/test-cases.json

   The test cases should represent realistic usage of this application.

   Include:
   - normal cases
   - edge cases
   - invalid inputs
   - ambiguous cases where applicable
   - duplicate/repeated inputs where applicable
   - failure/retry scenarios where they can be safely simulated

   Do NOT create artificial test cases that favor the advanced implementation.

3. Create an evaluation script

   Create something like:

   evaluation/evaluate.ts

   or use the project's existing language/conventions.

   The script must:
   - Load the test cases.
   - Run every test case against the BASELINE.
   - Run the exact same test cases against the ADVANCED solution.
   - Capture results.
   - Compare outputs against the expected result where possible.
   - Measure relevant performance/reliability metrics.
   - Handle failures without stopping the entire evaluation.
   - Produce machine-readable results.

4. Measure appropriate metrics.

   Determine which metrics actually make sense for THIS project.

   Possible metrics include:
   - total test cases
   - successful cases
   - failed cases
   - correctness/accuracy
   - validation failures
   - retry count
   - successful recovery after retry
   - cache hits
   - cache misses
   - number of external/LLM calls
   - average latency
   - p95 latency if practical
   - total execution time
   - verification failures
   - verification-caught errors
   - final success rate

   DO NOT report a metric if it cannot be measured reliably from the implementation.

5. Make the evaluation fair.

   Both implementations must receive:
   - the same inputs
   - the same test cases
   - equivalent environment/configuration
   - equivalent external data where applicable

   Do not modify inputs between baseline and advanced runs.

6. Handle nondeterministic AI behavior carefully.

   If this project uses an LLM/AI model:
   - use deterministic settings where supported
   - record the model used
   - record relevant configuration
   - avoid claiming exact accuracy if outputs are inherently nondeterministic
   - clearly distinguish deterministic metrics from approximate metrics

7. Produce a human-readable report.

   Running:

   npm run evaluate

   should produce something similar to:

   ==========================================
   Frontier Engineering Evaluation
   ==========================================

   Test cases: 50

   BASELINE
   ------------------------------------------
   Passed:              38
   Failed:              12
   Success rate:        76%
   Average latency:     ...
   External calls:      ...

   ADVANCED
   ------------------------------------------
   Passed:              46
   Failed:               4
   Success rate:        92%
   Average latency:     ...
   Cache hits:          ...
   Retries:             ...
   Verification catches: ...

   IMPROVEMENT
   ------------------------------------------
   Success rate:        +16 percentage points
   Latency improvement: ...
   External call reduction: ...
   ==========================================

   Only display metrics that are actually available.

8. Also create a machine-readable result:

   evaluation/results.json

   Include:
   - timestamp
   - project/version information
   - test case count
   - baseline metrics
   - advanced metrics
   - improvement calculations
   - evaluation configuration

9. Make the evaluation reproducible.

   Add the required npm script to package.json:

   "evaluate": "..."

   The command should work from a clean environment after installing dependencies.

10. Add documentation.

   Update README.md with a section:

   ## Evaluation

   Explain:
   - what is being evaluated
   - how the test cases were created
   - how baseline and advanced are compared
   - which metrics are measured
   - how to run the evaluation
   - how to interpret the results

   Example:

   npm run evaluate

11. IMPORTANT FOR THE HACKATHON

   This evaluation is evidence for the claim that the advanced solution meaningfully improves the baseline.

   Therefore:
   - Do not hard-code results.
   - Do not manually enter percentages.
   - Do not fake benchmark numbers.
   - Do not create a report that always makes the advanced solution look better.
   - Results must come from actual execution.
   - Preserve raw results so the evaluation can be reproduced by judges.

12. Before implementing anything, give me a short analysis containing:

   A. Baseline entry point
   B. Advanced entry point
   C. Existing test infrastructure
   D. Recommended test-case structure
   E. Recommended metrics
   F. Files you plan to create/change

   Then implement the evaluation system.

13. After implementation:
   - Run the evaluation.
   - Fix any issues.
   - Run it again.
   - Show me the actual output.
   - Do not invent any numbers.

Do not make unrelated changes to the project.