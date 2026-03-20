/**
 * Knowledge graph persistence — Phase 3 stub.
 * Will use SQLite for graph storage.
 */

export interface StoredEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredRelation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  weight: number;
  metadata: Record<string, unknown>;
}

export class KnowledgeStore {
  constructor(_dbPath?: string) {
    // Phase 3: Initialize SQLite connection
  }

  async addEntity(_entity: Omit<StoredEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredEntity> {
    throw new Error('KnowledgeStore is a Phase 3 feature. Not yet implemented.');
  }

  async addRelation(_relation: Omit<StoredRelation, 'id'>): Promise<StoredRelation> {
    throw new Error('KnowledgeStore is a Phase 3 feature. Not yet implemented.');
  }

  async findEntities(_query: string): Promise<StoredEntity[]> {
    throw new Error('KnowledgeStore is a Phase 3 feature. Not yet implemented.');
  }

  async getRelated(_entityId: string): Promise<{ entity: StoredEntity; relation: StoredRelation }[]> {
    throw new Error('KnowledgeStore is a Phase 3 feature. Not yet implemented.');
  }
}
