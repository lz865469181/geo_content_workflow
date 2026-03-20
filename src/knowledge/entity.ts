/**
 * Entity extraction and normalization — Phase 3 stub.
 * Will use Claude to extract entities from content.
 */

export interface ExtractedEntity {
  name: string;
  type: 'product' | 'brand' | 'category' | 'concept' | 'person' | 'tool';
  aliases: string[];
  confidence: number;
}

export interface EntityRelation {
  from: string;
  to: string;
  type: 'is_a' | 'part_of' | 'related_to' | 'competes_with' | 'made_by';
  confidence: number;
}

export class EntityExtractor {
  async extract(_content: string): Promise<ExtractedEntity[]> {
    throw new Error('EntityExtractor is a Phase 3 feature. Not yet implemented.');
  }

  async extractRelations(_entities: ExtractedEntity[], _content: string): Promise<EntityRelation[]> {
    throw new Error('EntityExtractor is a Phase 3 feature. Not yet implemented.');
  }
}
