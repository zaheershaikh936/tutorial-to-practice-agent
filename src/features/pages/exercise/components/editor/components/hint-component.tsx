import { usePipelineResult } from "@/features/pages/exercise/hooks/use-pipeline-result"
import MarkdownComponent from "./common/react-makdown-compoent"
import { Sparkles } from "lucide-react"

export const HintComponent = () => {
    const pipelineResult = usePipelineResult()
    const hints = pipelineResult?.exercise?.hint
    if (!hints) return null
    return (
        <section className="rounded-2xl border border-border bg-card shadow-sm mx-auto w-full h-fit mt-5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground">
                <span className="flex size-7 items-center justify-center rounded-lg bg-accent">
                    <Sparkles aria-hidden="true" className="size-4" />
                </span>

                Hint
            </div>
            <MarkdownComponent text={hints} />
        </section>
    )
}