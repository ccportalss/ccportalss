import { VectorSearchResult } from '../types';

// Pinecone REST API 클라이언트 (브라우저 호환)
export class PineconeClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(apiKey: string, indexName: string, _environment: string) {
    this.apiKey = apiKey;
    // 사용자가 제공한 Host URL 사용
    this.baseUrl = `https://${indexName}-d00jbyj.svc.aped-4627-b74a.pinecone.io`;
  }

  async upsertVectors(vectors: Array<{
    id: string;
    values: number[];
    metadata: any;
  }>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: vectors,
        namespace: ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone upsert failed: ${response.status} ${errorText}`);
    }
  }

  async query(
    vector: number[], 
    topK: number = 5, 
    threshold: number = 0.7
  ): Promise<VectorSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: vector,
        topK: topK,
        includeValues: false,
        includeMetadata: true,
        namespace: ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone query failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    console.log('🔍 Pinecone 응답:', {
      totalMatches: data.matches?.length || 0,
      allScores: data.matches?.map((m: any) => m.score),
      matches: data.matches?.slice(0, 3).map((m: any) => ({
        id: m.id,
        score: m.score,
        hasContent: !!m.metadata?.content,
        contentPreview: m.metadata?.content?.substring(0, 50)
      }))
    });
    
    const results = data.matches
      ?.filter((match: any) => match.score >= threshold)
      .map((match: any) => ({
        id: match.id,
        content: match.metadata?.content || '',
        score: match.score || 0,
        metadata: {
          pageNumber: match.metadata?.pageNumber || 0,
          chunkIndex: match.metadata?.chunkIndex || 0
        }
      })) || [];
      
    console.log('📊 필터링 후 결과:', {
      threshold,
      filteredCount: results.length,
      scores: results.map((r: any) => r.score)
    });
    
    return results;
  }

  async describeIndexStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/describe_index_stats`, {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone stats failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  }
}