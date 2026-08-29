import type { PistonLanguageResType } from "./types";

function compareVersions(a: string, b: string): number {
    const partsA = a.split(".").map(Number);
    const partsB = b.split(".").map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
        if (diff !== 0) return diff;
    }
    return 0;
}

/**
 * Picks the newest available Piston runtime version for `language`
 * (Piston's canonical language id, e.g. "python", "c++"). Some languages
 * have multiple runtimes (e.g. two "javascript" entries for node vs deno) -
 * the newest version wins.
 */
export function resolvePistonVersion(
    languages: PistonLanguageResType[],
    language: string,
): string | undefined {
    const matches = languages.filter((item) => item.language === language);
    if (matches.length === 0) return undefined;

    return matches.reduce((best, current) =>
        compareVersions(current.version, best.version) > 0 ? current : best,
    ).version;
}
