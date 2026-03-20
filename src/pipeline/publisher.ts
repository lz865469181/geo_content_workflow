import * as fs from 'fs';
import * as path from 'path';
import { GeneratedArticle } from './content-generator';
import { logger } from '../utils/logger';

export class Publisher {
  constructor(private outputDir: string) {}

  publishArticle(article: GeneratedArticle): string {
    const articlesDir = path.join(this.outputDir, 'articles');
    fs.mkdirSync(articlesDir, { recursive: true });

    const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const filePath = path.join(articlesDir, `${slug}.md`);

    // Check if markdown already has frontmatter
    let content = article.markdown;
    if (!content.startsWith('---')) {
      // Add frontmatter
      const frontmatter = [
        '---',
        `title: "${article.title.replace(/"/g, '\\"')}"`,
        `date: ${new Date().toISOString().split('T')[0]}`,
        `cluster: "${article.cluster}"`,
        `type: ${article.isPillar ? 'pillar' : 'supporting'}`,
        `targetQuery: "${article.targetQuery.replace(/"/g, '\\"')}"`,
        '---',
        '',
      ].join('\n');
      content = frontmatter + content;
    }

    fs.writeFileSync(filePath, content);
    logger.info('Published article', { path: filePath });
    return filePath;
  }

  publishClusterIndex(clusterName: string, articles: GeneratedArticle[]): string {
    const clustersDir = path.join(this.outputDir, 'clusters');
    fs.mkdirSync(clustersDir, { recursive: true });

    const slug = clusterName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const filePath = path.join(clustersDir, `${slug}-index.md`);

    const pillar = articles.find(a => a.isPillar);
    const supporting = articles.filter(a => !a.isPillar);

    const lines = [
      '---',
      `title: "Cluster: ${clusterName}"`,
      `date: ${new Date().toISOString().split('T')[0]}`,
      `articleCount: ${articles.length}`,
      '---',
      '',
      `# ${clusterName}`,
      '',
    ];

    if (pillar) {
      const pillarSlug = pillar.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      lines.push(`## Pillar Article`);
      lines.push(`- [${pillar.title}](../articles/${pillarSlug}.md)`);
      lines.push('');
    }

    if (supporting.length > 0) {
      lines.push(`## Supporting Articles`);
      for (const article of supporting) {
        const aSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        lines.push(`- [${article.title}](../articles/${aSlug}.md)`);
      }
      lines.push('');
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    logger.info('Published cluster index', { path: filePath });
    return filePath;
  }
}
