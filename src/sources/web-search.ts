import { DataSource, SearchResult, ContentDetail } from './source.interface';
import { ClaudeClient } from '../ai/claude-client';
import { logger } from '../utils/logger';

/**
 * Web search source — uses Claude to simulate search result analysis.
 * In production, this could be replaced with a real search API (SerpAPI, Brave Search, etc.)
 * For now, Claude generates realistic search analysis based on its training data.
 */
export class WebSearchSource implements DataSource {
  readonly name = 'web-search';

  constructor(private claude: ClaudeClient) {}

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    logger.info('Web search', { query, limit });

    const results = await this.claude.generateJson<SearchResult[]>(
      `You are a web search simulator. Given a query, generate realistic search results
based on your knowledge. Each result should represent a real type of page that would rank for this query.
Return a JSON array of search results.`,
      `Query: "${query}"
Generate ${limit} realistic search results. Each result should have:
- id: unique identifier
- title: page title
- url: realistic URL
- snippet: 1-2 sentence excerpt
- source: "web-search"
- score: relevance score 0-1`,
    );

    return results.slice(0, limit);
  }

  async fetchDetail(id: string): Promise<ContentDetail> {
    logger.info('Web fetch detail', { id });

    return this.claude.generateJson<ContentDetail>(
      `You are a content analyzer. Generate a detailed content summary for the given page.`,
      `Generate detailed content for a web page with id "${id}".
Return JSON with: id, title, url, content (detailed text), author, date, tags, source: "web-search"`,
    );
  }
}
