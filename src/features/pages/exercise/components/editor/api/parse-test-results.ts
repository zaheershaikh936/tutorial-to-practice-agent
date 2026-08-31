export interface TestRunResult {
    name: string;
    pass: boolean;
    message?: string;
}

const MARKER_PATTERN = /__TEST_RESULTS_START__\n([\s\S]*?)\n__TEST_RESULTS_END__/;

/**
 * Extracts the JSON block jest-shim.ts prints between its markers.
 * Returns null when the markers aren't present (i.e. this was a plain
 * Run, not a Run Tests) - callers should fall back to raw stdout then.
 */
export function parseTestResults(stdout: string): TestRunResult[] | null {
    const match = stdout.match(MARKER_PATTERN);
    if (!match) return null;
    try {
        return JSON.parse(match[1]) as TestRunResult[];
    } catch {
        return null;
    }
}
