import axios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";

/**
 * A normalized HTTP failure - callers can branch on `status` (e.g. to tell
 * "not found" apart from "rate limited" apart from "upstream down") without
 * depending on axios's error shape directly. `status` is undefined for
 * errors that never got a response (network failure, timeout).
 */
export class HttpRequestError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = "HttpRequestError";
    }
}

/**
 * Shared axios setup - every client created here gets the same timeout,
 * headers, and error normalization, regardless of which base URL it targets.
 */
export function createHttpClient(baseURL: string, config?: CreateAxiosDefaults): AxiosInstance {
    const client = axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            "Content-Type": "application/json",
        },
        ...config,
    });

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (axios.isAxiosError(error)) {
                const message =
                    (error.response?.data as { message?: string } | undefined)?.message ??
                    error.message;
                return Promise.reject(new HttpRequestError(message, error.response?.status));
            }
            return Promise.reject(error);
        },
    );

    return client;
}
