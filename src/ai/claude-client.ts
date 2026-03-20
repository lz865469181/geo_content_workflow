import Anthropic from '@anthropic-ai/sdk';
import { RateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 5000;

export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private limiter: RateLimiter;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.client = new Anthropic({
      apiKey,
      ...(baseUrl ? { baseURL: baseUrl } : {}),
    });
    this.model = model;
    // Conservative: 1 request per 5 seconds, burst of 1
    this.limiter = new RateLimiter(1, 0.2);
  }

  async complete(
    systemPrompt: string,
    messages: ChatMessage[],
    maxTokens = 4096,
  ): Promise<string> {
    await this.limiter.acquire();

    logger.debug('Claude API call', { model: this.model, msgCount: messages.length });

    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
        });

        const textBlock = response.content.find(b => b.type === 'text');
        if (!textBlock || textBlock.type !== 'text') {
          throw new Error('No text response from Claude');
        }

        logger.debug('Claude response', {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        });

        return textBlock.text;
      } catch (err: unknown) {
        lastError = err;
        const status = (err as any)?.status;
        // Retry on 429 (rate limit) and 529 (overloaded)
        if (status === 429 || status === 529) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(`Rate limited (${status}), retrying in ${delay}ms`, { attempt: attempt + 1 });
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  async generateJson<T>(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 4096,
  ): Promise<T> {
    const text = await this.complete(
      systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown fences, no explanation.',
      [{ role: 'user', content: userPrompt }],
      maxTokens,
    );

    // Strip markdown fences if present
    const cleaned = text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
