import { describe, expect, it } from "vitest";
import { resolvePistonVersion } from "@/features/pages/exercise/components/editor/api/resolve-runtime";
import type { PistonLanguageResType } from "@/features/pages/exercise/components/editor/api/types";

function runtime(language: string, version: string): PistonLanguageResType {
    return { id: `${language}-v-${version}`, language, version };
}

describe("resolvePistonVersion", () => {
    it("returns the version for a single match", () => {
        const languages = [runtime("python", "3.10.0")];
        expect(resolvePistonVersion(languages, "python")).toBe("3.10.0");
    });

    it("returns undefined when there is no match", () => {
        const languages = [runtime("python", "3.10.0")];
        expect(resolvePistonVersion(languages, "ruby")).toBeUndefined();
    });

    it("picks the newest version when a language has multiple runtimes", () => {
        // Real Piston data: javascript has both a Deno (1.32.3) and Node (18.15.0) runtime.
        const languages = [runtime("javascript", "1.32.3"), runtime("javascript", "18.15.0")];
        expect(resolvePistonVersion(languages, "javascript")).toBe("18.15.0");
    });

    it("compares version segments numerically, not lexicographically", () => {
        // "1.10.0" > "1.2.0" numerically, but "1.10.0" < "1.2.0" as plain strings.
        const languages = [runtime("go", "1.2.0"), runtime("go", "1.10.0")];
        expect(resolvePistonVersion(languages, "go")).toBe("1.10.0");
    });

    it("only matches the exact language id (e.g. c vs c++ stay separate)", () => {
        const languages = [runtime("c", "10.2.0"), runtime("c++", "10.2.0")];
        expect(resolvePistonVersion(languages, "c++")).toBe("10.2.0");
        expect(resolvePistonVersion(languages, "c")).toBe("10.2.0");
    });

    it("returns undefined for an empty runtime list", () => {
        expect(resolvePistonVersion([], "python")).toBeUndefined();
    });
});
