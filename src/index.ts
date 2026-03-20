#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from './config';
import { Orchestrator } from './pipeline/orchestrator';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('geo-workflow')
  .description('GEO Content Factory — automated content pipeline for AI search optimization')
  .version('1.0.0');

function createOrchestrator(): Orchestrator {
  const config = loadConfig();
  logger.setLevel(config.logLevel as any);
  return new Orchestrator(config);
}

program
  .command('mine <topic>')
  .description('Discover questions and topics from web + Zhihu')
  .action(async (topic: string) => {
    try {
      const orch = createOrchestrator();
      await orch.mine(topic);
    } catch (err) {
      logger.error('Mine failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

program
  .command('cluster <topic>')
  .description('Organize topics into content clusters')
  .action(async (topic: string) => {
    try {
      const orch = createOrchestrator();
      await orch.cluster(topic);
    } catch (err) {
      logger.error('Cluster failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

program
  .command('generate <cluster-file>')
  .description('Generate GEO-optimized articles from a cluster file')
  .action(async (clusterFile: string) => {
    try {
      const orch = createOrchestrator();
      await orch.generate(clusterFile);
    } catch (err) {
      logger.error('Generate failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

program
  .command('optimize <article-file>')
  .description('Analyze an article for GEO optimization')
  .action(async (articleFile: string) => {
    try {
      const orch = createOrchestrator();
      await orch.optimize(articleFile);
    } catch (err) {
      logger.error('Optimize failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

program
  .command('batch <config-file>')
  .description('Batch generate content from a config file')
  .action(async (configFile: string) => {
    try {
      const orch = createOrchestrator();
      await orch.batch(configFile);
    } catch (err) {
      logger.error('Batch failed', { error: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

program.parse();
