import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

// Get search-only client for client-side usage
export function getSearchClient() {
  return algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_SEARCH_API_KEY!
  );
}

// Initialize an index
export function getIndex(indexName: string) {
  return client.initIndex(indexName);
}

// Index a single record
export async function indexRecord(
  indexName: string,
  record: any,
  objectID?: string
) {
  try {
    const index = getIndex(indexName);
    const result = await index.saveObject({
      ...record,
      objectID: objectID || record.id,
    });
    
    return {
      success: true,
      objectID: result.objectID,
    };
  } catch (error) {
    console.error('Algolia indexing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to index record',
    };
  }
}

// Index multiple records
export async function indexRecords(
  indexName: string,
  records: any[]
) {
  try {
    const index = getIndex(indexName);
    const result = await index.saveObjects(records);
    
    return {
      success: true,
      objectIDs: result.objectIDs,
    };
  } catch (error) {
    console.error('Algolia batch indexing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to index records',
    };
  }
}

// Update a record
export async function updateRecord(
  indexName: string,
  objectID: string,
  updates: any
) {
  try {
    const index = getIndex(indexName);
    const result = await index.partialUpdateObject({
      objectID,
      ...updates,
    });
    
    return {
      success: true,
      objectID: result.objectID,
    };
  } catch (error) {
    console.error('Algolia update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update record',
    };
  }
}

// Delete a record
export async function deleteRecord(
  indexName: string,
  objectID: string
) {
  try {
    const index = getIndex(indexName);
    await index.deleteObject(objectID);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Algolia delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete record',
    };
  }
}

// Search records
export async function searchRecords(
  indexName: string,
  query: string,
  options?: {
    filters?: string;
    facets?: string[];
    hitsPerPage?: number;
    page?: number;
  }
) {
  try {
    const index = getIndex(indexName);
    const results = await index.search(query, {
      ...options,
    });
    
    return {
      success: true,
      hits: results.hits,
      nbHits: results.nbHits,
      page: results.page,
      nbPages: results.nbPages,
      facets: results.facets,
    };
  } catch (error) {
    console.error('Algolia search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search',
      hits: [],
      nbHits: 0,
    };
  }
}

// Configure index settings
export async function configureIndex(
  indexName: string,
  settings: {
    searchableAttributes?: string[];
    attributesForFaceting?: string[];
    ranking?: string[];
    customRanking?: string[];
  }
) {
  try {
    const index = getIndex(indexName);
    await index.setSettings(settings);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Algolia settings error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to configure index',
    };
  }
}

// Clear an index
export async function clearIndex(indexName: string) {
  try {
    const index = getIndex(indexName);
    await index.clearObjects();
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Algolia clear error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear index',
    };
  }
}