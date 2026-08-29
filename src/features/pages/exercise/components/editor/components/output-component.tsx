import { Check, Code2, LoaderCircle, X } from "lucide-react"
import type { OutputComponentPropt } from "../api/types"
import { parseTestResults } from "../api/parse-test-results"


export const OutputComponent = ({ result, isRunning, runError, testCaseNotes }: OutputComponentPropt) => {
    const testResults = result ? parseTestResults(result.run.stdout) : null

    return <div className="px-6 py-6 sm:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Code2 aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                    {testResults ? "Test Results" : "Output"}
                </span>
                {testResults && (
                    <span className="ml-auto text-xs text-muted-foreground">
                        {testResults.filter((t) => t.pass).length}/{testResults.length} passed
                    </span>
                )}
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

                {!isRunning && !runError && testResults && (
                    <ul className="flex flex-col gap-2">
                        {testResults.map((testResult, index) => {
                            const note = testCaseNotes?.[index]
                            return (
                                <li key={index} className="flex items-start gap-2">
                                    {testResult.pass ? (
                                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                    ) : (
                                        <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
                                    )}
                                    <div className="flex-1">
                                        <p className={testResult.pass ? "text-foreground" : "text-destructive"}>
                                            {note?.case ?? testResult.name}
                                        </p>
                                        {note?.checks && (
                                            <p className="text-xs text-muted-foreground">{note.checks}</p>
                                        )}
                                        {!testResult.pass && testResult.message && (
                                            <p className="text-xs text-destructive">{testResult.message}</p>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}

                {!isRunning && !runError && !testResults && result && (
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
