import * as fs from 'fs';
import * as path from 'path';
import { ClaudeClient } from '../ai/claude-client';
import { PROMPTS } from '../ai/prompts';
import { TopicResult } from '../ai/structured-output';
import { ClusterResult, validateClusters } from '../ai/structured-output';
import { logger } from '../utils/logger';

export class ClusterBuilder {
  constructor(
    private claude: ClaudeClient,
    private outputDir: string,
  ) {}

  async build(topic: string, topics: TopicResult[]): Promise<ClusterResult> {
    logger.info('Building clusters', { topic, topicCount: topics.length });

    const questionsText = topics
      .map((t, i) => `${i + 1}. [${t.intent}] ${t.question} (citation potential: ${t.aiCitationPotential})`)
      .join('\n');

    const raw = await this.claude.generateJson<unknown>(
      PROMPTS.clustering.system,
      PROMPTS.clustering.user(topic, questionsText),
    );

    const result = validateClusters(raw);

    // Save cluster file
    const clusterDir = path.join(this.outputDir, 'clusters');
    fs.mkdirSync(clusterDir, { recursive: true });

    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const filePath = path.join(clusterDir, `${slug}.json`);

    fs.writeFileSync(filePath, JSON.stringify({
      topic,
      createdAt: new Date().toISOString(),
      ...result,
    }, null, 2));

    logger.info('Cluster saved', { path: filePath, clusterCount: result.clusters.length });
    return result;
  }

  loadCluster(filePath: string): ClusterResult & { topic: string } {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return raw;
  }
}
