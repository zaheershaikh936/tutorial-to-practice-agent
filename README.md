# Tutorial to Practice Agent

## Demo

https://tutorial-to-practice-agent.vercel.app/exercise

## Who is this for / The Problem

**Who:** Self-learners watching coding tutorials — people who are new to programming, don't have much hands-on experience yet, and are stuck in **tutorial hell**: they've watched dozens of hours of coding videos but still freeze up when asked to write something on their own.

**The bottleneck:** Passive watching ≠ retention. Following along with a tutorial feels like learning — the code runs, the demo works, everything makes sense in the moment — but that understanding is borrowed, not built. Nothing forces you to recall a concept, make a decision, or debug your own mistake, so most of it evaporates the moment the video ends.

**Why it matters:** Learning and doing at the same time works far better than watching alone. If a tutorial's concept never gets exercised through your own hands, it never actually becomes a skill.

## Solution Overview

Paste a YouTube tutorial link (or its transcript), and the app turns it into a hands-on coding exercise instead of a passive video:

1. **Concept extraction** — an LLM step reads the transcript and identifies the single concept actually being taught, rejecting input that isn't a real coding tutorial (song lyrics, recipes, non-technical rambling).
2. **Exercise generation** — a problem statement and starter code are generated that specifically exercise that concept.
3. **Test case generation** — test cases are generated against the exercise so correctness is checkable, not just "read the solution."
4. **Self-verification** — before anything reaches the learner, the agent solves its own exercise against its own tests. If the exercise fails its own tests, it's thrown away rather than shipped.

The result lands in an in-browser Monaco editor with multi-language code execution (via a self-hosted [Piston](https://github.com/engineer-man/piston) instance), so you write and run real code against the generated tests instead of just reading an answer.

## Features

- 🌗 Light/dark mode toggle
- 📝 In-browser live editor — write code and run it against the generated exercise, no local setup
- 💡 Contextual hints rendered alongside the exercise, generated from the same source concept
- ✅ Auto-generated test cases per exercise, with pass/fail results shown against your own solution

## Improvement Changelog

| Stage | What you tried & why | Evidence | Decision |
|---|---|---|---|
| Baseline | Single prompt: "generate a practice problem from this transcript" | Generic exercise, no test cases, sometimes unrelated to the actual video content | Established starting point — clearly not good enough |
| Iteration 1 | Split into a 4-step pipeline (extract concept → generate exercise → generate tests → self-verify) instead of one prompt | Exercises became specific to the exact concept taught, not generic | Kept — big improvement in relevance |
| Iteration 2 | Added a self-verification step where the agent solves its own exercise before showing it | Caught real bugs — e.g. an early React `useEffect` exercise where a test gap let a wrong solution pass | Kept — this is the strongest engineering point |
| Iteration 3 | Added a Monaco code editor + Piston execution so users can actually write and run code | Turned static text output into a real, usable tool | Kept — big jump in "would a person actually use this" |
| Iteration 4 | Added YouTube URL → transcript fetch (instead of only pasting text) | Removed friction — user can just paste a video link | Kept — but hit real infra issues (mixed content, CORS) that took real debugging to solve |
| Final | Combined all of the above | Working end-to-end app: paste video → get a verified exercise → code in browser → run tests | Main contribution: the self-verification step is what makes exercises trustworthy |

## Evaluation Results

The evaluation harness (`evaluation/evaluate.ts`) runs the exact same test cases against the **baseline** pipeline (single-prompt, branch `feat/baseline-pipeline`) and the **advanced** pipeline (this branch's 4-step + self-verification + preflight validation), using real API calls, and reports actual measured differences — no invented numbers.

`evaluation/test-cases.json` defines **13 test cases** across five categories: normal (4), edge (3), invalid/off-topic (3), ambiguous (2), and duplicate (1) — designed to be fair to both implementations, not biased toward the advanced one.

> **Status:** the committed `evaluation/results.json` reflects a partial 2-case smoke-test run (`EVAL_LIMIT=2`), not the full 13-case suite. A full run against all 13 cases is pending — this section will be updated with those numbers.
>
> From the 2-case run (`normal-js-two-pointer`, `edge-just-under-boundary`) so far: the baseline completed both cases (2/2), while the advanced pipeline correctly rejected the sub-30-word edge case via preflight validation before spending an API call on it — a real robustness difference, though it currently scores as a "failure" in the raw success-rate metric since that metric doesn't yet distinguish "correctly rejected bad input" from "broke." That's worth accounting for when the full run's numbers come in, rather than reading the raw success-rate delta at face value.

Metrics captured per run: success rate, verified-success rate (self-verification `all_passed`), average/p95 latency, external LLM call count, retries, preflight rejections, schema-validation failures, and verification failures caught before shipping.

## Color Reference

Defined as CSS variables in [`src/app/globals.css`](src/app/globals.css); dark mode swaps the same variable names via `.dark`.

| Color | Light mode | Usage |
|---|---|---|
| Background | `oklch(0.975 0.012 85)` | Page background |
| Foreground | `oklch(0.19 0.025 260)` | Default text |
| Primary | `oklch(0.28 0.06 260)` | Primary buttons/actions |
| Secondary | `oklch(0.94 0.018 85)` | Secondary surfaces |
| Accent | `oklch(0.72 0.14 65)` | Highlighted UI elements |
| Brand | `oklch(0.72 0.2 352.53)` | Brand-colored accents |
| Destructive | `oklch(0.577 0.245 27.325)` | Errors / destructive actions |
| Border | `oklch(0.922 0 0)` | Borders/dividers |

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file (see [`.env.example`](.env.example)):

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Main model key used by the exercise-generation pipeline (any OpenRouter model works; this project used Anthropic Claude Sonnet 5) |
| `OPENROUTER_API_KEY_POOLSIDE` | Cheaper key for simple work, using the free Poolside: Laguna S 2.1 model |

Both are OpenRouter API keys — get a free one at [openrouter.ai](https://openrouter.ai) and pick a free model (like Poolside: Laguna S 2.1) if you don't want to spend credits.

## Installation

Install with npm:

```bash
npm install
```

## Run Locally

Clone the project:

```bash
git clone https://github.com/zaheershaikh936/tutorial-to-practice-agent.git
```

Go to the project directory:

```bash
cd tutorial-to-practice-agent
```

Install dependencies:

```bash
npm install
```

Add your environment variables (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env.local
```

Start the dev server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Deployment

This project is deployed on [Vercel](https://vercel.com) (Next.js's own platform, zero extra config needed). To deploy your own copy:

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo directly in the Vercel dashboard for automatic deploys on push. Either way, add `OPENROUTER_API_KEY` (and `OPENROUTER_API_KEY_POOLSIDE` if used) as environment variables in the Vercel project settings — they won't be picked up from `.env.local` in production.

## Reproduction Guide

### Clean-environment setup

- **Node:** v22.x (no `.nvmrc`/`engines` is pinned in `package.json`; this was built and run on Node 22)
- **Clone + install:** see [Run Locally](#run-locally)
- **API keys:** `OPENROUTER_API_KEY` (required), `OPENROUTER_API_KEY_POOLSIDE` (optional) — see [Environment Variables](#environment-variables)
- **Piston URL:** not an env var — the code-execution endpoint is a hardcoded constant, `API_BASE_URLS.piston` in [`src/features/lib/http/clients.ts`](src/features/lib/http/clients.ts), currently pointed at a self-hosted Piston instance. To reproduce with your own instance (or the public `emkc.org` Piston API), edit that constant.

### Exact commands

| What | Command | Notes |
|---|---|---|
| Run the current ("advanced") solution | `npm run dev` | http://localhost:3000 |
| Run the baseline solution | `npm run baseline` (prints the exact command) — or manually: `git worktree add evaluation/.baseline-worktree feat/baseline-pipeline` (skip if that folder already exists — `npm run evaluate` creates it automatically), then `cd evaluation/.baseline-worktree && npm install && npm run dev` | Baseline lives on its own branch, not a flag. Git won't let the same branch be checked out into two worktrees, so reuse `evaluation/.baseline-worktree` rather than adding a second one if you've already run `npm run evaluate` once |
| Run the evaluation (baseline vs. advanced, all 13 cases) | `npm run evaluate` | Real LLM calls against both implementations, sequentially |
| Run the evaluation (quick smoke test) | `EVAL_LIMIT=2 npm run evaluate` | First 2 cases only |

### Expected output

`npm run evaluate` prints a per-case progress line as it goes (`[baseline] <case-id> ... ok`, `[advanced] <case-id> ... failed (preflight_rejected)`, etc.), then a `Frontier Engineering Evaluation` report with separate BASELINE and ADVANCED blocks (success rate, verified-success rate, average/p95 latency, external LLM call count, retries, preflight rejections, verification catches) followed by an IMPROVEMENT block showing the deltas between them. The same data is written machine-readably to `evaluation/results.json`.

### Versions used + approximate runtime/cost

- **Versions:** Node v22.x, Next.js 16.3.3, model `anthropic/claude-opus-5` by default via OpenRouter (override with the `CLAUDE_MODEL` env var; `AI_PROVIDER` selects the provider)
- **Runtime:** from the recorded 2-case run, individual pipeline calls took ~47s–110s each (baseline avg ~93s/case; advanced avg ~47s/case, pulled down by the one case that was preflight-rejected with 0 API calls). The full 13-case suite runs both implementations sequentially per case, so budget roughly 20–40+ minutes for `npm run evaluate` with no `EVAL_LIMIT`.
- **Cost:** not tracked by the harness — deliberately, per `evaluation/results.json`'s own notes, rather than fabricated. Each completed case makes up to 4 real LLM calls per implementation; check actual spend in your OpenRouter dashboard after a run.

## Optimizations

- **Preflight input validation** (`assertValidTranscript`) rejects input that's too short to be a real transcript *before* making any API call — the baseline spends a full pipeline call on bad input, the advanced pipeline spends zero (measured: 4 external calls saved on the sub-30-word edge case, see [Evaluation Results](#evaluation-results)).
- **Schema-validated model output with retries** — every LLM step's JSON response is parsed against a Zod schema; malformed output triggers a retry instead of a silently broken exercise reaching the pipeline's next step.
- **Cached pipeline results in IndexedDB** — the 4-step LLM pipeline (which takes tens of seconds) runs once and its result is persisted, so navigating from the home page to the exercise page doesn't re-run it.
- **Shared HTTP clients per API** (`getHttpClient`) — one axios instance per external service (Piston, transcript API), reused across calls instead of constructed per request.

## Main Failure Mode & Hot Take

The hardest bugs in this project weren't in the AI pipeline — they were in plain HTTP.

The in-browser code editor calls a self-hosted Piston instance directly from the client to execute code. It was originally configured as `http://…`, which worked fine locally but silently broke once the app was served over HTTPS: browsers block a plaintext `http://` request from an `https://` page as mixed content, with no useful error surfaced to the user — code execution just seemed to hang. The fix was one line (`API_BASE_URLS.piston` → `https://…`, [26f9b8c](../../commit/26f9b8c)), but finding it meant realizing the failure was a browser security policy, not an application bug.

The YouTube transcript fetch had the mirror-image problem: calling the third-party transcript service directly from the browser would have hit CORS, since that service isn't meant to be called cross-origin from arbitrary frontends. The fix there was architectural rather than one line — route it through the app's own Next.js API route (`/api/youtube-transcript`) so the third-party call happens server-to-server, and the browser only ever talks to same-origin endpoints.

**Hot take:** for a project like this, the AI pipeline is the part everyone assumes will be the hard part — and it mostly behaved once the prompts and schemas were right. The actual time sink was the boring transport layer: whether a call happens client-side or server-side determines which browser security model applies to it, and that decision has to be made per external API, not once for the whole app.

## Authors

- [@zaheershaikh936](https://github.com/zaheershaikh936)
