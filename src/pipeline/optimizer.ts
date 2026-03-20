import { ClaudeClient } from '../ai/claude-client';
import { PROMPTS } from '../ai/prompts';
import { OptimizationResult, validateOptimization } from '../ai/structured-output';
import { logger } from '../utils/logger';

export class Optimizer {
  constructor(private claude: ClaudeClient) {}

  async analyze(content: string): Promise<OptimizationResult> {
    logger.info('Analyzing content for GEO optimization');

    const raw = await this.claude.generateJson<unknown>(
      PROMPTS.optimization.system,
      PROMPTS.optimization.user(content),
    );

    const result = validateOptimization(raw);
    logger.info('Optimization analysis complete', { score: result.score, suggestions: result.suggestions.length });
    return result;
  }
}
