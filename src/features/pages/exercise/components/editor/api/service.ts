import { useMutation, useQuery } from "@tanstack/react-query"
import { ExecuteProgram, supportLanguages } from "./helper"
import { ExecuteProgramResponseBody, ExecuteProgramResType, PistonLanguageResType } from "./types"

const KEYS = {
    SUPPORT_LANGUAGES: "SUPPORT_LANGUAGES"
}
export const useSupportLanguages = () => {
    return useQuery<PistonLanguageResType[]>({
        queryKey: [KEYS.SUPPORT_LANGUAGES],
        queryFn: () => supportLanguages(),
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
}

export const useExecuteProgram = () => {
    return useMutation<ExecuteProgramResType, Error, ExecuteProgramResponseBody>({
        mutationFn: (body) => ExecuteProgram(body),
    })
}