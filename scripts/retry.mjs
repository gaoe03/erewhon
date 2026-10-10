// Retry transient network failures with exponential backoff.
// Only errors marked transient are retried. Bad data and guard failures fail at once.
export class TransientError extends Error {}

// fetch() rejects with a TypeError on network failures such as DNS or reset sockets.
const isTransient = (error) => error instanceof TransientError || error instanceof TypeError;

export const transientStatus = (status) => status === 408 || status === 429 || status >= 500;

export async function withRetry(fn, { attempts = 3, delayMs = 2000, retryOn = isTransient, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (!retryOn(error) || attempt >= attempts) throw error;
      await sleep(delayMs * 2 ** (attempt - 1));
    }
  }
}
