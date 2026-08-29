import { useQuery } from "@tanstack/react-query"
import { supportLanguages } from "./helper"
import { PistonLanguageResType } from "./types"

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