import { describe, expect, it } from "vitest";
import { parseTestResults } from "@/features/pages/exercise/components/editor/api/parse-test-results";

describe("parseTestResults", () => {
    it("parses the JSON block between the markers", () => {
        const stdout = [
            "some program output",
            "__TEST_RESULTS_START__",
            JSON.stringify([{ name: "adds two numbers", pass: true }]),
            "__TEST_RESULTS_END__",
        ].join("\n");

        expect(parseTestResults(stdout)).toEqual([{ name: "adds two numbers", pass: true }]);
    });

    it("parses failing results including the message field", () => {
        const stdout = [
            "__TEST_RESULTS_START__",
            JSON.stringify([{ name: "handles empty input", pass: false, message: "Expected 0 to be 1" }]),
            "__TEST_RESULTS_END__",
        ].join("\n");

        expect(parseTestResults(stdout)).toEqual([
            { name: "handles empty input", pass: false, message: "Expected 0 to be 1" },
        ]);
    });

    it("returns null when the markers are absent (a plain Run, not Run Tests)", () => {
        expect(parseTestResults("just some console.log output")).toBeNull();
    });

    it("returns null when the block between markers isn't valid JSON", () => {
        const stdout = "__TEST_RESULTS_START__\nnot json\n__TEST_RESULTS_END__";
        expect(parseTestResults(stdout)).toBeNull();
    });

    it("returns an empty array when there were zero test cases", () => {
        const stdout = "__TEST_RESULTS_START__\n[]\n__TEST_RESULTS_END__";
        expect(parseTestResults(stdout)).toEqual([]);
    });
});
