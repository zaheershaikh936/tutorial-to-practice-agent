"use client"
import { useEffect, useRef, useState } from "react"
import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react'
import type { PipelineResult } from "@/features/common/ai-model/pipeline"
import { getLatestPipelineResult } from "@/features/common/db/pipeline-db"
import { normalizeEditorLanguage, toMonacoLanguage, fileNameFor } from "../../utils/languages"
import EditorHeader from "./components/editor-header"
import { resolvePistonVersion } from "./api/resolve-runtime"
import { JEST_SHIM_SOURCE } from "./api/jest-shim"
import type { PistonLanguageResType, ExecuteProgramResponseBody } from "./api/types"

interface EditorProps {
    languages: PistonLanguageResType[]
    onRun: (body: ExecuteProgramResponseBody) => void
    isRunning: boolean
}

const Editor = ({ languages, onRun, isRunning }: EditorProps) => {
    const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
    const [language, setLanguage] = useState("javascript")

    const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

    useEffect(() => {
        getLatestPipelineResult().then((result) => {
            setPipelineResult(result)
            setLanguage(normalizeEditorLanguage(result?.concept?.language))
        })
    }, [])

    const exercise = pipelineResult?.exercise
    const version = resolvePistonVersion(languages, language)
    const canRun = Boolean(version)

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor
    }

    function handleRun() {
        if (!canRun || isRunning || !version) return
        const code = editorRef.current?.getValue() ?? ""
        onRun({
            fileName: fileNameFor(language),
            code,
            language,
            version,
            args: [],
        })
    }

    const testCode = exercise ? pipelineResult?.testCases?.test_code : undefined
    const canRunTests = canRun && language === "javascript" && Boolean(testCode)

    function handleRunTests() {
        if (!canRunTests || isRunning || !version || !testCode) return
        const code = editorRef.current?.getValue() ?? ""
        const combined = [JEST_SHIM_SOURCE, code, testCode, "__printTestResults();"].join("\n\n")
        onRun({
            fileName: fileNameFor(language),
            code: combined,
            language,
            version,
            args: [],
        })
    }

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border">
            <EditorHeader
                language={language}
                setLanguage={setLanguage}
                handleRun={handleRun}
                canRun={canRun}
                handleRunTests={handleRunTests}
                canRunTests={canRunTests}
                isRunning={isRunning}
            />
            <div className="min-h-0 flex-1">
                <MonacoEditor
                    height="100%"
                    theme="vs-dark"
                    language={toMonacoLanguage(language)}
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
