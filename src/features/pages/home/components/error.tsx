import { ErrorComponentProps } from "../utils/types"


export const ErrorComponent = ({ error }: ErrorComponentProps) => {
    return (
        error && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
                {error}
            </div>
        )
    )
}