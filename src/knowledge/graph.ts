/**
 * Personal Knowledge Graph — Phase 3 stub.
 * Coordinates entity extraction, storage, and querying.
 */

import { EntityExtractor } from './entity';
import { KnowledgeStore } from './store';

export class KnowledgeGraph {
  private extractor: EntityExtractor;
  private store: KnowledgeStore;

  constructor(dbPath?: string) {
    this.extractor = new EntityExtractor();
    this.store = new KnowledgeStore(dbPath);
  }

  /**
   * Ingest content: extract entities and relations, store in graph.
   */
  async ingest(_content: string, _sourceId: string): Promise<void> {
    throw new Error('KnowledgeGraph is a Phase 3 feature. Not yet implemented.');
  }

  /**
   * Query the graph for entities related to a topic.
   */
  async query(_topic: string): Promise<unknown[]> {
    throw new Error('KnowledgeGraph is a Phase 3 feature. Not yet implemented.');
  }

  /**
   * Get context for content generation from the knowledge graph.
   */
  async getContext(_topic: string): Promise<string> {
    throw new Error('KnowledgeGraph is a Phase 3 feature. Not yet implemented.');
  }
}

// Re-export for convenience
export { EntityExtractor } from './entity';
export { KnowledgeStore } from './store';
