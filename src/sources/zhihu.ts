import { DataSource, SearchResult, ContentDetail } from './source.interface';
import { ClaudeClient } from '../ai/claude-client';
import { logger } from '../utils/logger';

/**
 * Zhihu data source — uses Claude to analyze Zhihu-style Q&A content.
 * In production, could use Zhihu API or web scraping.
 * For Phase 1, Claude generates Zhihu-style content analysis.
 */
export class ZhihuSource implements DataSource {
  readonly name = 'zhihu';

  constructor(private claude: ClaudeClient) {}

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    logger.info('Zhihu search', { query, limit });

    const results = await this.claude.generateJson<SearchResult[]>(
      `You are a Zhihu (知乎) content analyst. Given a topic, generate realistic Zhihu questions
and answers that would exist on the platform. Focus on high-quality, detailed Q&A content.
Return a JSON array.`,
      `Topic: "${query}"
Generate ${limit} Zhihu questions related to this topic. Each should have:
- id: zhihu-style question id
- title: the question (in Chinese is fine, or English based on the query language)
- url: realistic zhihu.com URL
- snippet: top answer excerpt (1-2 sentences)
- source: "zhihu"
- score: relevance 0-1
- metadata: { answerCount: number, followers: number }`,
    );

    return results.slice(0, limit);
  }

  async fetchDetail(id: string): Promise<ContentDetail> {
    logger.info('Zhihu fetch detail', { id });

    return this.claude.generateJson<ContentDetail>(
      `You are a Zhihu content analyst. Generate a detailed Zhihu-style answer for the given question.`,
      `Generate a detailed Zhihu-style answer for question id "${id}".
Return JSON with: id, title, url, content (detailed answer text), author, date, tags,
metrics: { views, likes, comments }, source: "zhihu"`,
    );
  }
}
