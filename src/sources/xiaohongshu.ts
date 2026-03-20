import { execFile } from 'child_process';
import * as path from 'path';
import { DataSource, SearchResult, ContentDetail } from './source.interface';
import { logger } from '../utils/logger';

/**
 * Xiaohongshu data source — wraps XiaohongshuSkills CLI.
 * Phase 2 implementation. Currently a stub that throws if XHS prereqs are missing.
 */
export class XiaohongshuSource implements DataSource {
  readonly name = 'xiaohongshu';
  private scriptPath: string;

  constructor(scriptDir?: string) {
    this.scriptPath = path.join(
      scriptDir || path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude/skills/post-to-xhs'),
      'scripts/cdp_publish.py',
    );
  }

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    logger.info('Xiaohongshu search', { query, limit });

    const output = await this.exec('search-feeds', ['--keyword', query, '--limit', String(limit)]);
    const data = JSON.parse(output);

    return (data.feeds || data || []).map((item: any) => ({
      id: item.note_id || item.id,
      title: item.title || item.display_title || '',
      url: `https://www.xiaohongshu.com/explore/${item.note_id || item.id}`,
      snippet: (item.desc || item.description || '').slice(0, 200),
      source: 'xiaohongshu',
      score: item.liked_count ? item.liked_count / 10000 : 0.5,
      metadata: {
        likes: item.liked_count,
        collects: item.collected_count,
        author: item.user?.nickname,
      },
    }));
  }

  async fetchDetail(id: string): Promise<ContentDetail> {
    logger.info('Xiaohongshu fetch detail', { id });

    const output = await this.exec('get-feed-detail', ['--note-id', id]);
    const item = JSON.parse(output);

    return {
      id: item.note_id || id,
      title: item.title || '',
      url: `https://www.xiaohongshu.com/explore/${id}`,
      content: item.desc || item.description || '',
      author: item.user?.nickname,
      date: item.time,
      tags: item.tag_list?.map((t: any) => t.name) || [],
      metrics: {
        likes: item.liked_count,
        comments: item.comment_count,
      },
      source: 'xiaohongshu',
    };
  }

  private exec(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile('python', [this.scriptPath, cmd, ...args], { timeout: 30000 },
        (err, stdout, stderr) => {
          if (err) {
            logger.error('XHS CLI error', { cmd, stderr });
            reject(new Error(`XiaohongshuSkills CLI failed: ${err.message}`));
            return;
          }
          resolve(stdout);
        });
    });
  }
}
