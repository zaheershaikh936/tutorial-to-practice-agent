import { FileText, FlaskConical, Lightbulb, ShieldCheck, type LucideIcon } from "lucide-react";
import { ResultComponentProps } from "../utils/types";

export const ResultComponent = ({ result }: ResultComponentProps) => {
    return (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ResultCard icon={Lightbulb} title="Step 1 — Concept extraction" data={result.concept} />
            <ResultCard icon={FileText} title="Step 2 — Exercise generation" data={result.exercise} />
            <ResultCard icon={FlaskConical} title="Step 3 — Test cases" data={result.testCases} />
            <ResultCard icon={ShieldCheck} title="Step 4 — Self-verification" data={result.verification} />
        </div>
    )
}

interface ResultCardProps {
    icon: LucideIcon;
    title: string;
    data: unknown;
}

function ResultCard({ icon: Icon, title, data }: ResultCardProps) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
                <Icon aria-hidden="true" className="size-4 text-accent-foreground" />
                <p className="text-sm font-semibold">{title}</p>
            </div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs leading-5 text-muted-foreground">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
