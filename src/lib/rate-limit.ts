/**
 * Rate limiter for API requests
 * Ensures we don't exceed rate limits for external APIs like Discogs
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  /**
   * Acquire a slot to make a request
   * Will wait if rate limit is exceeded
   */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();

      // Remove timestamps outside the window
      this.timestamps = this.timestamps.filter(
        (ts) => now - ts < this.windowMs
      );

      if (this.timestamps.length < this.maxRequests) {
        // We have capacity, allow the request
        this.timestamps.push(now);
        resolve();
      } else {
        // Rate limit exceeded, calculate wait time
        const oldestTimestamp = this.timestamps[0];
        const waitTime = this.windowMs - (now - oldestTimestamp);

        setTimeout(() => {
          this.timestamps.push(Date.now());
          resolve();
        }, waitTime);
      }
    });
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.timestamps = [];
    this.queue = [];
  }
}
