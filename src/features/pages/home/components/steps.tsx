import { steps } from "../utils/constant";
import { ArrowRight, Check } from "lucide-react";

interface StepsProps {
    complete: boolean;
}

const StepsComponents = ({ complete }: StepsProps) => {
    return (
        <div className="mt-10 grid gap-3 sm:grid-cols-4">
            {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                    <div
                        key={step.label}
                        className="relative flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:block sm:min-h-24"
                    >
                        <div
                            className={`mb-0 flex size-8 shrink-0 items-center justify-center rounded-lg sm:mb-4 ${complete ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                                }`}
                        >
                            {complete ? (
                                <Check aria-hidden="true" className="size-4" />
                            ) : (
                                <Icon aria-hidden="true" className="size-4" />
                            )}
                        </div>
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                Step {index + 1}
                            </p>
                            <p className="mt-1 text-sm font-medium">{step.label}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <ArrowRight
                                aria-hidden="true"
                                className="absolute -right-2.5 top-1/2 z-10 hidden size-4 -translate-y-1/2 bg-background text-muted-foreground sm:block"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    )
}

export default StepsComponents