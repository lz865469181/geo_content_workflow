import { AppConfig } from '../config';
import { ClaudeClient } from '../ai/claude-client';
import { WebSearchSource } from '../sources/web-search';
import { ZhihuSource } from '../sources/zhihu';
import { DataSource } from '../sources/source.interface';
import { FileCache } from '../utils/cache';
import { TopicMiner } from './topic-miner';
import { ClusterBuilder } from './cluster-builder';
import { ContentGenerator, GeneratedArticle } from './content-generator';
import { Optimizer } from './optimizer';
import { Publisher } from './publisher';
import { logger } from '../utils/logger';

export class Orchestrator {
  private claude: ClaudeClient;
  private sources: DataSource[];
  private cache: FileCache;
  private topicMiner: TopicMiner;
  private clusterBuilder: ClusterBuilder;
  private contentGenerator: ContentGenerator;
  private optimizer: Optimizer;
  private publisher: Publisher;

  constructor(private config: AppConfig) {
    this.claude = new ClaudeClient(config.anthropicApiKey, config.claudeModel, config.anthropicBaseUrl);
    this.cache = new FileCache(config.cacheDir, 120); // 2 hour cache

    // Initialize Phase 1 sources
    this.sources = [
      new WebSearchSource(this.claude),
      new ZhihuSource(this.claude),
    ];

    this.topicMiner = new TopicMiner(this.claude, this.sources, this.cache);
    this.clusterBuilder = new ClusterBuilder(this.claude, config.outputDir);
    this.contentGenerator = new ContentGenerator(this.claude, this.sources, this.cache);
    this.optimizer = new Optimizer(this.claude);
    this.publisher = new Publisher(config.outputDir);
  }

  async mine(topic: string): Promise<void> {
    const topics = await this.topicMiner.mine(topic);

    console.log(`\nDiscovered ${topics.length} topics for "${topic}":\n`);
    for (const t of topics) {
      const icon = t.aiCitationPotential === 'high' ? '★' : t.aiCitationPotential === 'medium' ? '●' : '○';
      console.log(`  ${icon} [${t.intent}] ${t.question}`);
      console.log(`    Citation potential: ${t.aiCitationPotential} | Difficulty: ${t.difficulty}`);
    }
  }

  async cluster(topic: string): Promise<void> {
    // Mine topics first
    const topics = await this.topicMiner.mine(topic);
    const result = await this.clusterBuilder.build(topic, topics);

    console.log(`\nCreated ${result.clusters.length} clusters for "${topic}":\n`);
    for (const c of result.clusters) {
      console.log(`  Cluster: ${c.name}`);
      console.log(`    Pillar: ${c.pillar.title}`);
      for (const s of c.supporting) {
        console.log(`    └── ${s.title}`);
      }
      console.log('');
    }
  }

  async generate(clusterFile: string): Promise<void> {
    const clusterData = this.clusterBuilder.loadCluster(clusterFile);
    const allArticles: GeneratedArticle[] = [];

    for (const cluster of clusterData.clusters) {
      console.log(`\nGenerating cluster: ${cluster.name}`);

      const articles = await this.contentGenerator.generateCluster(cluster);

      // Publish each article
      for (const article of articles) {
        const filePath = this.publisher.publishArticle(article);
        console.log(`  ✓ ${article.isPillar ? '[PILLAR]' : '[SUPPORT]'} ${article.title} → ${filePath}`);
      }

      // Publish cluster index
      this.publisher.publishClusterIndex(cluster.name, articles);
      allArticles.push(...articles);
    }

    console.log(`\nGenerated ${allArticles.length} articles total.`);
  }

  async optimize(articlePath: string): Promise<void> {
    const { readFileSync } = await import('fs');
    const content = readFileSync(articlePath, 'utf-8');

    const result = await this.optimizer.analyze(content);

    console.log(`\nGEO Optimization Score: ${result.score}/100`);
    console.log(`\n${result.summary}\n`);

    if (result.suggestions.length > 0) {
      console.log('Suggestions:');
      for (const s of result.suggestions) {
        const icon = s.impact === 'high' ? '!!!' : s.impact === 'medium' ? ' !!' : '  !';
        console.log(`  ${icon} [${s.type}] ${s.location}: ${s.suggested}`);
      }
    }
  }

  async batch(configFile: string): Promise<void> {
    const { readFileSync } = await import('fs');
    const batchConfig = JSON.parse(readFileSync(configFile, 'utf-8'));

    const topics: string[] = batchConfig.topics || [];
    if (topics.length === 0) {
      console.log('No topics in batch config.');
      return;
    }

    console.log(`Batch processing ${topics.length} topics...\n`);

    for (const topic of topics) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing: ${topic}`);
      console.log('='.repeat(60));

      // Mine → Cluster → Generate
      const topicResults = await this.topicMiner.mine(topic);
      const clusterResult = await this.clusterBuilder.build(topic, topicResults);

      for (const cluster of clusterResult.clusters) {
        const articles = await this.contentGenerator.generateCluster(cluster);
        for (const article of articles) {
          this.publisher.publishArticle(article);
        }
        this.publisher.publishClusterIndex(cluster.name, articles);
      }

      logger.info('Batch topic complete', { topic });
    }

    console.log(`\nBatch processing complete.`);
  }
}
