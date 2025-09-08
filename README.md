# RAG Document Chatbot

OpenAI + Pinecone을 활용한 실제 RAG(Retrieval Augmented Generation) 시스템 기반 PDF 챗봇입니다.

## 🧠 RAG 아키텍처

### PDF 업로드 → 벡터 DB 저장
```
📄 PDF 업로드
  ↓ PDF.js로 텍스트 추출
📝 텍스트 청킹 (1000자 단위)
  ↓ OpenAI Embeddings API (text-embedding-3-small)
🧮 벡터 임베딩 생성 (1536차원)
  ↓ Pinecone API
🗄️ 벡터 DB 저장 (메타데이터 포함)
```

### 질문 → GPT 답변 생성
```
❓ 사용자 질문
  ↓ OpenAI Embeddings API  
🧮 질문 벡터 임베딩
  ↓ Pinecone 유사도 검색
🔍 관련 문서 청크 검색 (top-k)
  ↓ 컨텍스트 + 질문 조합
🤖 GPT-3.5-turbo 스트리밍 답변
  ↓ 실시간 응답
💬 사용자에게 답변 표시
```

## 🚀 빠른 시작

### 1. 필요한 API 키 준비
- **OpenAI API Key**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Pinecone API Key**: [https://app.pinecone.io](https://app.pinecone.io)

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 브라우저에서 실행
1. http://localhost:3000 접속
2. API 키 설정
3. PDF 업로드 및 질문

## 💰 예상 비용

- **OpenAI 임베딩**: $0.0001/1K 토큰
- **OpenAI GPT-3.5**: $0.002/1K 토큰  
- **Pinecone**: 1M 벡터까지 무료
- **예시**: 50페이지 PDF → 약 $0.10 내외

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** - 빠른 개발 환경
- **PDF.js** - PDF 텍스트 추출
- **Modern CSS** - 아름다운 UI

### AI & Vector DB
- **OpenAI GPT-3.5 Turbo** - 답변 생성
- **OpenAI Embeddings** - 벡터 임베딩
- **Pinecone** - 벡터 데이터베이스
- **RAG Pipeline** - 검색 증강 생성

## ✨ 주요 기능

🧠 **실제 RAG 시스템**
- 벡터 임베딩 기반 의미 검색
- GPT API 스트리밍 응답
- Pinecone 벡터 데이터베이스

🎯 **실시간 프로세스 시각화**
- PDF 처리 단계별 진행 상황
- 벡터 검색 결과 표시
- 유사도 점수 및 출처 페이지

💫 **현대적인 UX**
- 반응형 디자인
- 부드러운 애니메이션
- 타입 안전한 개발

## 📋 프로세스 시각화

앱에서 다음 과정들을 실시간으로 확인할 수 있습니다:

1. **PDF 텍스트 추출** - 진행률 표시
2. **텍스트 분할** - 청크 수 표시  
3. **임베딩 생성** - OpenAI API 호출
4. **Pinecone 인덱스 설정** - 벡터 DB 준비
5. **벡터 저장** - 배치 업로드
6. **질문 임베딩** - 실시간 검색
7. **유사도 검색 결과** - 관련 문서 표시
8. **GPT 답변 생성** - 스트리밍 응답

## 🔧 개발 명령어

```bash
# 타입 체크
npm run type-check

# 개발 서버  
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/           # React 컴포넌트
│   ├── Header.tsx       # 앱 헤더
│   ├── UploadSection.tsx # PDF 업로드
│   ├── ProcessingSteps.tsx # RAG 프로세스 시각화
│   ├── ChatSection.tsx   # 채팅 인터페이스
│   ├── SearchVisualization.tsx # 검색 결과 표시
│   └── APIConfigModal.tsx # API 키 설정
├── services/            # 외부 서비스
│   ├── openai.ts       # OpenAI API 클라이언트
│   └── pinecone.ts     # Pinecone API 클라이언트  
├── hooks/              # 커스텀 훅
│   ├── useRAGProcessor.ts # RAG 처리 파이프라인
│   └── useRAGChat.ts     # RAG 채팅 로직
├── types.ts            # TypeScript 타입
├── App.tsx            # 메인 앱
└── main.tsx           # 앱 엔트리포인트
```

## 🌐 배포

### Vercel (추천)
```bash
npm run build
vercel --prod
```

### Netlify
1. `npm run build` 실행
2. `dist` 폴더를 Netlify에 업로드

### 주의사항
- 프로덕션에서는 API 키를 서버사이드에서 관리하세요
- 현재 버전은 데모용으로 브라우저에서 직접 API 호출합니다

## 🔐 보안 권장사항

1. **API 키 보안**: 프로덕션에서는 백엔드에서 API 호출
2. **Rate Limiting**: OpenAI API 사용량 제한 설정
3. **파일 크기 제한**: PDF 업로드 크기 제한 (현재 50MB)
4. **CORS 설정**: 프로덕션 환경에 맞는 CORS 설정