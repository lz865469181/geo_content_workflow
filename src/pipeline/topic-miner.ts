import { ClaudeClient } from '../ai/claude-client';
import { PROMPTS } from '../ai/prompts';
import { TopicResult, validateTopics } from '../ai/structured-output';
import { DataSource, SearchResult } from '../sources/source.interface';
import { FileCache } from '../utils/cache';
import { logger } from '../utils/logger';

export class TopicMiner {
  constructor(
    private claude: ClaudeClient,
    private sources: DataSource[],
    private cache: FileCache,
  ) {}

  async mine(topic: string): Promise<TopicResult[]> {
    logger.info('Mining topics', { topic });

    // Check cache
    const cacheKey = `topics:${topic}`;
    const cached = this.cache.get<TopicResult[]>(cacheKey);
    if (cached) {
      logger.info('Using cached topics', { count: cached.length });
      return cached;
    }

    // Gather data from all sources
    const allResults: SearchResult[] = [];
    for (const source of this.sources) {
      try {
        const results = await source.search(topic, 10);
        allResults.push(...results);
        logger.info(`Source ${source.name} returned ${results.length} results`);
      } catch (err) {
        logger.warn(`Source ${source.name} failed`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (allResults.length === 0) {
      logger.warn('No source data found, using Claude knowledge only');
    }

    // Format source data for the prompt
    const sourceData = allResults
      .map(r => `[${r.source}] ${r.title}: ${r.snippet}`)
      .join('\n');

    // Ask Claude to extract topics
    const raw = await this.claude.generateJson<unknown[]>(
      PROMPTS.topicMining.system,
      PROMPTS.topicMining.user(topic, sourceData || 'No external data available — use your knowledge.'),
    );

    const topics = validateTopics(raw);

    // Deduplicate by similarity (simple exact match for now)
    const seen = new Set<string>();
    const unique = topics.filter(t => {
      const key = t.question.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by citation potential
    const potentialOrder = { high: 0, medium: 1, low: 2 };
    unique.sort((a, b) =>
      potentialOrder[a.aiCitationPotential] - potentialOrder[b.aiCitationPotential]
    );

    this.cache.set(cacheKey, unique);
    logger.info('Topics mined', { count: unique.length });
    return unique;
  }
}
