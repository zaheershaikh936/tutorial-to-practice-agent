"use client"
import { CircleHelp, Sparkles } from "lucide-react"
import ProblemStatement from "./problem-statement"
import { usePipelineResult } from "../hooks/use-pipeline-result"


const ExerciseComponent = () => {
    const pipelineResult = usePipelineResult()
    const exercise = pipelineResult?.exercise
    return (
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

            <ProblemStatement problem_statement={exercise?.problem_statement} />
        </div>
    )
}
export default ExerciseComponent
