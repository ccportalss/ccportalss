// Document and chunk types
export interface DocumentChunk {
  id: string;
  content: string;
  length: number;
  pageNumber: number;
  embedding?: number[];
  score?: number;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  totalPages: number;
  uploadDate: string;
  indexName: string;
  totalChunks: number;
}

// UI related types
export type MessageType = 'user' | 'bot';

export interface Message {
  content: string;
  type: MessageType;
  timestamp: Date;
}

export type UploadStatusType = 'success' | 'error' | 'processing';

// RAG Processing Steps
export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  details?: string;
}

// Vector Search Result
export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: {
    pageNumber: number;
    chunkIndex: number;
  };
}

// API Configuration
export interface APIConfig {
  openaiApiKey: string;
  pineconeApiKey: string;
  pineconeEnvironment: string;
}

// Pinecone Types
export interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    content: string;
    pageNumber: number;
    chunkIndex: number;
  };
}

// OpenAI Types
export interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}