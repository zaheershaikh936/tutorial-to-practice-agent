"use client"

import { useEffect, useState } from "react"
import { getLatestPipelineResult } from "@/features/common/db/pipeline-db"
import type { PipelineResult } from "@/features/common/ai-model/pipeline"

/**
 * Loads the last-saved pipeline result from IndexedDB once on mount.
 * Shared across the exercise page's components (Editor, ExerciseComponent,
 * exercise-page) so each doesn't need its own copy of this fetch.
 */
export function usePipelineResult() {
    const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)

    useEffect(() => {
        getLatestPipelineResult().then(setPipelineResult)
    }, [])

    return pipelineResult
}
