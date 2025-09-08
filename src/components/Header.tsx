import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">📚</div>
          <h1 className="logo-text">DocChat</h1>
        </div>
        <p className="header-subtitle">
          PDF 문서를 업로드하고 AI와 대화하세요
        </p>
      </div>
    </header>
  )
}