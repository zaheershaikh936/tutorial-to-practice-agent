import { describe, expect, it } from "vitest";
import { normalizeEditorLanguage, toMonacoLanguage, fileNameFor } from "@/features/pages/exercise/utils/languages";

describe("normalizeEditorLanguage", () => {
    it.each([
        ["JavaScript", "javascript"],
        ["js", "javascript"],
        ["TypeScript", "typescript"],
        ["Python", "python"],
        ["py", "python"],
        ["Java", "java"],
        ["C#", "csharp"],
        ["csharp", "csharp"],
        ["C++", "c++"],
        ["cpp", "c++"],
        ["C", "c"],
        ["Go", "go"],
        ["golang", "go"],
        ["Ruby", "ruby"],
        ["Rust", "rust"],
        ["PHP", "php"],
    ])("maps %s to %s", (input, expected) => {
        expect(normalizeEditorLanguage(input)).toBe(expected);
    });

    it("is case-insensitive and trims whitespace", () => {
        expect(normalizeEditorLanguage("  PYTHON  ")).toBe("python");
    });

    it("falls back to javascript for an unrecognized language", () => {
        expect(normalizeEditorLanguage("cobol")).toBe("javascript");
    });

    it("falls back to javascript for null/undefined/empty input", () => {
        expect(normalizeEditorLanguage(null)).toBe("javascript");
        expect(normalizeEditorLanguage(undefined)).toBe("javascript");
        expect(normalizeEditorLanguage("")).toBe("javascript");
    });
});

describe("toMonacoLanguage", () => {
    it("maps Piston's c++ to Monaco's cpp", () => {
        expect(toMonacoLanguage("c++")).toBe("cpp");
    });

    it("passes through languages that already match Monaco's id", () => {
        expect(toMonacoLanguage("python")).toBe("python");
        expect(toMonacoLanguage("csharp")).toBe("csharp");
        expect(toMonacoLanguage("rust")).toBe("rust");
    });
});

describe("fileNameFor", () => {
    it.each([
        ["javascript", "main.js"],
        ["typescript", "main.ts"],
        ["python", "main.py"],
        ["java", "Main.java"],
        ["csharp", "main.cs"],
        ["c++", "main.cpp"],
        ["c", "main.c"],
        ["go", "main.go"],
        ["ruby", "main.rb"],
        ["rust", "main.rs"],
        ["php", "main.php"],
    ])("returns %s for %s", (language, expected) => {
        expect(fileNameFor(language)).toBe(expected);
    });

    it("falls back to main.txt for an unrecognized language", () => {
        expect(fileNameFor("cobol")).toBe("main.txt");
    });
});
