"use client";

import { useState } from "react";
import type { PipelineResult } from "@/features/common/ai-model/pipeline";
import { saveLatestPipelineResult } from "../../../common/db/pipeline-db";
import { useRouter } from "next/navigation";
import { pipelineInputSchema } from "./validation";

export function usePipeline() {
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  /** Posts `text` to /api/pipeline and handles the shared result/error/redirect. */
  async function executePipeline(text: string) {
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    const pipelineResult = data as PipelineResult;
    setResult(pipelineResult);
    saveLatestPipelineResult(pipelineResult).catch((dbError) => {
      console.error("Failed to save pipeline result to IndexedDB", dbError);
    });
    router.push("/exercise");
  }

  async function runPipeline() {
    const validationResult = pipelineInputSchema.safeParse({ message: transcript });
    if (!validationResult.success || isRunning) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      await executePipeline(transcript);
    } catch {
      setError("Failed to reach the API");
    } finally {
      setIsRunning(false);
    }
  }

  /**
   * Fetches a YouTube video's transcript, summarizes it (Poolside), then
   * runs the same Claude pipeline on that summary - one continuous loading
   * state across both network calls.
   */
  async function runFromYoutubeUrl(videoUrl: string) {
    if (!videoUrl.trim() || isRunning) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/youtube-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not fetch that video's transcript");
        return;
      }

      setTranscript(data.topicSummary);
      await executePipeline(data.topicSummary);
    } catch {
      setError("Failed to reach the API");
    } finally {
      setIsRunning(false);
    }
  }

  const complete = Boolean(result);

  return { transcript, setTranscript, runPipeline, runFromYoutubeUrl, isRunning, complete, error, result };
}
