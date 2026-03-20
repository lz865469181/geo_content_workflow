import { ClaudeClient } from '../ai/claude-client';
import { PROMPTS } from '../ai/prompts';
import { ContentCluster, ClusterArticle } from '../ai/structured-output';
import { DataSource } from '../sources/source.interface';
import { FileCache } from '../utils/cache';
import { logger } from '../utils/logger';

export interface GeneratedArticle {
  title: string;
  targetQuery: string;
  markdown: string;
  isPillar: boolean;
  cluster: string;
}

export class ContentGenerator {
  constructor(
    private claude: ClaudeClient,
    private sources: DataSource[],
    private cache: FileCache,
  ) {}

  async generateCluster(cluster: ContentCluster): Promise<GeneratedArticle[]> {
    logger.info('Generating cluster content', { cluster: cluster.name });

    const articles: GeneratedArticle[] = [];

    // Generate pillar first
    const pillar = await this.generateArticle(cluster.pillar, cluster, true);
    articles.push(pillar);

    // Generate supporting articles
    for (const article of cluster.supporting) {
      const generated = await this.generateArticle(article, cluster, false);
      articles.push(generated);
    }

    logger.info('Cluster generation complete', { cluster: cluster.name, count: articles.length });
    return articles;
  }

  private async generateArticle(
    article: ClusterArticle,
    cluster: ContentCluster,
    isPillar: boolean,
  ): Promise<GeneratedArticle> {
    const cacheKey = `article:${article.title}`;
    const cached = this.cache.get<GeneratedArticle>(cacheKey);
    if (cached) {
      logger.info('Using cached article', { title: article.title });
      return cached;
    }

    logger.info('Generating article', { title: article.title, isPillar });

    // Gather research context from sources
    const context = await this.gatherContext(article.targetQuery);

    // Build cluster context (what other articles exist)
    const clusterContext = [
      `Pillar: ${cluster.pillar.title}`,
      ...cluster.supporting.map(s => `Supporting: ${s.title}`),
    ].join('\n');

    const markdown = await this.claude.complete(
      PROMPTS.contentGeneration.system,
      [{
        role: 'user',
        content: PROMPTS.contentGeneration.user(
          article.title,
          article.targetQuery,
          context,
          clusterContext,
        ),
      }],
      8192,
    );

    const result: GeneratedArticle = {
      title: article.title,
      targetQuery: article.targetQuery,
      markdown,
      isPillar,
      cluster: cluster.name,
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  private async gatherContext(query: string): Promise<string> {
    const snippets: string[] = [];

    for (const source of this.sources) {
      try {
        const results = await source.search(query, 5);
        for (const r of results.slice(0, 3)) {
          snippets.push(`[${r.source}] ${r.title}: ${r.snippet}`);
        }
      } catch {
        // Source unavailable, skip
      }
    }

    return snippets.length > 0
      ? snippets.join('\n\n')
      : 'No external research data available. Use your knowledge.';
  }
}
