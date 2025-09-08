import { useState } from 'react';
import { OpenAIService } from '../services/openai';
import { PineconeClient } from '../services/pineconeClient';
import { Message, VectorSearchResult, APIConfig } from '../types';

export const useRAGChat = (indexName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>([]);
  const [searchStep, setSearchStep] = useState<{
    status: 'idle' | 'embedding' | 'searching' | 'generating' | 'completed';
    details: string;
  }>({ status: 'idle', details: '' });

  const sendMessage = async (content: string) => {
    // Load API config from localStorage
    const apiConfigStr = localStorage.getItem('apiConfig');
    if (!apiConfigStr) {
      throw new Error('API 설정이 필요합니다');
    }
    
    const apiConfig: APIConfig = JSON.parse(apiConfigStr);
    
    // Initialize services
    const openaiService = new OpenAIService(apiConfig.openaiApiKey);
    const pineconeClient = new PineconeClient(
      apiConfig.pineconeApiKey,
      indexName,
      apiConfig.pineconeEnvironment
    );

    // Add user message
    const userMessage: Message = {
      content,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setSearchResults([]);

    let botMessage: Message | null = null;
    
    try {
      // Step 1: Create embedding for the query  
      setSearchStep({ 
        status: 'embedding', 
        details: '사용자 질문을 분석하고 있습니다. 임베딩 모델을 사용하여 질문을 1536차원 벡터로 변환하는 중...' 
      });
      
      // Educational delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const queryEmbedding = await openaiService.createEmbedding(content);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Search similar vectors
      setSearchStep({ 
        status: 'searching', 
        details: '벡터 데이터베이스에서 코사인 유사도 검색을 수행합니다. 질문 벡터와 가장 유사한 문서 청크들을 찾는 중...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const searchResults = await pineconeClient.query(queryEmbedding, 10, 0.0); // 임계값 0으로 설정
      setSearchResults(searchResults);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('🔍 검색 결과:', {
        query: content,
        resultsCount: searchResults.length,
        results: searchResults.map(r => ({
          score: r.score,
          content: r.content.substring(0, 100) + '...'
        }))
      });

      if (searchResults.length === 0) {
        setSearchStep({ status: 'completed', details: '관련 문서를 찾을 수 없습니다' });
        
        botMessage = {
          content: '죄송합니다. 업로드된 문서에서 관련된 내용을 찾을 수 없습니다. 다른 질문을 시도해보세요.',
          type: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage!]);
        return;
      }

      // Step 3: Generate response with context
      setSearchStep({ 
        status: 'generating', 
        details: `${searchResults.length}개의 관련 문서를 찾았습니다. 이제 연결된 AI 모델이 컨텍스트를 기반으로 정확한 답변을 생성합니다...` 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const context = searchResults
        .map(result => `[페이지 ${result.metadata.pageNumber}] ${result.content}`)
        .join('\n\n');

      // Create bot message placeholder for streaming
      botMessage = {
        content: '',
        type: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage!]);

      // Generate response with streaming
      await openaiService.generateResponse(
        content,
        context,
        (chunk: string) => {
          // Update the bot message content as chunks arrive
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 && msg.type === 'bot' 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        }
      );

      setSearchStep({ status: 'completed', details: '답변 생성이 완료되었습니다' });

    } catch (error) {
      console.error('RAG chat error:', error);
      
      const errorMessage: Message = {
        content: `죄송합니다. 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        type: 'bot',
        timestamp: new Date()
      };

      // Remove the placeholder message if it exists and add error message
      if (botMessage && botMessage.content === '') {
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      } else {
        setMessages(prev => [...prev, errorMessage]);
      }
      
      setSearchStep({ status: 'idle', details: '' });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    messages,
    sendMessage,
    isGenerating,
    searchResults,
    searchStep
  };
};