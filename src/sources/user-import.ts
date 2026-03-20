import { DataSource, SearchResult, ContentDetail } from './source.interface';

/**
 * User data import source — Phase 3 stub.
 * Will support importing from bookmarks, notes, documents, CSV.
 */
export class UserImportSource implements DataSource {
  readonly name = 'user-import';

  async search(_query: string, _limit?: number): Promise<SearchResult[]> {
    throw new Error('UserImportSource is a Phase 3 feature. Not yet implemented.');
  }

  async fetchDetail(_id: string): Promise<ContentDetail> {
    throw new Error('UserImportSource is a Phase 3 feature. Not yet implemented.');
  }
}
