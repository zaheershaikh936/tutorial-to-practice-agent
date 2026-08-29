"use client"
import { getLatestPipelineResult } from "@/features/common/db/pipeline-db"
import { useEffect, useState } from "react"

const ExerciseComponent = () => {
    const [pipelineResult, setPipelineResult] = useState<any>(null)
    useEffect(() => {
        getLatestPipelineResult().then((result) => {
            setPipelineResult(result)
        })
    }, [])
    return (
        <div>
            {pipelineResult && (
                <div>
                    <p>Result: {JSON.stringify(pipelineResult.exercise)}</p>
                </div>
            )}
        </div>
    )
}
export default ExerciseComponent