"use client"
import { getLatestPipelineResult } from "@/features/common/db/pipeline-db"
import type { PipelineResult } from "@/features/common/ai-model/pipeline"
import { ChevronDown, CircleHelp, Code2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

const ExerciseComponent = () => {
    const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
    useEffect(() => {
        getLatestPipelineResult().then((result) => {
            setPipelineResult(result)
        })
    }, [])

    const exercise = pipelineResult?.exercise

    return (
        <div className="w-full ">
            <div className="w-full">
                <section className="rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-6 py-6 sm:px-8">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-accent">
                                    <CircleHelp
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>

                                Your exercise
                            </div>

                            {exercise?.concept_tested && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                                    <Sparkles aria-hidden="true" className="size-3.5" />
                                    {exercise.concept_tested}
                                </span>
                            )}
                        </div>

                        <h1 className="text-balance text-md font-semibold tracking-tight sm:text-xl ">
                            {exercise?.title}
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-muted-foreground">
                            {exercise?.problem_statement}
                        </p>
                    </div>

                    <div className="px-6 py-6 sm:px-8">
                        <div className="overflow-hidden rounded-xl border border-border bg-background">
                            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                                <Code2
                                    aria-hidden="true"
                                    className="size-4 text-muted-foreground"
                                />

                                <span className="font-mono text-xs text-muted-foreground">
                                    Starter code
                                </span>
                            </div>

                            <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-6 text-foreground">
                                {exercise?.starter_code}
                            </pre>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
export default ExerciseComponent
