// Global variables
let documentChunks = [];
let documentMetadata = {};

// PDF.js setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadStatus = document.getElementById('uploadStatus');
const uploadSection = document.getElementById('uploadSection');
const chatSection = document.getElementById('chatSection');
const documentInfo = document.getElementById('documentInfo');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loading = document.getElementById('loading');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadStoredDocument();
});

function setupEventListeners() {
    // File input
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Chat input
    messageInput.addEventListener('keypress', handleKeyPress);
    messageInput.addEventListener('input', autoResizeTextarea);
    sendButton.addEventListener('click', sendMessage);
    
    // Auto-resize textarea
    autoResizeTextarea();
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

async function processFile(file) {
    if (file.type !== 'application/pdf') {
        showStatus('PDF 파일만 업로드 가능합니다.', 'error');
        return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showStatus('파일 크기는 50MB 이하여야 합니다.', 'error');
        return;
    }
    
    showStatus('PDF를 처리하고 있습니다...', 'processing');
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        const totalPages = pdf.numPages;
        
        // Extract text from all pages
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }
        
        if (fullText.trim().length === 0) {
            showStatus('PDF에서 텍스트를 추출할 수 없습니다.', 'error');
            return;
        }
        
        // Store document metadata
        documentMetadata = {
            fileName: file.name,
            fileSize: file.size,
            totalPages: totalPages,
            uploadDate: new Date().toISOString()
        };
        
        // Process and chunk the text
        documentChunks = chunkText(fullText);
        
        // Store in localStorage for persistence
        localStorage.setItem('documentChunks', JSON.stringify(documentChunks));
        localStorage.setItem('documentMetadata', JSON.stringify(documentMetadata));
        
        showStatus('문서가 성공적으로 업로드되었습니다!', 'success');
        
        setTimeout(() => {
            showChatInterface();
        }, 1500);
        
    } catch (error) {
        console.error('PDF processing error:', error);
        showStatus('PDF 처리 중 오류가 발생했습니다.', 'error');
    }
}

function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;
        
        if (currentChunk.length + trimmedSentence.length + 1 <= chunkSize) {
            currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
        } else {
            if (currentChunk) {
                chunks.push({
                    id: chunkIndex++,
                    content: currentChunk.trim() + '.',
                    length: currentChunk.length
                });
            }
            currentChunk = trimmedSentence;
        }
    }
    
    if (currentChunk) {
        chunks.push({
            id: chunkIndex,
            content: currentChunk.trim() + '.',
            length: currentChunk.length
        });
    }
    
    return chunks;
}

function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
}

function showChatInterface() {
    uploadSection.style.display = 'none';
    chatSection.style.display = 'flex';
    
    // Show document info
    const { fileName, totalPages, fileSize } = documentMetadata;
    const fileSizeKB = Math.round(fileSize / 1024);
    documentInfo.textContent = `문서: ${fileName} (${totalPages}페이지, ${fileSizeKB}KB)`;
    
    // Clear any existing messages except the welcome message
    const welcomeMessage = messagesContainer.querySelector('.bot-message');
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(welcomeMessage);
    
    messageInput.focus();
}

function loadStoredDocument() {
    try {
        const storedChunks = localStorage.getItem('documentChunks');
        const storedMetadata = localStorage.getItem('documentMetadata');
        
        if (storedChunks && storedMetadata) {
            documentChunks = JSON.parse(storedChunks);
            documentMetadata = JSON.parse(storedMetadata);
            showChatInterface();
        }
    } catch (error) {
        console.error('Error loading stored document:', error);
        localStorage.removeItem('documentChunks');
        localStorage.removeItem('documentMetadata');
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || documentChunks.length === 0) return;
    
    // Disable input
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    autoResizeTextarea();
    
    // Show loading
    loading.style.display = 'block';
    
    try {
        // Find relevant chunks
        const relevantChunks = findRelevantChunks(message, 3);
        const context = relevantChunks.map(chunk => chunk.content).join('\n\n');
        
        // Generate response using free LLM API
        const response = await generateResponse(message, context);
        
        // Add bot response to chat
        addMessage(response, 'bot');
        
    } catch (error) {
        console.error('Error generating response:', error);
        addMessage('죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'bot');
    } finally {
        // Hide loading and re-enable input
        loading.style.display = 'none';
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

function findRelevantChunks(query, maxChunks = 3) {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Score chunks based on keyword matches
    const scoredChunks = documentChunks.map(chunk => {
        const chunkText = chunk.content.toLowerCase();
        let score = 0;
        
        queryWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            const matches = chunkText.match(regex);
            if (matches) {
                score += matches.length;
            }
        });
        
        // Boost score for exact phrase matches
        if (chunkText.includes(query.toLowerCase())) {
            score += 10;
        }
        
        return { ...chunk, score };
    });
    
    // Sort by score and return top chunks
    return scoredChunks
        .sort((a, b) => b.score - a.score)
        .slice(0, maxChunks)
        .filter(chunk => chunk.score > 0);
}

async function generateResponse(query, context) {
    // Try multiple free LLM APIs with fallback
    const apis = [
        {
            name: 'Hugging Face',
            endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                inputs: `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`
            }
        }
    ];
    
    // If no API key available, use local processing
    return generateLocalResponse(query, context);
}

function generateLocalResponse(query, context) {
    // Simple rule-based response generation for MVP
    if (context.length === 0) {
        return "죄송하지만 질문과 관련된 내용을 문서에서 찾을 수 없습니다. 다른 질문을 해보시거나 더 구체적으로 질문해주세요.";
    }
    
    // Extract most relevant sentences from context
    const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    let bestSentences = sentences
        .map(sentence => {
            const sentenceLower = sentence.toLowerCase();
            let score = 0;
            queryWords.forEach(word => {
                if (sentenceLower.includes(word)) score++;
            });
            return { sentence: sentence.trim(), score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .filter(item => item.score > 0)
        .map(item => item.sentence);
    
    if (bestSentences.length === 0) {
        bestSentences = sentences.slice(0, 2);
    }
    
    // Generate a structured response
    let response = "문서 내용을 바탕으로 답변드리겠습니다:\n\n";
    response += bestSentences.join(". ") + ".";
    
    if (bestSentences.length > 1) {
        response += "\n\n더 자세한 내용이 필요하시면 구체적인 질문을 해주세요.";
    }
    
    return response;
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${content}</p>`;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Additional utility functions
function clearChat() {
    localStorage.removeItem('documentChunks');
    localStorage.removeItem('documentMetadata');
    location.reload();
}

// Add a clear button for development/testing
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        if (confirm('채팅 기록과 문서를 모두 삭제하시겠습니까?')) {
            clearChat();
        }
    }
});