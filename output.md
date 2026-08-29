Step 1 — Concept Extraction
{
  "core_concept": "Using React's useEffect hook to handle component side effects, controlled by a dependency array and an optional cleanup return function",
  "prerequisites": [
    "React function components and JSX",
    "Basic React hooks usage (e.g. useState) and the rules of hooks",
    "JavaScript arrow functions, closures, and array literals",
    "General idea of side effects vs. pure rendering (data fetching, timers, DOM manipulation)"
  ],
  "language": "JavaScript (React)",
  "difficulty": "intermediate",
  "multiple_concepts_flag": false,
  "multiple_concepts_note": "Cleanup functions and the dependency array are presented as sub-parts of the single useEffect concept rather than separate concepts; the class lifecycle methods are mentioned only as an analogy."
}
Step 2 — Exercise Generation
{
  "title": "CountdownTimer: Effects, Dependencies, and Cleanup",
  "problem_statement": "Build a React function component `CountdownTimer({ duration, onComplete })` that displays a number of seconds remaining and counts it down to 0, one tick per second. It must (a) reset the displayed count whenever the `duration` prop changes, (b) run exactly one live interval at a time — no stacked or leaked intervals when `duration` changes or the component unmounts, (c) stop ticking at 0 and call `onComplete()` exactly once when it reaches 0, and (d) keep `document.title` in sync with the current remaining seconds (e.g. `\"3s left\"`). Render the remaining seconds as the text content of a `<div data-testid=\"countdown\">`.",
  "starter_code": "import React, { useState, useEffect } from 'react';\n\nexport default function CountdownTimer({ duration, onComplete }) {\n  const [secondsLeft, setSecondsLeft] = useState(duration);\n\n  // TODO 1: When the `duration` prop changes, reset `secondsLeft` to the new duration.\n\n  // TODO 2: Start a 1-second interval that decrements `secondsLeft`.\n  //         Make sure only one interval is ever active, and that it is\n  //         torn down on unmount / before the effect re-runs.\n  //         It should not keep ticking below 0.\n\n  // TODO 3: Keep document.title in sync with the remaining seconds,\n  //         e.g. `${secondsLeft}s left`.\n\n  // TODO 4: Call onComplete() exactly once when the countdown hits 0.\n\n  return <div data-testid=\"countdown\">{secondsLeft}</div>;\n}\n",
  "hint": "Each separate concern deserves its own `useEffect` with its own dependency array — ask yourself for each one: \"which values, when changed, should make this effect run again?\" For the interval, remember that a `setInterval` created inside an effect keeps running after that effect's render is gone unless the effect *returns* a teardown function; also consider whether you can update state from the previous value (updater form) so the interval effect doesn't need `secondsLeft` in its dependencies.",
  "concept_tested": "useEffect for side effects: choosing correct dependency arrays and returning cleanup functions to avoid stale/leaked effects"
}
Step 3 — Test Case Generation
{
  "test_code": "import React from 'react';\nimport { render, screen, act, cleanup } from '@testing-library/react';\nimport CountdownTimer from './CountdownTimer';\n\nbeforeEach(() => {\n  jest.useFakeTimers();\n  document.title = '';\n});\n\nafterEach(() => {\n  cleanup();\n  jest.clearAllTimers();\n  jest.useRealTimers();\n});\n\nconst advance = (ms) =>\n  act(() => {\n    jest.advanceTimersByTime(ms);\n  });\n\nconst display = () => screen.getByTestId('countdown').textContent;\n\ntest('renders the initial duration before any tick', () => {\n  render(<CountdownTimer duration={5} onComplete={jest.fn()} />);\n  expect(display()).toBe('5');\n});\n\ntest('decrements exactly one second per tick', () => {\n  render(<CountdownTimer duration={5} onComplete={jest.fn()} />);\n\n  advance(1000);\n  expect(display()).toBe('4');\n\n  advance(1000);\n  expect(display()).toBe('3');\n\n  advance(2000);\n  expect(display()).toBe('1');\n});\n\ntest('stops at 0 and calls onComplete exactly once', () => {\n  const onComplete = jest.fn();\n  render(<CountdownTimer duration={2} onComplete={onComplete} />);\n\n  advance(2000);\n  expect(display()).toBe('0');\n  expect(onComplete).toHaveBeenCalledTimes(1);\n\n  advance(5000);\n  expect(display()).toBe('0');\n  expect(onComplete).toHaveBeenCalledTimes(1);\n});\n\ntest('resets the displayed count when the duration prop changes', () => {\n  const { rerender } = render(<CountdownTimer duration={5} onComplete={jest.fn()} />);\n\n  advance(2000);\n  expect(display()).toBe('3');\n\n  rerender(<CountdownTimer duration={10} onComplete={jest.fn()} />);\n  expect(display()).toBe('10');\n});\n\ntest('does not stack intervals when duration changes (still exactly one decrement per second)', () => {\n  const { rerender } = render(<CountdownTimer duration={5} onComplete={jest.fn()} />);\n\n  advance(1000);\n  expect(display()).toBe('4');\n\n  rerender(<CountdownTimer duration={8} onComplete={jest.fn()} />);\n  expect(display()).toBe('8');\n\n  advance(1000);\n  expect(display()).toBe('7');\n\n  rerender(<CountdownTimer duration={4} onComplete={jest.fn()} />);\n  advance(1000);\n  expect(display()).toBe('3');\n\n  expect(jest.getTimerCount()).toBe(1);\n});\n\ntest('clears its interval on unmount', () => {\n  const { unmount } = render(<CountdownTimer duration={5} onComplete={jest.fn()} />);\n\n  advance(1000);\n  expect(jest.getTimerCount()).toBe(1);\n\n  unmount();\n  expect(jest.getTimerCount()).toBe(0);\n});\n\ntest('keeps document.title in sync with remaining seconds', () => {\n  const { rerender } = render(<CountdownTimer duration={3} onComplete={jest.fn()} />);\n  expect(document.title).toBe('3s left');\n\n  advance(1000);\n  expect(document.title).toBe('2s left');\n\n  advance(2000);\n  expect(document.title).toBe('0s left');\n\n  rerender(<CountdownTimer duration={7} onComplete={jest.fn()} />);\n  expect(document.title).toBe('7s left');\n});\n\ntest('never goes negative for a zero duration', () => {\n  render(<CountdownTimer duration={0} onComplete={jest.fn()} />);\n  expect(display()).toBe('0');\n\n  advance(3000);\n  expect(display()).toBe('0');\n  expect(document.title).toBe('0s left');\n});\n",
  "test_case_notes": [
    {
      "case": "renders the initial duration before any tick",
      "checks": "Typical case: initial state is seeded from the duration prop and rendered in the countdown div."
    },
    {
      "case": "decrements exactly one second per tick",
      "checks": "One decrement per 1000ms, so the interval period and update logic are correct."
    },
    {
      "case": "stops at 0 and calls onComplete exactly once",
      "checks": "Countdown halts at 0 and onComplete fires a single time even after extra time passes (guards against repeated calls on every render/tick)."
    },
    {
      "case": "resets the displayed count when the duration prop changes",
      "checks": "duration is in the effect's dependency array so state resets instead of staying at the stale initial value from useState."
    },
    {
      "case": "does not stack intervals when duration changes",
      "checks": "Fails for a naive effect with no cleanup / wrong deps: leaked intervals would decrement more than once per second and jest.getTimerCount() would exceed 1."
    },
    {
      "case": "clears its interval on unmount",
      "checks": "The effect returns a cleanup function that clears the interval, leaving zero pending timers after unmount."
    },
    {
      "case": "keeps document.title in sync with remaining seconds",
      "checks": "Side-effect-only effect updates document.title on every count change, including after a duration prop change."
    },
    {
      "case": "never goes negative for a zero duration",
      "checks": "Edge case: duration 0 renders 0 and the tick logic never produces negative numbers."
    }
  ]
}
Step 4 — Self-Verification
{
  "solution_code": "import React, { useState, useEffect, useRef } from 'react';\n\nexport default function CountdownTimer({ duration, onComplete }) {\n  const [secondsLeft, setSecondsLeft] = useState(duration);\n  const completedRef = useRef(false);\n  const onCompleteRef = useRef(onComplete);\n\n  // Keep the latest callback in a ref so it is NOT an effect dependency\n  // (parents in the tests pass a fresh jest.fn() on every render).\n  useEffect(() => {\n    onCompleteRef.current = onComplete;\n  });\n\n  // (a) Reset the displayed count whenever `duration` changes.\n  useEffect(() => {\n    setSecondsLeft(duration);\n    completedRef.current = false;\n  }, [duration]);\n\n  // (b) Exactly one live interval; cleaned up before re-run and on unmount.\n  //     Depending on `secondsLeft` means the effect also stops itself at 0.\n  useEffect(() => {\n    if (secondsLeft <= 0) return undefined;\n    const id = setInterval(() => {\n      setSecondsLeft((s) => Math.max(0, s - 1));\n    }, 1000);\n    return () => clearInterval(id);\n  }, [secondsLeft]);\n\n  // (d) Keep document.title in sync.\n  useEffect(() => {\n    document.title = `${secondsLeft}s left`;\n  }, [secondsLeft]);\n\n  // (c) Call onComplete exactly once when we hit 0.\n  useEffect(() => {\n    if (secondsLeft === 0 && !completedRef.current) {\n      completedRef.current = true;\n      if (onCompleteRef.current) onCompleteRef.current();\n    }\n  }, [secondsLeft]);\n\n  return <div data-testid=\"countdown\">{secondsLeft}</div>;\n}\n",
  "test_results": [
    {
      "case": "renders the initial duration before any tick",
      "pass": true
    },
    {
      "case": "decrements exactly one second per tick",
      "pass": true
    },
    {
      "case": "stops at 0 and calls onComplete exactly once",
      "pass": true
    },
    {
      "case": "resets the displayed count when the duration prop changes",
      "pass": true
    },
    {
      "case": "does not stack intervals when duration changes (still exactly one decrement per second)",
      "pass": true
    },
    {
      "case": "clears its interval on unmount",
      "pass": true
    },
    {
      "case": "keeps document.title in sync with remaining seconds",
      "pass": true
    },
    {
      "case": "never goes negative for a zero duration",
      "pass": true
    }
  ],
  "all_passed": true,
  "concept_bypassable": false,
  "notes": "Solvable as written; my reference solution satisfies all 8 cases. Reasoning on the trickier ones: (1) `render`/`rerender`/`unmount` from RTL are act-wrapped, so the [duration] reset effect flushes and re-renders synchronously — hence '10' / '8' / '7s left' appear immediately after rerender without advancing timers. (2) During `advance(2000)` the interval callback fires twice (state flushes are deferred to act exit, or the effect re-installs the interval at the same fake-time offset), so 3 -> 1 and 2 -> 0 both hold regardless of flush timing. (3) getTimerCount()===1 holds because the [secondsLeft] effect always clears the previous interval before installing a new one; after reaching 0 no interval is installed, and after unmount cleanup leaves 0.\n\nDesign notes / minor risks (not failures):\n- The two getTimerCount() assertions are environment-sensitive: if React's scheduler ever falls back to setTimeout instead of MessageChannel under jsdom + fake timers, an extra fake timer could be counted and these would fail for ANY correct solution. In standard jsdom (MessageChannel present) this is fine.\n- Ambiguity worth noting for the learner: with duration={0} the statement's 'call onComplete when it reaches 0' implies an immediate call on mount. No test asserts this either way, so both interpretations pass.\n- Another ambiguity: a naive solution that puts `onComplete` in the effect dependency array will call it more than once on a rerender (tests pass fresh jest.fn()s), but no test catches that specific bug — the 'exactly once' test never rerenders. Consider adding a rerender-after-completion assertion on the same onComplete mock to harden it.\n- Concept is genuinely required: passing (b) and the unmount test forces a cleanup function, and (a) plus the no-stacking test forces correct dependency arrays. There is no realistic non-useEffect path in a function component here."
}