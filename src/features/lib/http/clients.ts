import type { AxiosInstance } from "axios";
import { createHttpClient } from "./create-client";

/**
 * Every base URL this app talks to. Add a new entry here to register another
 * API - no other code needs to change.
 */
export const API_BASE_URLS = {
    piston: "https://emkc.org/api/v2/piston",
} as const;

export type ApiName = keyof typeof API_BASE_URLS;

const clients = new Map<ApiName, AxiosInstance>();

/**
 * Returns the shared axios instance for `name`, creating it on first use.
 * All instances share the same common setup (see createHttpClient) and
 * differ only in baseURL.
 */
export function getHttpClient(name: ApiName): AxiosInstance {
    let client = clients.get(name);
    if (!client) {
        client = createHttpClient(API_BASE_URLS[name]);
        clients.set(name, client);
    }
    return client;
}
