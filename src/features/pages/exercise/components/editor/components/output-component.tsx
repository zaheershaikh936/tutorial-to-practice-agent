import { Code2, LoaderCircle } from "lucide-react"
import type { OutputComponentPropt } from "../api/types"


export const OutputComponent = ({result, isRunning, runError}: OutputComponentPropt) => {
    return <div className="px-6 py-6 sm:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Code2 aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">Output</span>
            </div>

            <div className="max-h-64 overflow-y-auto px-4 py-4 font-mono text-sm leading-6">
                {isRunning && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                        Running...
                    </div>
                )}

                {!isRunning && runError && (
                    <pre className="whitespace-pre-wrap text-destructive">{runError.message}</pre>
                )}

                {!isRunning && !runError && result && (
                    <>
                        {result.run.stdout && (
                            <pre className="whitespace-pre-wrap text-foreground">{result.run.stdout}</pre>
                        )}
                        {result.run.stderr && (
                            <pre className="whitespace-pre-wrap text-destructive">{result.run.stderr}</pre>
                        )}
                        {!result.run.stdout && !result.run.stderr && (
                            <p className="text-muted-foreground">No output.</p>
                        )}
                        {result.run.code !== 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Exited with code {result.run.code}
                            </p>
                        )}
                    </>
                )}

                {!isRunning && !runError && !result && (
                    <p className="text-muted-foreground">Run your code to see output here.</p>
                )}
            </div>
        </div>
    </div>
}