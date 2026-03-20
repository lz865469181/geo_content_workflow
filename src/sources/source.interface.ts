/**
 * Common interface for all data sources.
 */

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface ContentDetail {
  id: string;
  title: string;
  url: string;
  content: string;
  author?: string;
  date?: string;
  tags?: string[];
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  source: string;
}

export interface DataSource {
  readonly name: string;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  fetchDetail(id: string): Promise<ContentDetail>;
}
