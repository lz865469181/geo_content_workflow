/**
 * Simple token-bucket rate limiter for API calls.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number = 10,
    private refillPerSecond: number = 1,
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillPerSecond);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    // Wait until a token is available
    const waitMs = ((1 - this.tokens) / this.refillPerSecond) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitMs));
    this.tokens = 0;
    this.lastRefill = Date.now();
  }
}
