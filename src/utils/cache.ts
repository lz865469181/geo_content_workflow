import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { logger } from './logger';

export class FileCache {
  private dir: string;
  private ttlMs: number;

  constructor(cacheDir: string, ttlMinutes = 60) {
    this.dir = cacheDir;
    this.ttlMs = ttlMinutes * 60 * 1000;
    fs.mkdirSync(this.dir, { recursive: true });
  }

  private keyToPath(key: string): string {
    const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
    return path.join(this.dir, `${hash}.json`);
  }

  get<T>(key: string): T | null {
    const filePath = this.keyToPath(key);
    if (!fs.existsSync(filePath)) return null;

    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Date.now() - raw.ts > this.ttlMs) {
        fs.unlinkSync(filePath);
        return null;
      }
      logger.debug('Cache hit', { key });
      return raw.data as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T): void {
    const filePath = this.keyToPath(key);
    fs.writeFileSync(filePath, JSON.stringify({ ts: Date.now(), data }));
    logger.debug('Cache set', { key });
  }
}
