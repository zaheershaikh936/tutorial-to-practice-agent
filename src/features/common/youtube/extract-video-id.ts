const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Pulls an 11-char YouTube video id out of any common URL shape
 * (watch?v=, youtu.be/, /shorts/, /embed/), or accepts a bare id directly.
 * Returns null when nothing recognizable is found.
 */
export function extractYoutubeVideoId(input: string): string | null {
    const trimmed = input.trim();
    if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;

    let url: URL;
    try {
        url = new URL(trimmed);
    } catch {
        return null;
    }

    if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") {
        const id = url.pathname.slice(1).split("/")[0];
        return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (url.hostname.endsWith("youtube.com")) {
        if (url.pathname === "/watch") {
            const id = url.searchParams.get("v");
            return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
        }
        const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (shortsMatch) return shortsMatch[1];
        const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];
    }

    return null;
}
