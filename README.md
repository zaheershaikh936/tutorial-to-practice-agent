# tutorial-to-practice-agent

# Project: Tutorial-to-Practice Agent
### micro1 Agentic Workflows Hackathon 2026

**One-liner:** Feed it a coding tutorial (video transcript or blog post) → it generates a practice exercise + test cases + hints, based on exactly what was taught, so watching turns into doing.

---

## 1. Problem Definition (fill in before building)

| Question | Your Answer |
|---|---|
| **Who has this problem?** | Self-taught / learning software engineers (like you) who consume tutorials on YouTube/blogs |
| **What bottleneck?** | Passive watching ≠ retention. No easy way to turn a video into hands-on practice tied to what was actually taught |
| **Does the agent solve it well?** | Multi-step pipeline: extract concept → generate exercise → generate tests → self-verify by solving it |
| **Can someone else reproduce it?** | Yes — fixed set of input transcripts/URLs, documented commands, expected output format |

---

## 2. System Design

### Baseline (dumb version)
- One single prompt: *"Give me a practice problem based on this transcript."*
- No verification, no structure, no test cases guaranteed to be correct.

### Agent Solution (your actual build)
```
Transcript/Blog text
        │
        ▼
[1] Extract core concept
        │
        ▼
[2] Generate coding exercise (tied to that concept)
        │
        ▼
[3] Generate test cases
        │
        ▼
[4] Self-verify: agent solves its own exercise
        │
        ▼
Final output: exercise + starter code + tests + hint(s)
```

Each numbered step = one agent call, output of one feeds the next.

---

## 3. Tech Requirements

- [ ] Coding agent (Claude Code / Cursor / etc.) — pick one, confirm it can be scripted/looped
- [ ] Language: Python or JS to orchestrate the pipeline (call agent → pass output → call agent again)
- [ ] Input source: **start with blog posts/articles** (plain text, no transcript-fetching hassle). Add YouTube transcripts later only if time allows
- [ ] A way to save/export agent trajectories (logs of each step, tool calls, retries)
- [ ] Git repo to hold code, README, changelog

---

## 4. Evaluation Plan

- **Primary metric:** Does the generated exercise correctly test the concept taught in the source material? (Yes/No or 1–5 rating)
- **Test set:** 10 tutorials you've already watched/read (so you know the "ground truth" concept)
- Run **both baseline and agent solution** on all 10
- Include **1 hard case** — e.g. a video covering multiple concepts at once, or a vague/rambling tutorial
- Score each on:
  - Relevance (does exercise match the video's actual content?)
  - Correctness (are the test cases actually valid/solvable?)
  - Would you personally use this to practice?
- Optional: get 1–2 other engineers to blind-rate baseline vs. agent output

---

<!-- ! here  -->
## 5. Day-by-Day Roadmap (3-day sprint)

### Day 1 — Build the core pipeline
- [ ] Pick your coding agent + confirm scripting/looping works
- [ ] Collect 10 test tutorials (blog posts/articles you know well)
- [ ] Build baseline (single-prompt version) — get it working end-to-end first
- [ ] Build Step 1: concept extraction
- [ ] Build Step 2: exercise generation
- [ ] Save first working trajectory logs

### Day 2 — Add the "agentic" layers + evaluate
- [ ] Build Step 3: test case generation
- [ ] Build Step 4: self-verification (agent solves its own exercise)
- [ ] Run baseline + agent solution across all 10 test cases
- [ ] Score results, fill in the Improvement Changelog table (see below)
- [ ] Identify your "hard case" and what it revealed
- [ ] Start writing README (user, bottleneck, why it matters)

### Day 3 — Polish, document, record, submit
- [ ] Finish README + Improvement Changelog + Hot Take
- [ ] Write Reproduction Guide (clean-env setup, exact commands, expected output, versions, runtime/cost)
- [ ] Record solution video (≤5 min): problem → baseline → full run → comparison → changelog highlights → biggest win → one thing you cut
- [ ] Package agent trajectories (clean, labeled, easy to follow)
- [ ] Final check against submission checklist (below)
- [ ] Submit

---

## 6. Improvement Changelog Template

| Stage | What you tried & why | Evidence | Decision / Learning |
|---|---|---|---|
| Baseline | Single prompt: "generate a practice problem from this transcript" | [result] | Starting point |
| Iteration 1 | Added concept-extraction step before generating exercise | [result] | kept / revised / removed |
| Iteration 2 | Added test-case generation | [result] | kept / revised / removed |
| Iteration 3 | Added self-verification (agent solves its own exercise) | [result] | kept / revised / removed |
| Final | Combined everything that worked | [result] | Main contribution identified |

---

## 7. Final Submission Checklist

- [ ] **Code + README + Changelog** — README explains user + bottleneck + value; changelog complete; ends with main failure mode + hot take
- [ ] **Reproduction Guide** — clean-env setup, exact commands (solution, baseline, eval), data needed, expected output, versions, runtime/cost
- [ ] **Solution video** (≤5 min)
- [ ] **Agent trajectories** for every agent used, labeled and easy to follow
- [ ] Credentials/private info removed from submission
- [ ] Every claim tied to evidence you're including
- [ ] Confirm reproducibility from a clean environment (test it yourself if possible)

---

## 8. Scoring Reference (where points come from)

| Criterion | Points | Focus |
|---|---|---|
| Agent Solution & Engineering | 30 | Purposeful design choices (steps 1–4 above) |
| End-to-End Quality | 20 | Output should look "real," not obviously AI-generated |
| Problem & User Value | 15 | Clear user, clear bottleneck |
| Measured Improvement | 15 | Baseline vs. agent, backed by evidence |
| Reproducibility | 15 | Clean-env instructions actually work |
| Hot Take / Insights | 5 | One real lesson from a failure mode |