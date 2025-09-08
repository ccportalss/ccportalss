import React, { useRef, useState } from 'react'

interface UploadSectionProps {
  onFileProcess: (file: File) => void
  isProcessing: boolean
  onConfigureAPI: () => void
  hasAPIConfig: boolean
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileProcess,
  isProcessing,
  onConfigureAPI,
  hasAPIConfig
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'processing'>('success')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setStatusMessage('PDF 파일만 업로드 가능합니다.')
      setStatusType('error')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setStatusMessage('파일 크기는 50MB 이하여야 합니다.')
      setStatusType('error')
      return
    }

    setStatusMessage('PDF를 처리하고 있습니다...')
    setStatusType('processing')
    onFileProcess(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="upload-section">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="file-input"
        />
        
        <div className="upload-content">
          <div className="upload-animation">
            <div className="upload-icon">
              {isProcessing ? (
                <div className="processing-spinner" />
              ) : (
                '📄'
              )}
            </div>
          </div>
          
          <div className="upload-text">
            <h3>
              {isProcessing 
                ? 'PDF 처리 중...' 
                : 'PDF 파일을 업로드하세요'
              }
            </h3>
            <p>
              {isProcessing 
                ? '문서를 분석하고 있습니다' 
                : '파일을 드래그하거나 클릭하여 선택하세요'
              }
            </p>
          </div>

          {!isProcessing && (
            <button className="upload-button">
              <span>파일 선택</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <div className="upload-features">
        <div className="feature">
          <span className="feature-icon">🧠</span>
          <span>RAG 기반 AI</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🔍</span>
          <span>벡터 검색</span>
        </div>
        <div className="feature">
          <span className="feature-icon">⚡</span>
          <span>GPT 답변</span>
        </div>
      </div>

      {!hasAPIConfig && (
        <div className="api-setup-notice">
          <h4>🔑 API 키 설정 필요</h4>
          <p>OpenAI와 Pinecone API 키가 필요합니다</p>
          <button onClick={onConfigureAPI} className="config-button">
            API 키 설정하기
          </button>
        </div>
      )}
      
      {hasAPIConfig && (
        <div className="api-status">
          <span className="status-indicator">✅ API 키 설정 완료</span>
          <button onClick={onConfigureAPI} className="config-button-small">
            설정 변경
          </button>
        </div>
      )}
    </div>
  )
}