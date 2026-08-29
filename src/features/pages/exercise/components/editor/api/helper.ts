import { getHttpClient } from "@/features/lib/http"
import { PISTON_ENDPOINTS } from "./endpoints";
import { ExecuteProgramReqType, ExecuteProgramResponseBody, ExecuteProgramResType, PistonLanguageResType } from "./types";

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

export const ExecuteProgram = async (reqbody: ExecuteProgramResponseBody): Promise<ExecuteProgramResType> => {
    const body: ExecuteProgramReqType = {
        language: reqbody.language,
        version: reqbody.version,
        files: [{ content: reqbody.code }],
        stdin: reqbody.input ?? "",
        args: reqbody.args ?? [],
    }
    const res = await piston.post(PISTON_ENDPOINTS.EXECUTE_CODE, body)
    return res.data;
}