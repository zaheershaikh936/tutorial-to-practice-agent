import { LoaderCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorComponent } from "./error";
import { ResultComponent } from "./result";
import { SourceMaterialPropmt } from "../utils/types";

export const SourceMaterialComponent = ({ transcript, setTranscript, runPipeline, isRunning, complete, error, result }: SourceMaterialPropmt) => {
    return (
        <div className="mt-8 rounded-2xl border border-border bg-card p-2 shadow-xl sm:p-3">
            <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
                <Label htmlFor="transcript" className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold">Your source material</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Markdown or plain text
                    </span>
                </Label>
                <Textarea
                    id="transcript"
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="Paste a tutorial transcript or blog post here..."
                    className="mt-4 min-h-40 w-full resize-y rounded-xl border border-input bg-card px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/10"
                />
                <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        {transcript.length > 0
                            ? `${transcript.length} characters ready`
                            : "Your content stays in this workspace."}
                    </p>
                    <Button
                        type="button"
                        onClick={runPipeline}
                        disabled={!transcript.trim() || isRunning}
                        className="h-11 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed">
                        {isRunning ? (
                            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                        ) : (
                            <Play aria-hidden="true" className="size-4 fill-current" />
                        )}
                        {isRunning ? "Running pipeline" : complete ? "Run again" : "Run pipeline"}
                    </Button>
                </div>
            </div>
            {error && <ErrorComponent error={error} />}
            {result && <ResultComponent result={result} />}
        </div>
    )
}