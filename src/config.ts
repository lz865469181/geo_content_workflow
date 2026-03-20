import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  anthropicApiKey: string;
  anthropicBaseUrl?: string;
  claudeModel: string;
  outputDir: string;
  cacheDir: string;
  logLevel: string;
}

/**
 * Expand ${VAR_NAME} placeholders using process.env.
 */
function expandEnvVars(value: string): string {
  return value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
    const val = process.env[varName];
    if (!val) throw new Error(`Environment variable ${varName} is not set`);
    return val;
  });
}

export function loadConfig(configPath?: string): AppConfig {
  let fileConfig: Record<string, string> = {};

  if (configPath && fs.existsSync(configPath)) {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'string') {
        fileConfig[k] = expandEnvVars(v);
      }
    }
  }

  const apiKey = fileConfig.anthropicApiKey
    || process.env.ANTHROPIC_API_KEY
    || '';

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is required. Set it as an environment variable or in config file.'
    );
  }

  const projectRoot = path.resolve(__dirname, '..');

  return {
    anthropicApiKey: apiKey,
    anthropicBaseUrl: fileConfig.anthropicBaseUrl || process.env.ANTHROPIC_BASE_URL || undefined,
    claudeModel: fileConfig.claudeModel
      || process.env.CLAUDE_MODEL
      || process.env.ANTHROPIC_DEFAULT_SONNET_MODEL
      || 'claude-sonnet-4-20250514',
    outputDir: fileConfig.outputDir || process.env.GEO_OUTPUT_DIR || path.join(projectRoot, 'output'),
    cacheDir: fileConfig.cacheDir || process.env.GEO_CACHE_DIR || path.join(projectRoot, 'data'),
    logLevel: fileConfig.logLevel || process.env.LOG_LEVEL || 'info',
  };
}
