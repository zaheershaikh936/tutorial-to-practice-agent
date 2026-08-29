import { Button } from "@/components/ui/button"
import { FlaskConical, LoaderCircle, Play } from "lucide-react"
import LanguageSelector from "./language-selector"

interface EditorHeaderProps {
    language: string;
    setLanguage: (language: string) => void;
    handleRun: () => void;
    canRun: boolean;
    handleRunTests: () => void;
    canRunTests: boolean;
    isRunning: boolean;
}

const EditorHeader = ({ language, setLanguage, handleRun, canRun, handleRunTests, canRunTests, isRunning }: EditorHeaderProps) => {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5">
            <LanguageSelector
                language={language}
                setLanguage={setLanguage}
            />
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRunTests}
                    disabled={!canRunTests || isRunning}
                    title={canRunTests ? undefined : "Test running is only available for JavaScript exercises"}
                    className="gap-1.5"
                >
                    <FlaskConical aria-hidden="true" className="size-3.5" />
                    Run Tests
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={handleRun}
                    disabled={!canRun || isRunning}
                    title={canRun ? undefined : "Loading available runtimes..."}
                    className="gap-1.5"
                >
                    {isRunning ? (
                        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
                    ) : (
                        <Play aria-hidden="true" className="size-3.5 fill-current" />
                    )}
                    {isRunning ? "Running" : "Run"}
                </Button>
            </div>
        </div>
    )
}

export default EditorHeader
