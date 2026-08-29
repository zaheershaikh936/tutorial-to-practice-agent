"use client";

import { useState } from "react";
import type { PipelineResult } from "@/features/common/ai-model/pipeline";

export function usePipeline() {
  const [transcript, setTranscript] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  async function runPipeline() {
    if (!transcript.trim() || isRunning) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data as PipelineResult);
    } catch {
      setError("Failed to reach the API");
    } finally {
      setIsRunning(false);
    }
  }

  const complete = Boolean(result);

  return { transcript, setTranscript, runPipeline, isRunning, complete, error, result };
}
