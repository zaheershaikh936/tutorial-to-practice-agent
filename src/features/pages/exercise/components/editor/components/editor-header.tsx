import { Button } from "@/components/ui/button"
import { LoaderCircle, Play } from "lucide-react"
import LanguageSelector from "./language-selector"

interface EditorHeaderProps {
    language: string;
    setLanguage: (language: string) => void;
    handleRun: () => void;
    canRun: boolean;
    isRunning: boolean;
}

const EditorHeader = ({ language, setLanguage, handleRun, canRun, isRunning }: EditorHeaderProps) => {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5">
            <LanguageSelector
                language={language}
                setLanguage={setLanguage}
            />
            <Button
                type="button"
                size="sm"
                onClick={handleRun}
                disabled={!canRun || isRunning}
                title={canRun ? undefined : "Only JavaScript execution is supported right now"}
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
    )
}

export default EditorHeader