import axios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";

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
                return Promise.reject(new Error(message));
            }
            return Promise.reject(error);
        },
    );

    return client;
}
