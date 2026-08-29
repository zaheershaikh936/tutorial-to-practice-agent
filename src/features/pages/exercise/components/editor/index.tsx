"use client"
import { useEffect, useRef, useState } from "react"
import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react'
import type { PipelineResult } from "@/features/common/ai-model/pipeline"
import { getLatestPipelineResult } from "@/features/common/db/pipeline-db"

import { editorLanguages, normalizeEditorLanguage } from "../../utils/languages"
import { runJavaScript, type RunLogEntry } from "../../utils/run-javascript"
import { LoaderCircle, Play } from "lucide-react"
import EditorHeader from "./components/editor-header"

const Editor = () => {
    const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
    const [language, setLanguage] = useState("javascript")
    const [isRunning, setIsRunning] = useState(false)
    const [hasRun, setHasRun] = useState(false)
    const [logs, setLogs] = useState<RunLogEntry[]>([])
    const [runError, setRunError] = useState<string | null>(null)

    const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

    useEffect(() => {
        getLatestPipelineResult().then((result) => {
            setPipelineResult(result)
            setLanguage(normalizeEditorLanguage(result?.concept?.language))
        })
    }, [])

    const exercise = pipelineResult?.exercise
    const canRun = language === "javascript"

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor
    }

    async function handleRun() {
        if (!canRun || isRunning) return
        const code = editorRef.current?.getValue() ?? ""

        setIsRunning(true)
        setHasRun(true)
        try {
            const result = await runJavaScript(code)
            setLogs(result.logs)
            setRunError(result.error)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border">
            <EditorHeader
                language={language}
                setLanguage={setLanguage}
                handleRun={handleRun}
                canRun={canRun}
                isRunning={isRunning}
            />
            <div className="min-h-0 flex-1">
                <MonacoEditor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    defaultValue={exercise?.starter_code}
                    onMount={handleMount}
                    options={{
                        automaticLayout: true,
                    }}
                />
            </div>

            {hasRun && (
                <div className="max-h-40 shrink-0 overflow-y-auto border-t border-border bg-[#1e1e1e] px-4 py-3 font-mono text-xs leading-6">
                    {logs.length === 0 && !runError && (
                        <p className="text-muted-foreground">
                            No output. Add a console.log(...) call to see results here.
                        </p>
                    )}
                    {logs.map((entry, index) => (
                        <p
                            key={index}
                            className={entry.level === "error" ? "text-red-400" : entry.level === "warn" ? "text-yellow-400" : "text-zinc-200"}
                        >
                            {entry.text}
                        </p>
                    ))}
                    {runError && <p className="text-red-400">{runError}</p>}
                </div>
            )}
        </section>
    )
}

export default Editor
