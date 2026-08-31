import { PipelineResult } from "@/features/common/ai-model/pipeline";

export interface SourceMaterialPropmt {
    transcript: string;
    setTranscript: (value: string) => void;
    runPipeline: () => void;
    isRunning: boolean;
    complete: boolean;
    error: string | null;
    result: PipelineResult | null;
}

export interface ErrorComponentProps {
    error: string | null;
}

export interface ResultComponentProps {
    result: PipelineResult;
}
