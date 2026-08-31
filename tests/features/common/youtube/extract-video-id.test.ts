import { describe, expect, it } from "vitest";
import { extractYoutubeVideoId } from "@/features/common/youtube/extract-video-id";

describe("extractYoutubeVideoId", () => {
    it("extracts the id from a watch?v= URL", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=PgUXiprlg1k")).toBe("PgUXiprlg1k");
    });

    it("extracts the id from a watch?v= URL with extra query params", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=PgUXiprlg1k&t=30s")).toBe("PgUXiprlg1k");
    });

    it("extracts the id from a youtu.be short link", () => {
        expect(extractYoutubeVideoId("https://youtu.be/PgUXiprlg1k")).toBe("PgUXiprlg1k");
    });

    it("extracts the id from a /shorts/ URL", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/shorts/PgUXiprlg1k")).toBe("PgUXiprlg1k");
    });

    it("extracts the id from an /embed/ URL", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/embed/PgUXiprlg1k")).toBe("PgUXiprlg1k");
    });

    it("accepts a bare 11-char id directly", () => {
        expect(extractYoutubeVideoId("PgUXiprlg1k")).toBe("PgUXiprlg1k");
    });

    it("trims surrounding whitespace on a bare id", () => {
        expect(extractYoutubeVideoId("  PgUXiprlg1k  ")).toBe("PgUXiprlg1k");
    });

    it("returns null for a channel URL (no video id)", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/@mkbhd")).toBeNull();
    });

    it("returns null for a non-YouTube URL", () => {
        expect(extractYoutubeVideoId("https://example.com/watch?v=PgUXiprlg1k")).toBeNull();
    });

    it("returns null for a malformed URL", () => {
        expect(extractYoutubeVideoId("not a url at all")).toBeNull();
    });

    it("returns null for an empty string", () => {
        expect(extractYoutubeVideoId("")).toBeNull();
    });

    it("returns null for a watch URL missing the v param", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/watch")).toBeNull();
    });

    it("returns null when the v param isn't a valid 11-char id", () => {
        expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=short")).toBeNull();
    });
});
