import { HTTPClientError, OpenRouterError } from "@openrouter/sdk/models/errors";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 500;

/** HTTP statuses worth retrying: request timeout, rate limit, and server-side 5xx. */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * HTTPClientError subclasses that mean the request itself was malformed or
 * deliberately cancelled - retrying sends the same broken request again.
 */
const NON_RETRYABLE_CLIENT_ERROR_NAMES = new Set(["InvalidRequestError", "RequestAbortedError"]);

/**
 * Classifies an error from the OpenRouter SDK as transient (network hiccup,
 * timeout, rate limit, provider-side 5xx) or permanent (bad request, auth,
 * malformed input) - only transient errors are worth retrying.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenRouterError) return RETRYABLE_STATUS_CODES.has(error.statusCode);
  if (error instanceof HTTPClientError) return !NON_RETRYABLE_CLIENT_ERROR_NAMES.has(error.name);
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
}

/**
 * Retries `fn` with exponential backoff (baseDelayMs, then x2, x4, ...),
 * but only for errors `isRetryable` accepts - anything else fails on the
 * first attempt since retrying won't change the outcome.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    isRetryable = isRetryableError,
  } = options;

  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxAttempts || !isRetryable(error)) throw error;
      await delay(baseDelayMs * 2 ** (attempt - 1));
    }
  }
}
