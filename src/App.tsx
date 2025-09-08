import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { UploadSection } from './components/UploadSection'
import { ChatSection } from './components/ChatSection'
import { ProcessingSteps } from './components/ProcessingSteps'
import { APIConfigModal } from './components/APIConfigModal'
import { SearchVisualization } from './components/SearchVisualization'
import { EducationalSection } from './components/EducationalSection'
import { useRAGProcessor } from './hooks/useRAGProcessor'
import { useRAGChat } from './hooks/useRAGChat'
import { DocumentMetadata, APIConfig } from './types'
import './App.css'

function App() {
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null)
  const [apiConfig, setApiConfig] = useState<APIConfig | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)

  // Initialize API config from environment variables or localStorage
  useEffect(() => {
    // Try to load from environment variables first
    const envConfig: APIConfig = {
      openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      pineconeApiKey: import.meta.env.VITE_PINECONE_API_KEY || '',
      pineconeEnvironment: import.meta.env.VITE_PINECONE_ENVIRONMENT || 'us-east-1-aws'
    }
    
    // If all env vars are available, use them
    if (envConfig.openaiApiKey && envConfig.pineconeApiKey) {
      setApiConfig(envConfig)
      localStorage.setItem('apiConfig', JSON.stringify(envConfig))
    } else {
      // Otherwise, try localStorage
      const storedConfig = localStorage.getItem('apiConfig')
      if (storedConfig) {
        setApiConfig(JSON.parse(storedConfig))
      }
    }
    
    // Load stored metadata if available
    const storedMetadata = localStorage.getItem('documentMetadata')
    if (storedMetadata && (envConfig.openaiApiKey || localStorage.getItem('apiConfig'))) {
      const metadata = JSON.parse(storedMetadata)
      setDocumentMetadata(metadata)
      setShowChat(true)
    }
  }, [])

  const { processFile, processingSteps } = useRAGProcessor({
    apiConfig: apiConfig!,
    onSuccess: (metadata) => {
      setDocumentMetadata(metadata)
      setShowProcessing(false)
      setShowChat(true)
    }
  })

  const { messages, sendMessage, isGenerating, searchResults, searchStep } = useRAGChat(
    documentMetadata?.indexName || ''
  )

  const handleFileUpload = (file: File) => {
    if (!apiConfig) {
      setShowApiModal(true)
      return
    }
    setShowProcessing(true)
    processFile(file)
  }

  const handleApiConfigSave = (config: APIConfig) => {
    setApiConfig(config)
    localStorage.setItem('apiConfig', JSON.stringify(config))
  }

  const handleReset = () => {
    localStorage.removeItem('documentMetadata')
    localStorage.removeItem('apiConfig')
    setDocumentMetadata(null)
    setApiConfig(null)
    setShowChat(false)
    setShowProcessing(false)
  }

  return (
    <div className="app">
      <div className="app-container">
        <Header />
        
        {!showChat && !showProcessing && (
          <>
            <EducationalSection />
            <UploadSection 
              onFileProcess={handleFileUpload}
              isProcessing={false}
              onConfigureAPI={() => setShowApiModal(true)}
              hasAPIConfig={!!apiConfig}
            />
          </>
        )}

        {showProcessing && (
          <ProcessingSteps 
            steps={processingSteps}
          />
        )}
        
        {showChat && documentMetadata && (
          <>
            <ChatSection
              documentMetadata={documentMetadata}
              messages={messages}
              onSendMessage={sendMessage}
              isGenerating={isGenerating}
              onReset={handleReset}
            />
            
            <SearchVisualization
              searchResults={searchResults}
              searchStep={searchStep}
            />
          </>
        )}

        <APIConfigModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSave={handleApiConfigSave}
          initialConfig={apiConfig || undefined}
        />
      </div>
    </div>
  )
}

export default App