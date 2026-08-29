export interface EditorLanguageOption {
    value: string;
    label: string;
}

export const editorLanguages: EditorLanguageOption[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
];

const DEFAULT_LANGUAGE = "javascript";

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
    "c++": "cpp",
    cpp: "cpp",
    c: "c",
    go: "go",
    golang: "go",
    ruby: "ruby",
    rust: "rust",
    php: "php",
};

/**
 * Maps a free-text language name (e.g. from the concept-extraction step,
 * "Python" or "JS") to a Monaco language id, falling back to JavaScript
 * when unrecognized.
 */
export function normalizeEditorLanguage(raw: string | undefined | null): string {
    if (!raw) return DEFAULT_LANGUAGE;
    return ALIASES[raw.trim().toLowerCase()] ?? DEFAULT_LANGUAGE;
}
