import React, { useState } from 'react';

export const EducationalSection: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const educationalSteps = [
    {
      id: 'upload',
      title: '1. 문서 처리 및 텍스트 추출',
      summary: '구조화되지 않은 PDF 문서를 기계 판독 가능한 텍스트로 변환',
      details: `PDF 문서는 <strong>복합적인 구조</strong>를 가지고 있어 단순한 텍스트 파일과는 다릅니다.

이 단계에서는 <strong>PDF 파싱 엔진</strong>이 문서 내부의 <strong>객체 스트림을 해석</strong>하여 텍스트 요소를 식별합니다.

<strong>주요 처리 과정:</strong>
• <strong>바이너리 PDF 구조 분석</strong> 및 객체 추출
• 텍스트 객체의 <strong>좌표 정보와 폰트 메타데이터</strong> 수집  
• 페이지별 <strong>텍스트 스트림 추출</strong> 및 문자 인코딩 처리
• <strong>텍스트 플로우 재구성</strong> (읽기 순서 복원)
• 특수문자, 줄바꿈, 공백 처리 표준화

<strong>핵심 가치:</strong>
이 과정을 통해 <strong>비정형 문서가 후속 NLP 처리가 가능한 구조화된 텍스트 데이터</strong>로 변환됩니다.

<strong>추출 품질은 전체 RAG 시스템의 성능에 직접적인 영향</strong>을 미치므로 매우 중요한 단계입니다.`
    },
    {
      id: 'chunk',
      title: '2. 의미 단위 텍스트 분할',
      summary: '긴 문서를 검색에 최적화된 의미 있는 단위로 분할',
      details: `텍스트 청킹은 단순한 길이 기반 분할이 아닌, <strong>의미론적 일관성을 유지하는 지능적 분할 과정</strong>입니다.

이는 <strong>정보 검색의 정밀도와 컨텍스트 보존 사이의 최적 균형점</strong>을 찾는 핵심 기술입니다.

<strong>분할 전략 및 고려사항:</strong>
• <strong>문장 경계 인식:</strong> 온점, 물음표, 느낌표 등의 문장 종결 기호 분석
• <strong>문단 구조 보존:</strong> 논리적 단락과 주제의 연속성 유지
• <strong>크기 최적화:</strong> 1000자 내외로 설정 (토큰 제한과 의미 보존의 절충점)
• <strong>오버래핑 처리:</strong> 문맥 손실 방지를 위한 청크 간 중복 영역 설정
• <strong>메타데이터 부착:</strong> 원본 페이지 번호, 섹션 정보, 청크 순서 등

<strong>주의사항:</strong>
<strong>잘못된 청킹은 정보 단편화나 의미 왜곡을 초래</strong>할 수 있으므로, 문서 유형에 따른 적응적 분할 전략이 필요합니다.`
    },
    {
      id: 'embed',
      title: '3. 벡터 임베딩 생성',
      summary: '텍스트를 1536차원 고차원 벡터 공간에 수치적으로 매핑',
      details: `임베딩은 <strong>자연어를 기계가 이해할 수 있는 수치적 표현으로 변환</strong>하는 핵심 기술입니다.

단순한 단어 빈도나 TF-IDF와 달리, <strong>트랜스포머 기반 모델을 통해 문맥적 의미를 포착</strong>합니다.

<strong>임베딩 생성 원리:</strong>
• <strong>트랜스포머 인코더</strong>를 통한 토큰별 컨텍스트화된 표현 생성
• <strong>어텐션 메커니즘</strong>으로 단어 간 관계성 모델링
• 마지막 히든 레이어의 <strong>평균 풀링</strong>을 통한 문장 레벨 임베딩
• <strong>L2 정규화</strong>를 통한 벡터 크기 표준화

<strong>1536차원 벡터의 의미:</strong>
각 차원은 <strong>특정한 의미적 특성</strong>을 나타내며, 유사한 의미의 텍스트는 <strong>벡터 공간에서 가까운 위치</strong>에 배치됩니다.

예시: "자동차"와 "차량"은 <strong>높은 코사인 유사도(0.8~0.9)</strong>를 가지게 됩니다.

<strong>핵심 장점:</strong>
이 과정을 통해 <strong>텍스트의 의미적 뉘앙스까지 수치로 캡처</strong>할 수 있어, <strong>키워드 기반 검색으로는 불가능한 의미적 연관성 탐지</strong>가 가능해집니다.`
    },
    {
      id: 'store',
      title: '4. 벡터 데이터베이스 저장 및 인덱싱',
      summary: '고차원 벡터의 효율적 저장과 고속 검색을 위한 인덱스 구조 구축',
      details: `벡터 데이터베이스는 <strong>전통적인 관계형 DB와는 근본적으로 다른 구조</strong>를 가집니다.

<strong>1536차원의 고차원 공간에서 수백만 개의 벡터 중 유사한 것을 밀리초 단위로 찾아내는 것</strong>이 핵심 목표입니다.

<strong>인덱싱 알고리즘과 최적화:</strong>
• <strong>HNSW(Hierarchical Navigable Small World):</strong> 그래프 기반 근사 최근접 이웃 검색
• <strong>계층적 구조</strong>를 통한 검색 복잡도 <strong>O(log N) 달성</strong>
• <strong>벡터 양자화(Vector Quantization)</strong>를 통한 메모리 사용량 최적화
• <strong>클러스터링 기반 파티셔닝</strong>으로 검색 공간 축소

<strong>메타데이터 관리:</strong>
• <strong>원본 텍스트 내용</strong> (검색 결과 표시용)
• <strong>문서 페이지 번호 및 위치 정보</strong>
• <strong>청크 순서 및 인접 청크와의 관계</strong>
• <strong>문서 업로드 타임스탬프 및 버전 정보</strong>

<strong>성능 특성:</strong>
• 검색 지연시간: <strong>~10-50ms</strong> (인덱스 크기에 따라)
• 검색 정확도: <strong>95% 이상의 리콜률 보장</strong>
• 동시 처리: <strong>수천 개의 동시 검색 쿼리 처리 가능</strong>`
    },
    {
      id: 'search',
      title: '5. 의미적 유사도 검색',
      summary: '사용자 질문과 의미적으로 가장 관련성 높은 문서 세그먼트 검색',
      details: `의미적 검색은 <strong>전통적인 키워드 매칭을 넘어선 차세대 정보 검색 기술</strong>입니다.

<strong>사용자의 의도와 맥락을 이해</strong>하여 직접적인 키워드가 없어도 관련 정보를 찾아낼 수 있습니다.

<strong>검색 프로세스:</strong>
• <strong>질문 임베딩:</strong> 사용자 쿼리를 동일한 임베딩 모델로 벡터화
• <strong>유사도 계산:</strong> 코사인 유사도 공식 적용 <strong>(dot(A,B) / |A||B|)</strong>
• <strong>순위 결정:</strong> 유사도 점수 기반 내림차순 정렬
• <strong>임계값 필터링:</strong> 의미 없는 낮은 유사도 결과 제거

<strong>코사인 유사도의 해석:</strong>
• <strong>0.9~1.0:</strong> 매우 높은 관련성 (거의 동일한 의미)
• <strong>0.7~0.9:</strong> 높은 관련성 (명확한 의미적 연관성)
• <strong>0.5~0.7:</strong> 중간 관련성 (부분적 연관성)
• <strong>0.3~0.5:</strong> 낮은 관련성 (약한 연관성)

<strong>검색 최적화 기법:</strong>
• <strong>재랭킹(Re-ranking):</strong> 초기 검색 결과를 추가 신호로 재정렬
• <strong>쿼리 확장:</strong> 동의어나 관련 용어를 활용한 검색 확장
• <strong>하이브리드 검색:</strong> 벡터 검색과 키워드 검색의 결합`
    },
    {
      id: 'generate',
      title: '6. 컨텍스트 증강 답변 생성',
      summary: '검색된 문서를 근거로 정확하고 구체적인 답변 생성',
      details: `컨텍스트 증강 생성은 <strong>RAG의 핵심</strong>으로, <strong>일반적인 언어모델의 한계를 극복하는 혁신적 접근법</strong>입니다.

모델의 내재된 지식에만 의존하지 않고, <strong>실시간으로 검색된 특정 문서를 근거로 답변을 생성</strong>합니다.

<strong>답변 생성 메커니즘:</strong>
• <strong>프롬프트 엔지니어링:</strong> 검색된 컨텍스트와 질문을 최적 형태로 구조화
• <strong>컨텍스트 윈도우 관리:</strong> 토큰 제한 내에서 가장 관련성 높은 정보 선별
• <strong>인용 생성:</strong> 답변의 각 부분이 어떤 문서에서 나온 것인지 추적
• <strong>일관성 검증:</strong> 여러 소스 간 상충하는 정보 식별 및 처리

<strong>프롬프트 구조 예시:</strong>
"""
다음 문서들을 참고하여 질문에 답하시오:

[문서 1] (페이지 X): [관련 텍스트]
[문서 2] (페이지 Y): [관련 텍스트]
...

질문: [사용자 질문]

조건:
- <strong>제공된 문서 내용만을 근거로 답변할 것</strong>
- <strong>확실하지 않은 내용은 추측하지 말 것</strong>  
- <strong>출처 페이지를 명시할 것</strong>
"""

<strong>품질 보장 요소:</strong>
• <strong>Hallucination 방지:</strong> 제공된 컨텍스트 범위 내에서만 답변
• <strong>정확성 검증:</strong> 생성된 답변과 원본 문서 간 팩트 체크
• <strong>완전성:</strong> 질문의 모든 측면을 다루는 포괄적 답변
• <strong>추적가능성:</strong> 각 정보의 출처를 명확히 제시하여 검증 가능한 답변 제공`
    }
  ];

  return (
    <div className="educational-section">
      <div className="edu-header">
        <h2>RAG (Retrieval Augmented Generation) Architecture</h2>
        <p>문서 기반 AI 시스템의 핵심 구조와 정보 검색 증강 생성 파이프라인 분석</p>
      </div>

      <div className="edu-overview">
        <div className="process-flow">
          {educationalSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flow-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-label">{step.title.split('.')[1]?.trim()}</div>
              </div>
              {index < educationalSteps.length - 1 && (
                <div className="flow-arrow">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="edu-steps">
        {educationalSteps.map((step) => (
          <div key={step.id} className={`edu-step ${expandedSection === step.id ? 'expanded' : ''}`}>
            <div 
              className="step-header" 
              onClick={() => toggleSection(step.id)}
            >
              <div className="step-info">
                <div className="step-number-large">{step.title.split('.')[0]}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.summary}</p>
                </div>
              </div>
              <div className="expand-icon">
                {expandedSection === step.id ? '−' : '+'}
              </div>
            </div>
            
            {expandedSection === step.id && (
              <div className="step-details">
                <div className="details-content">
                  <div 
                    style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: step.details }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="edu-footer">
        <div className="key-concepts">
          <h3>🔑 핵심 기술 구성요소</h3>
          <div className="concepts-grid">
            <div className="concept-item">
              <div className="concept-number">01</div>
              <div>
                <h4>벡터 임베딩</h4>
                <p>텍스트를 고차원 수치 공간으로 변환하여 의미를 표현하는 기술</p>
              </div>
            </div>
            <div className="concept-item">
              <div className="concept-number">02</div>
              <div>
                <h4>코사인 유사도</h4>
                <p>벡터 간 각도를 기반으로 의미적 유사성을 측정하는 알고리즘</p>
              </div>
            </div>
            <div className="concept-item">
              <div className="concept-number">03</div>
              <div>
                <h4>의미적 검색</h4>
                <p>키워드가 아닌 의미와 맥락을 이해하여 정보를 찾는 시스템</p>
              </div>
            </div>
            <div className="concept-item">
              <div className="concept-number">04</div>
              <div>
                <h4>컨텍스트 증강</h4>
                <p>검색된 문서 정보를 활용해 AI 답변 품질을 향상시키는 방법</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};