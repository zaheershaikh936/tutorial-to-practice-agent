import { getHttpClient } from "@/features/lib/http"
import { PISTON_ENDPOINTS } from "./endpoints";
import { PistonLanguageResType } from "./types";

const piston = getHttpClient("piston");

export const supportLanguages = async (): Promise<PistonLanguageResType[]> => {
    try {
        const res = await piston.get(PISTON_ENDPOINTS.GET_LANGUAGES);
        const data: PistonLanguageResType[] = res.data.map((item: PistonLanguageResType) => {
            return {
                ...item,
                id: `${item.language}-v-${item.version}`
            }
        })
        return data;
    } catch (error) {
        console.log("Support languages error: ", error);
        return [];
    }
}
    