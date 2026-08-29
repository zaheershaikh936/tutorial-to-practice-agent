import type { TestCaseNote } from "@/features/common/ai-model/utils/prompts";

export interface PistonLanguageResType {
    id: string;
    language: string;
    version: string;
}
    
export interface ExecuteProgramReqType {
    language: string;
    version: string;
    files: [{
        content: string,
    }],
    stdin?: string;
    args: string[];
}

export interface ExecuteProgramResponseBody {
    fileName: string
    code: string,
    language: string,
    version: string,
    args?: string[]
    input?: string
}

export interface ExecuteProgramResType {
    run: {
        stdout: string,
        stderr: string,
        code: number,
        signal: string | null,
        output: string
    },
    language: string,
    version: string
}


export interface OutputComponentPropt {
    result?: ExecuteProgramResType;
    isRunning?: boolean;
    runError?: Error | null;
    testCaseNotes?: TestCaseNote[];
}