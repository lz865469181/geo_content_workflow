export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

let currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatMsg(level: string, msg: string, meta?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  if (meta) {
    // Redact sensitive keys
    const safe = { ...meta };
    for (const key of Object.keys(safe)) {
      if (/key|secret|token|password/i.test(key)) {
        safe[key] = '***REDACTED***';
      }
    }
    return `${base} ${JSON.stringify(safe)}`;
  }
  return base;
}

export const logger = {
  setLevel(level: LogLevel) { currentLevel = level; },
  debug(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog('debug')) console.debug(formatMsg('debug', msg, meta));
  },
  info(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog('info')) console.log(formatMsg('info', msg, meta));
  },
  warn(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog('warn')) console.warn(formatMsg('warn', msg, meta));
  },
  error(msg: string, meta?: Record<string, unknown>) {
    if (shouldLog('error')) console.error(formatMsg('error', msg, meta));
  },
};
