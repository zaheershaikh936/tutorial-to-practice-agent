"use client"
import { useEffect, useRef, useState } from "react"
import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react'
import type { PipelineResult } from "@/features/common/ai-model/pipeline"
import { getLatestPipelineResult } from "@/features/common/db/pipeline-db"
import { normalizeEditorLanguage } from "../../utils/languages"
import EditorHeader from "./components/editor-header"

const Editor = () => {
    const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
    const [language, setLanguage] = useState("javascript")
    const [isRunning, setIsRunning] = useState(false)
    const [hasRun, setHasRun] = useState(false)
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
        </section>
    )
}

export default Editor
