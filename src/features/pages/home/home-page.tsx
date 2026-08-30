"use client";

import { usePipeline } from "@/features/pages/home/hooks/use-pipeline";
import { SourceMaterialComponent } from "./components/source-material-component";
import ChannelSearch from "./components/search-bar";


export default function HomePage() {
    const { transcript, setTranscript, runPipeline, runFromYoutubeUrl, isRunning, complete, error, result } = usePipeline();

    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
            <section className="flex flex-1 flex-col justify-center py-12 lg:py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs font-medium text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-accent-foreground" />
                        4-step learning pipeline
                    </div>
                    <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                        Make every tutorial <span className="text-accent-foreground">interactive.</span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                        Paste a tutorial transcript or blog post below. We&apos;ll extract the key ideas,
                        create exercises, generate test cases, and verify the results.
                    </p>
                </div>

                <ChannelSearch onSearch={runFromYoutubeUrl} isRunning={isRunning} />

                <div className="mx-auto mt-8 flex w-full max-w-3xl items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or paste the transcript directly</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <SourceMaterialComponent
                    transcript={transcript}
                    setTranscript={setTranscript}
                    runPipeline={runPipeline}
                    isRunning={isRunning}
                    complete={complete}
                    error={error}
                    result={result}
                />
            </section>
        </div>
    );
}