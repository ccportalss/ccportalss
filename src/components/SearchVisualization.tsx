import React from 'react';
import { VectorSearchResult } from '../types';

interface SearchVisualizationProps {
  searchResults: VectorSearchResult[];
  searchStep: {
    status: 'idle' | 'embedding' | 'searching' | 'generating' | 'completed';
    details: string;
  };
}

export const SearchVisualization: React.FC<SearchVisualizationProps> = ({
  searchResults,
  searchStep
}) => {
  if (searchStep.status === 'idle') return null;

  const getStatusIcon = () => {
    switch (searchStep.status) {
      case 'embedding':
        return '🔄';
      case 'searching':
        return '🔍';
      case 'generating':
        return '🤖';
      case 'completed':
        return '✅';
      default:
        return '⏳';
    }
  };

  const getStatusText = () => {
    switch (searchStep.status) {
      case 'embedding':
        return '1️⃣ 질문 벡터화 과정';
      case 'searching':
        return '2️⃣ 의미적 유사도 검색';
      case 'generating':
        return '3️⃣ AI 답변 생성';
      case 'completed':
        return '✅ RAG 처리 완료';
      default:
        return '🔄 처리 중';
    }
  };

  return (
    <div className="search-visualization">
      <div className="search-header">
        <h3>🔍 실시간 RAG 검색 과정</h3>
        <p>사용자 질문이 어떻게 관련 문서를 찾고 AI 답변을 생성하는지 실시간으로 확인하세요</p>
      </div>
      
      <div className="search-status">
        <div className="status-indicator">
          <span className="status-icon">{getStatusIcon()}</span>
          <div className="status-content">
            <h4>{getStatusText()}</h4>
            <p>{searchStep.details}</p>
          </div>
        </div>
        
        {searchStep.status === 'searching' || searchStep.status === 'generating' ? (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : null}
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h5>🎯 검색된 관련 문서 ({searchResults.length}개)</h5>
          <div className="results-list">
            {searchResults.map((result, index) => (
              <div key={result.id} className="search-result-item">
                <div className="result-header">
                  <span className="result-rank">#{index + 1}</span>
                  <div className="result-meta">
                    <span className="page-info">페이지 {result.metadata.pageNumber}</span>
                    <span className="similarity-score">
                      유사도: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="result-content">
                  {result.content.length > 200 
                    ? result.content.substring(0, 200) + '...' 
                    : result.content
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchStep.status === 'completed' && searchResults.length === 0 && (
        <div className="no-results">
          <h5>❌ 검색 결과 없음</h5>
          <p>유사도 임계값(0.7) 이상의 관련 문서를 찾을 수 없습니다.</p>
          <details className="debug-info">
            <summary>디버깅 정보</summary>
            <p>• 임계값을 낮춰서 다시 시도하거나</p>
            <p>• 더 구체적인 질문을 해보세요</p>
          </details>
        </div>
      )}
    </div>
  );
};