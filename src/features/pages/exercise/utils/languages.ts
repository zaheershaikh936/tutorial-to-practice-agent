const DEFAULT_LANGUAGE = "javascript";

/**
 * Maps free text to Piston's own canonical `language` id (the same ids
 * returned by GET /runtimes) - this is the single source of truth used
 * everywhere: as editor state, in the execute request, and as the key for
 * PISTON_TO_MONACO_LANGUAGE / EDITOR_FILE_NAMES below.
 */
const ALIASES: Record<string, string> = {
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    typescript: "typescript",
    py: "python",
    python: "python",
    java: "java",
    "c#": "csharp",
    csharp: "csharp",
    "c++": "c++",
    cpp: "c++",
    c: "c",
    go: "go",
    golang: "go",
    ruby: "ruby",
    rust: "rust",
    php: "php",
};

/**
 * Maps a free-text language name (e.g. from the concept-extraction step,
 * "Python" or "JS") to Piston's canonical language id, falling back to
 * JavaScript when unrecognized.
 */
export function normalizeEditorLanguage(raw: string | undefined | null): string {
    if (!raw) return DEFAULT_LANGUAGE;
    return ALIASES[raw.trim().toLowerCase()] ?? DEFAULT_LANGUAGE;
}

/** Piston's canonical language id doesn't always match Monaco's - only C++ differs. */
const PISTON_TO_MONACO_LANGUAGE: Record<string, string> = {
    "c++": "cpp",
};

export function toMonacoLanguage(pistonLanguage: string): string {
    return PISTON_TO_MONACO_LANGUAGE[pistonLanguage] ?? pistonLanguage;
}

const EDITOR_FILE_NAMES: Record<string, string> = {
    javascript: "main.js",
    typescript: "main.ts",
    python: "main.py",
    java: "Main.java",
    csharp: "main.cs",
    "c++": "main.cpp",
    c: "main.c",
    go: "main.go",
    ruby: "main.rb",
    rust: "main.rs",
    php: "main.php",
};

export function fileNameFor(pistonLanguage: string): string {
    return EDITOR_FILE_NAMES[pistonLanguage] ?? "main.txt";
}
