'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, FlaskConical } from 'lucide-react'
import { TestCasePropmt } from '../api/types'
import { usePipelineResult } from '../../../hooks/use-pipeline-result'



export function TestCasesComponent() {
    const [expanded, setExpanded] = useState<number | null>(0)
    const pipelineResult = usePipelineResult()
    const testCases = pipelineResult?.testCases?.test_case_notes
    if (!testCases) return null
    return (
        <section className="mt-8  border-t" aria-labelledby="test-cases-title">
            <div className="flex flex-col gap-5 border-b border-border px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-accent"><FlaskConical aria-hidden="true" className="size-4" /></span>
                        Step 3 · Validation
                    </div>
                    <h2 id="test-cases-title" className="text-2xl font-semibold tracking-tight">Test cases</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Your solution will be checked against these scenarios. Review what each test is designed to catch before you submit.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-3 py-1.5 font-mono text-xs text-secondary-foreground"><CheckCircle2 aria-hidden="true" className="size-3.5" />{testCases?.length} checks</div>
            </div>

            <div className="divide-y divide-border">
                {testCases.map((test, index) => {
                    const isOpen = expanded === index
                    return (
                        <div key={test.case} className="px-6 sm:px-8">
                            <button type="button" onClick={() => setExpanded(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center gap-4 py-4 text-left">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                                <span className="min-w-0 flex-1 text-sm font-medium">{test.case}</span>
                                <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && <p className="pb-4 pl-12 text-sm leading-6 text-muted-foreground">{test.checks}</p>}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
