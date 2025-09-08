import React from 'react';
import { ProcessingStep } from '../types';

interface ProcessingStepsProps {
  steps: ProcessingStep[];
}

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ steps }) => {
  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⚙️';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="processing-steps">
      <div className="processing-header">
        <h3>🧠 RAG (Retrieval Augmented Generation) 처리 과정</h3>
        <p>PDF 문서를 AI가 이해할 수 있는 벡터 데이터베이스로 변환하는 전체 과정을 실시간으로 학습해보세요</p>
        <div className="process-overview">
          <span className="overview-item">📄 텍스트 추출</span>
          <span className="arrow">→</span>
          <span className="overview-item">✂️ 청킹</span>
          <span className="arrow">→</span>
          <span className="overview-item">🧮 벡터화</span>
          <span className="arrow">→</span>
          <span className="overview-item">🗄️ DB 저장</span>
          <span className="arrow">→</span>
          <span className="overview-item">🔍 검색 준비</span>
        </div>
        
        <div className="educational-note">
          <div className="note-icon">💡</div>
          <div className="note-content">
            <h4>실시간 학습 포인트</h4>
            <p>각 단계가 진행되면서 실제 RAG 시스템이 어떻게 작동하는지 상세한 설명을 확인하세요. 
            처리 시간은 교육 목적으로 조정되어 있습니다.</p>
          </div>
        </div>
      </div>
      
      <div className="steps-container">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`processing-step ${step.status}`}
          >
            <div className="step-indicator">
              <div className="step-number">
                {step.status === 'processing' ? (
                  <div className="step-spinner" />
                ) : (
                  <span>{getStepIcon(step.status)}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`step-connector ${
                  steps[index + 1].status !== 'pending' ? 'active' : ''
                }`} />
              )}
            </div>
            
            <div className="step-content">
              <div className="step-title">
                <h4>{step.name}</h4>
                <span className={`step-status ${step.status}`}>
                  {step.status === 'pending' && '대기중'}
                  {step.status === 'processing' && '처리중'}
                  {step.status === 'completed' && '완료'}
                  {step.status === 'error' && '오류'}
                </span>
              </div>
              
              <p className="step-description">{step.description}</p>
              
              {step.details && (
                <p className="step-details">{step.details}</p>
              )}
              
              {step.status === 'processing' && step.progress !== undefined && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${step.progress}%` }}
                  />
                  <span className="progress-text">{Math.round(step.progress)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};