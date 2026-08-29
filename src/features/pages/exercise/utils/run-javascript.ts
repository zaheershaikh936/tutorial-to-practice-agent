export interface RunLogEntry {
    level: "log" | "warn" | "error";
    text: string;
}

export interface RunResult {
    logs: RunLogEntry[];
    error: string | null;
}

/**
 * Runs in a Worker (not the main thread) so a user's infinite loop hangs
 * only the worker - which we terminate on timeout - not the page.
 * `module`/`exports`/`require` are shimmed since generated starter code
 * ends with a CommonJS `module.exports = fn;` line.
 */
const WORKER_SOURCE = `
self.onmessage = (event) => {
  const code = event.data;
  const logs = [];

  const stringify = (value) => {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const record = (level) => (...args) => {
    logs.push({ level, text: args.map(stringify).join(" ") });
  };

  self.console = {
    log: record("log"),
    info: record("log"),
    warn: record("warn"),
    error: record("error"),
  };

  const module = { exports: {} };
  const exports = module.exports;
  const require = () => {
    throw new Error("require() is not available in this sandbox");
  };

  try {
    const run = new Function("module", "exports", "require", code);
    run(module, exports, require);
    self.postMessage({ type: "done", logs });
  } catch (err) {
    self.postMessage({
      type: "error",
      logs,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
`;

const RUN_TIMEOUT_MS = 5000;

export function runJavaScript(code: string): Promise<RunResult> {
    return new Promise((resolve) => {
        const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);

        const finish = (result: RunResult) => {
            clearTimeout(timer);
            worker.terminate();
            URL.revokeObjectURL(url);
            resolve(result);
        };

        const timer = setTimeout(() => {
            finish({
                logs: [],
                error: `Execution timed out after ${RUN_TIMEOUT_MS / 1000}s - check for an infinite loop.`,
            });
        }, RUN_TIMEOUT_MS);

        worker.onmessage = (event) => {
            const data = event.data as { type: "done" | "error"; logs: RunLogEntry[]; message?: string };
            finish({
                logs: data.logs,
                error: data.type === "error" ? (data.message ?? "Unknown error") : null,
            });
        };

        worker.onerror = (event) => {
            finish({ logs: [], error: event.message || "Worker error" });
        };

        worker.postMessage(code);
    });
}
