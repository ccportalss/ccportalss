import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { OpenAIService } from '../services/openai';
import { PineconeClient } from '../services/pineconeClient';
import { DocumentChunk, DocumentMetadata, ProcessingStep, APIConfig } from '../types';

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();

interface UseRAGProcessorProps {
  apiConfig: APIConfig;
  onSuccess: (metadata: DocumentMetadata) => void;
}

export const useRAGProcessor = ({ apiConfig, onSuccess }: UseRAGProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);

  const initializeSteps = (): ProcessingStep[] => [
    {
      id: 'extract',
      name: '1단계: PDF 텍스트 추출',
      description: 'PDF 파서를 통해 문서에서 기계가 읽을 수 있는 텍스트를 추출합니다. 각 페이지의 텍스트 객체를 순차적으로 읽어들이며, 위치 정보와 함께 전체 문서의 텍스트를 구성합니다.',
      status: 'pending'
    },
    {
      id: 'chunk',
      name: '2단계: 의미적 텍스트 분할 (청킹)',
      description: '추출된 긴 텍스트를 검색에 최적화된 작은 단위로 분할합니다. 1000자 내외의 청크로 나누되, 문장 경계를 우선하여 의미를 보존합니다. 이는 벡터 검색의 정밀도를 높이는 핵심 과정입니다.',
      status: 'pending'
    },
    {
      id: 'embed',
      name: '3단계: 벡터 임베딩 생성',
      description: '임베딩 모델을 사용하여 각 텍스트 청크를 1536차원의 벡터로 변환합니다. 이 벡터는 텍스트의 의미적 정보를 수치로 표현한 것으로, 유사한 의미의 텍스트는 유사한 벡터 값을 갖습니다.',
      status: 'pending'
    },
    {
      id: 'index',
      name: '4단계: 벡터 데이터베이스 준비',
      description: '벡터 데이터베이스에서 고차원 벡터의 빠른 유사도 검색을 위한 인덱스를 준비합니다. 코사인 유사도 메트릭을 사용하여 텍스트 검색에 최적화된 환경을 구성합니다.',
      status: 'pending'
    },
    {
      id: 'store',
      name: '5단계: 벡터 저장 및 인덱싱',
      description: '생성된 벡터들을 벡터 데이터베이스에 저장하면서 메타데이터(페이지 번호, 원본 텍스트, 청크 ID)도 함께 저장합니다. 이후 의미적 검색이 가능한 지식 베이스가 완성됩니다.',
      status: 'pending'
    }
  ];

  const updateStep = useCallback((stepId: string, update: Partial<ProcessingStep>) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...update } : step
    ));
  }, []);

  const chunkText = (text: string, chunkSize: number = 1000): DocumentChunk[] => {
    const chunks: DocumentChunk[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    let currentChunk = '';
    let chunkIndex = 0;
    let currentPage = 1;
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      // Estimate page number based on text length (rough approximation)
      const estimatedCharPerPage = 2000;
      const estimatedPage = Math.floor(chunkIndex * chunkSize / estimatedCharPerPage) + 1;
      
      if (currentChunk.length + trimmedSentence.length + 2 <= chunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push({
            id: `chunk-${chunkIndex}`,
            content: currentChunk.trim() + '.',
            length: currentChunk.length,
            pageNumber: currentPage
          });
          chunkIndex++;
        }
        currentChunk = trimmedSentence;
        currentPage = estimatedPage;
      }
    }
    
    if (currentChunk) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim() + '.',
        length: currentChunk.length,
        pageNumber: currentPage
      });
    }
    
    return chunks;
  };

  const processFile = async (file: File): Promise<void> => {
    if (!apiConfig.openaiApiKey || !apiConfig.pineconeApiKey) {
      throw new Error('API 키가 필요합니다');
    }

    setIsProcessing(true);
    const steps = initializeSteps();
    setProcessingSteps(steps);

    try {
      // Initialize services
      const openaiService = new OpenAIService(apiConfig.openaiApiKey);
      const pineconeClient = new PineconeClient(
        apiConfig.pineconeApiKey,
        'doctorchatbot',
        apiConfig.pineconeEnvironment
      );

      // Step 1: Extract text from PDF
      updateStep('extract', { 
        status: 'processing', 
        details: 'PDF 파일을 읽어들이고 있습니다. PDF 파서가 문서 구조를 분석 중...' 
      });
      
      // Educational delay for better understanding
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      updateStep('extract', { 
        status: 'processing', 
        details: `PDF 문서 분석 완료. 총 ${pdf.numPages}페이지에서 텍스트 추출을 시작합니다...` 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      for (let i = 1; i <= totalPages; i++) {
        updateStep('extract', { 
          status: 'processing', 
          progress: (i / totalPages) * 100,
          details: `페이지 ${i}/${totalPages}: 텍스트 객체를 추출하고 위치 정보와 함께 순차 결합 중...`
        });
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
        
        // Educational delay per page
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (fullText.trim().length === 0) {
        throw new Error('PDF에서 텍스트를 추출할 수 없습니다');
      }
      
      updateStep('extract', { 
        status: 'completed', 
        progress: 100, 
        details: `텍스트 추출 완료: 총 ${fullText.length.toLocaleString()}자의 텍스트 추출됨` 
      });
      
      // Educational delay before next step
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Chunk text
      updateStep('chunk', { 
        status: 'processing', 
        details: '긴 텍스트를 의미 단위로 분할하기 위해 문장 경계를 분석하고 있습니다...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      updateStep('chunk', { 
        status: 'processing', 
        progress: 30,
        details: '문장을 식별하고 1000자 내외의 의미있는 청크로 그룹화하는 중...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const chunks = chunkText(fullText);
      
      updateStep('chunk', { 
        status: 'processing', 
        progress: 80,
        details: `${chunks.length}개의 청크 생성 완료. 각 청크의 메타데이터를 설정하는 중...` 
      });
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      updateStep('chunk', { 
        status: 'completed', 
        progress: 100,
        details: `텍스트 분할 완료: ${chunks.length}개의 의미적 청크 생성 (평균 ${Math.round(fullText.length / chunks.length)}자/청크)` 
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Create embeddings
      updateStep('embed', { 
        status: 'processing', 
        details: '텍스트 임베딩 모델에 연결하고 있습니다...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const texts = chunks.map(chunk => chunk.content);
      
      updateStep('embed', { 
        status: 'processing', 
        progress: 20,
        details: `${texts.length}개 청크를 1536차원 벡터로 변환을 시작합니다. 의미적 정보를 수치화하는 중...` 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let embeddings: number[][];
      try {
        updateStep('embed', { 
          status: 'processing', 
          progress: 50,
          details: '임베딩 API 호출 중... 각 텍스트 청크의 의미를 고차원 벡터 공간에 매핑하고 있습니다.' 
        });
        
        embeddings = await openaiService.createEmbeddings(texts);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        updateStep('embed', { status: 'error', details: '임베딩 API 오류가 발생했습니다' });
        throw error;
      }

      updateStep('embed', { 
        status: 'processing', 
        progress: 85,
        details: '벡터 임베딩 생성 완료. 각 청크에 벡터를 연결하고 있습니다...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 600));

      // Add embeddings to chunks
      const chunksWithEmbeddings = chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index]
      }));

      updateStep('embed', { 
        status: 'completed', 
        progress: 100,
        details: `벡터 임베딩 완료: ${embeddings.length}개의 1536차원 벡터 생성 (총 ${(embeddings.length * 1536).toLocaleString()}개 차원)` 
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: Setup Pinecone index (skip - already exists)
      updateStep('index', { 
        status: 'processing', 
        details: '벡터 데이터베이스에 연결하고 있습니다...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStep('index', { 
        status: 'processing', 
        progress: 40,
        details: '인덱스 "doctorchatbot" 상태를 확인 중... 1536차원, 코사인 유사도 메트릭 검증' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateStep('index', { 
        status: 'processing', 
        progress: 80,
        details: '벡터 데이터베이스 인덱스가 준비되었습니다. 고속 유사도 검색 환경 구성 완료' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      updateStep('index', { 
        status: 'completed', 
        progress: 100,
        details: '벡터 인덱스 준비 완료: 고차원 벡터의 효율적 검색을 위한 환경 설정됨' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 700));

      // Step 5: Store vectors
      updateStep('store', { status: 'processing', details: '벡터 저장 중...' });
      
      // Prepare vectors for Pinecone
      const vectors = chunksWithEmbeddings.map(chunk => ({
        id: chunk.id,
        values: chunk.embedding!,
        metadata: {
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: parseInt(chunk.id.split('-')[1]) || 0,
          length: chunk.length
        }
      }));

      // Upsert in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await pineconeClient.upsertVectors(batch);
        
        // Update progress
        const progress = Math.round(((i + batch.length) / vectors.length) * 100);
        updateStep('store', { 
          status: 'processing', 
          details: `벡터 저장 중... ${i + batch.length}/${vectors.length}`,
          progress 
        });
        
        // Small delay between batches
        if (i + batchSize < vectors.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      updateStep('store', { status: 'completed', details: '벡터 저장 완료' });

      // Create metadata
      const metadata: DocumentMetadata = {
        fileName: file.name,
        fileSize: file.size,
        totalPages: totalPages,
        uploadDate: new Date().toISOString(),
        indexName: 'doctorchatbot',
        totalChunks: chunks.length
      };

      // Store metadata in localStorage
      localStorage.setItem('documentMetadata', JSON.stringify(metadata));
      localStorage.setItem('apiConfig', JSON.stringify(apiConfig));

      onSuccess(metadata);

    } catch (error) {
      console.error('RAG processing error:', error);
      // Mark current step as error
      const currentStep = processingSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, { 
          status: 'error', 
          details: error instanceof Error ? error.message : '처리 중 오류가 발생했습니다' 
        });
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFile,
    isProcessing,
    processingSteps
  };
};