import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { DocumentMetadata, Message } from '../types'

interface ChatSectionProps {
  documentMetadata: DocumentMetadata
  messages: Message[]
  onSendMessage: (message: string) => void
  isGenerating: boolean
  onReset: () => void
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  documentMetadata,
  messages,
  onSendMessage,
  isGenerating,
  onReset
}) => {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isGenerating) return

    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const autoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  useEffect(() => {
    autoResize()
  }, [inputValue])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024 
      ? `${Math.round(bytes / 1024)}KB` 
      : `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="chat-section">
      <div className="document-info">
        <div className="document-meta">
          <div className="document-icon">📄</div>
          <div className="document-details">
            <h3 className="document-name">{documentMetadata.fileName}</h3>
            <p className="document-stats">
              {documentMetadata.totalPages}페이지 • {formatFileSize(documentMetadata.fileSize)}
            </p>
          </div>
        </div>
        <button className="reset-button" onClick={onReset} title="새 문서 업로드">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12a9 9 0 009-9 9.75 9.75 0 016.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="messages-container">
        <div className="welcome-message">
          <div className="welcome-icon">🤖</div>
          <h4>문서 업로드 완료!</h4>
          <p>문서의 내용에 대해 무엇이든 질문해보세요. 구체적일수록 더 정확한 답변을 받을 수 있습니다.</p>
        </div>

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isGenerating && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">답변을 생성하고 있습니다...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="문서에 대해 질문하세요..."
            disabled={isGenerating}
            rows={1}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isGenerating}
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}