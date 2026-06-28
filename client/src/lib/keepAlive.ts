const PING_URL = `${import.meta.env.VITE_API_URL}/health`;
const INTERVAL_MS = 10 * 60 * 1000; // ping every 10 minutes

let intervalId: ReturnType<typeof setInterval> | null = null;

export const startKeepAlive = (): void => {
  if (intervalId) return; // already running
  intervalId = setInterval(async () => {
    try {
      await fetch(PING_URL);
    } catch {
      // Silent fail — we don't want this to cause any errors
    }
  }, INTERVAL_MS);
};

export const stopKeepAlive = (): void => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// fix for render free tier issue