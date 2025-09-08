import React, { useState, useEffect } from 'react';
import { APIConfig } from '../types';

interface APIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: APIConfig) => void;
  initialConfig?: APIConfig;
}

export const APIConfigModal: React.FC<APIConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<APIConfig>({
    openaiApiKey: '',
    pineconeApiKey: '',
    pineconeEnvironment: 'us-east-1-aws'
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.openaiApiKey && config.pineconeApiKey) {
      onSave(config);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>API 설정</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="api-config-form">
          <div className="config-section">
            <h3>OpenAI API</h3>
            <p className="section-description">
              텍스트 임베딩 생성과 GPT 응답에 사용됩니다.
            </p>
            <div className="input-group">
              <label htmlFor="openai-key">OpenAI API Key</label>
              <input
                id="openai-key"
                type="password"
                value={config.openaiApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                placeholder="sk-..."
                required
              />
              <small>
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  OpenAI API 키 발급받기 →
                </a>
              </small>
            </div>
          </div>

          <div className="config-section">
            <h3>Pinecone Vector DB</h3>
            <p className="section-description">
              문서 벡터 저장과 유사도 검색에 사용됩니다.
            </p>
            <div className="input-group">
              <label htmlFor="pinecone-key">Pinecone API Key</label>
              <input
                id="pinecone-key"
                type="password"
                value={config.pineconeApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, pineconeApiKey: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
              <small>
                <a href="https://app.pinecone.io" target="_blank" rel="noopener noreferrer">
                  Pinecone API 키 발급받기 →
                </a>
              </small>
            </div>
            
            <div className="input-group">
              <label htmlFor="pinecone-env">Environment</label>
              <select
                id="pinecone-env"
                value={config.pineconeEnvironment}
                onChange={(e) => setConfig(prev => ({ ...prev, pineconeEnvironment: e.target.value }))}
              >
                <option value="us-east-1-aws">us-east-1-aws</option>
                <option value="us-west-1-aws">us-west-1-aws</option>
                <option value="us-central1-gcp">us-central1-gcp</option>
                <option value="europe-west1-gcp">europe-west1-gcp</option>
              </select>
            </div>
          </div>

          <div className="cost-info">
            <h4>💰 예상 비용</h4>
            <ul>
              <li><strong>OpenAI:</strong> 임베딩 $0.0001/1K 토큰, GPT-3.5 $0.002/1K 토큰</li>
              <li><strong>Pinecone:</strong> 1M 벡터까지 무료, 이후 $70/월</li>
              <li><strong>예시:</strong> 50페이지 PDF → 약 $0.10 내외</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!config.openaiApiKey || !config.pineconeApiKey}
            >
              저장하고 시작
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};