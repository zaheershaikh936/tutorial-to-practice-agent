"use client"
import Editor from "./components/editor"
import ExerciseComponent from "./components/exercise-component"
import { useExecuteProgram, useSupportLanguages } from "./components/editor/api/service"
import { OutputComponent } from "./components/editor/components/output-component"

const ExercisePage = () => {
    const { data: languages = [] } = useSupportLanguages()
    const { mutate: runCode, data: result, isPending: isRunning, error: runError } = useExecuteProgram()

    return (
        <section className="grid grid-cols-2 h-full min-h-[calc(100vh-200px)] gap-5">
            <div className="col-span-1">
                <section className="rounded-2xl border border-border bg-card shadow-sm mx-auto w-full h-full">
                    <ExerciseComponent result={result} isRunning={isRunning} runError={runError} />
                    <OutputComponent result={result} isRunning={isRunning} runError={runError} />
                </section>
            </div>
            <div className="col-span-1">
                <Editor
                    languages={languages}
                    onRun={runCode}
                    isRunning={isRunning}
                />
            </div>
        </section>
    )
}

export default ExercisePage
