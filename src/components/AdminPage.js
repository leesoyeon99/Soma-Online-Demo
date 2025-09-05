import React, { useState } from "react";
import MathProblemImage from "./MathProblemImage";

// Mock data
const MOCK_TEXTBOOKS = [
  { id: "bk1", title: "중1 1학기 2022개정 수학 개념 진도북_1단원_단원TEST" },
  { id: "bk2", title: "중1 2학기 2022개정 수학 개념 진도북_2단원_단원TEST" },
  { id: "bk3", title: "중2 1학기 2022개정 수학 개념 진도북_1단원_단원TEST" },
  { id: "bk4", title: "사고력 연산 지도사 과정 1 (M1)" },
];

const MOCK_PAGES = Array.from({ length: 40 }).map((_, i) =>
  (i + 1).toString().padStart(4, "0")
);

// 문제 데이터 생성 함수
const generateProblems = () => {
  const problems = [];
  const problemTypes = [
    {
      type: "다항식",
      imageText: "개념유형+1)+다항식의+연산%0A%0A(3x²+%2B+2x+-+1)+%2B+(2x²+-+3x+%2B+4)",
      promptText: "개념유형 1) 다항식의 연산 (3x² + 2x - 1) + (2x² - 3x + 4)"
    },
    {
      type: "이차방정식",
      imageText: "개념유형+2)+이차방정식의+해%0A%0Ax²+-+5x+%2B+6+%3D+0",
      promptText: "개념유형 2) 이차방정식의 해 x² - 5x + 6 = 0"
    },
    {
      type: "함수",
      imageText: "개념유형+3)+일차함수와+이차함수%0A%0Af(x)+%3D+2x+%2B+3",
      promptText: "개념유형 3) 일차함수와 이차함수 f(x) = 2x + 3"
    },
    {
      type: "기하",
      imageText: "개념유형+4)+평면도형의+성질%0A%0A반지름이+5cm인+원의+넓이",
      promptText: "개념유형 4) 평면도형의 성질 반지름이 5cm인 원의 넓이"
    },
    {
      type: "확률",
      imageText: "개념유형+5)+확률과+통계%0A%0A주사위를+한+번+던져서+3이+나올+확률",
      promptText: "개념유형 5) 확률과 통계 주사위를 한 번 던져서 3이 나올 확률"
    }
  ];

  for (let i = 1; i <= 100; i++) {
    const pageNo = (20 + Math.floor(i / 5)).toString().padStart(4, "0");
    const problemNo = i.toString().padStart(4, "0");
    const problemType = problemTypes[i % problemTypes.length];
    
    problems.push({
      id: `p-${pageNo}-${problemNo}`,
      pageNo: pageNo,
      problemNo: problemNo,
      imageUrl: `https://placehold.co/640x260/ffffff/374151?text=${problemType.imageText}`,
      promptText: problemType.promptText,
      type: problemType.type
    });
  }
  
  return problems;
};

const sampleProblem = {
  id: "p-0023-0001",
  pageNo: "0023",
  problemNo: "0001",
  imageUrl: "https://placehold.co/640x260/ffffff/374151?text=01+다음+중+소수는+몇+개인지+구하시오.%0A%0A2%2C+9%2C+14%2C+23%2C+34%2C+47%2C+81",
  promptText: "다음 중 소수는 몇 개인지 구하시오. 2, 9, 14, 23, 34, 47, 81",
  type: "소수"
};

export default function AdminPage() {
  const [step, setStep] = useState(1);
  const [bookId, setBookId] = useState(MOCK_TEXTBOOKS[0].id);
  const [selectedPages, setSelectedPages] = useState(["0023"]);
  const [problems, setProblems] = useState(generateProblems());
  const [selectedProblemId, setSelectedProblemId] = useState("p-0020-0001");
  const [busy, setBusy] = useState(false);
  const [aiResults, setAiResults] = useState({});
  const [progress, setProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const selectedProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];


  const onTogglePage = (pg) => {
    setSelectedPages((prev) => {
      if (prev.includes(pg)) return prev.filter((p) => p !== pg);
      const next = [...prev, pg];
      return next.length > 20 ? prev : next;
    });
  };

  const runAutoClassify = async () => {
    setBusy(true);
    setProgress(0);
    
    // 프로그레스바 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // 문제 유형에 따른 AI 분류 결과 생성
    const getMockResults = (problemType) => {
      const results = {
        소수: {
          기본정답: "3",
          추가정답: "세 개, 03, 3개",
          개념: "소수의 정의와 판별법",
          풀이전략: "주어진 수들을 하나씩 확인하여 소수인지 판별한다. 소수는 1과 자기 자신으로만 나누어떨어지는 수이다.",
          풀이과정: "2: 소수 (1과 2로만 나누어떨어짐)\n9: 합성수 (3×3)\n14: 합성수 (2×7)\n23: 소수 (1과 23으로만 나누어떨어짐)\n34: 합성수 (2×17)\n47: 소수 (1과 47로만 나누어떨어짐)\n81: 합성수 (3×3×3×3)\n\n따라서 소수는 2, 23, 47로 총 3개이다."
        },
        방정식: {
          기본정답: "4",
          추가정답: "x=4",
          개념: "일차방정식의 풀이법",
          풀이전략: "등식의 성질을 이용하여 미지수를 구한다. 양변에 같은 수를 더하거나 빼거나 곱하거나 나눌 수 있다.",
          풀이과정: "2x + 5 = 13\n2x = 13 - 5 (양변에서 5 빼기)\n2x = 8\nx = 4 (양변을 2로 나누기)\n\n따라서 x = 4이다."
        },
        기하: {
          기본정답: "12",
          추가정답: "12cm², 12제곱센티미터",
          개념: "삼각형의 넓이 공식",
          풀이전략: "삼각형의 넓이는 (밑변 × 높이) ÷ 2 공식을 사용한다.",
          풀이과정: "삼각형의 넓이 = (밑변 × 높이) ÷ 2\n= (6 × 4) ÷ 2\n= 24 ÷ 2\n= 12\n\n따라서 삼각형의 넓이는 12cm²이다."
        },
        분수: {
          기본정답: "2/3",
          추가정답: "⅔",
          개념: "기약분수와 약분",
          풀이전략: "분자와 분모의 최대공약수로 나누어 기약분수로 만든다.",
          풀이과정: "12/18의 분자와 분모의 최대공약수는 6이다.\n12 ÷ 6 = 2\n18 ÷ 6 = 3\n\n따라서 12/18 = 2/3이다."
        },
        비례: {
          기본정답: "9",
          추가정답: "x=9",
          개념: "비례식의 성질",
          풀이전략: "비례식에서 내항의 곱과 외항의 곱이 같다는 성질을 이용한다.",
          풀이과정: "3:4 = x:12\n내항의 곱 = 4 × x = 4x\n외항의 곱 = 3 × 12 = 36\n4x = 36\nx = 9\n\n따라서 x = 9이다."
        }
      };
      
      return results[problemType] || results.소수;
    };
    
    // 모든 문제에 대해 AI 분류 실행
    const newResults = {};
    problems.forEach(problem => {
      const mockResults = getMockResults(problem.type);
      newResults[problem.id] = mockResults;
    });
    
    await new Promise((r) => setTimeout(r, 3000));
    
    setAiResults(prev => ({
      ...prev,
      ...newResults
    }));
    
    setBusy(false);
    setProgress(0);
  };

  const addProblem = () => {
    const idx = problems.length + 1;
    const pg = (23 + Math.floor(idx / 2)).toString().padStart(4, "0");
    const pid = `p-${pg}-${idx.toString().padStart(4, "0")}`;
    setProblems((prev) => [
      ...prev,
      { ...sampleProblem, id: pid, pageNo: pg, problemNo: idx.toString().padStart(4, "0") },
    ]);
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
    fontFamily: 'NanumSquare, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyle = {
    position: 'sticky',
    top: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    zIndex: 100,
    padding: '1rem 0'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'NanumSquare, sans-serif',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#667eea',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>

          {/* Single row header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '20px', 
            padding: '16px 0',
            flexWrap: 'wrap'
          }}>
            {/* Left side - Book info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#667eea'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <div style={{ 
                padding: '8px 0px', 
                color: '#667eea', 
                fontWeight: '800',
                fontFamily: 'NanumSquare, sans-serif',
                maxWidth: '400px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {MOCK_TEXTBOOKS.find(b => b.id === bookId)?.title}
              </div>
              <div style={{ 
                padding: '8px 16px', 
                background: 'rgba(102, 126, 234, 0.1)', 
                color: '#667eea', 
                borderRadius: '12px',
                fontWeight: '600',
                border: '2px solid rgba(102, 126, 234, 0.2)'
              }}>
                총 {problems.length}개 문제
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <button 
                onClick={runAutoClassify}
                disabled={busy}
                style={{
                  background: busy ? 
                    'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  boxShadow: busy ? 
                    '0 4px 15px rgba(156, 163, 175, 0.3)' : 
                    '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  opacity: busy ? 0.7 : 1
                }}
              >
                {busy ? "AI 분석 중..." : "AI 자동 분류"}
              </button>
              <button style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                저장
              </button>
              <button 
                onClick={() => setShowCompletionModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                완료하기
              </button>
            </div>
          </div>

        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {step === 1 && (
          <div style={cardStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>A</div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#1f2937', fontFamily: 'NanumSquare, sans-serif' }}>
                  교재 선택
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: 'NanumSquare, sans-serif', fontWeight: '400' }}>
                  AI 분석을 위한 교재를 선택해주세요
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '20px',
              marginBottom: '24px'
            }}>
              {MOCK_TEXTBOOKS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBookId(b.id)}
                  style={{
                    textAlign: 'left',
                    padding: '24px',
                    borderRadius: '16px',
                    border: bookId === b.id ? '3px solid #667eea' : '2px solid rgba(102, 126, 234, 0.2)',
                    background: bookId === b.id 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                      : 'rgba(255, 255, 255, 0.9)',
                    cursor: 'pointer',
                    boxShadow: bookId === b.id 
                      ? '0 20px 40px rgba(102, 126, 234, 0.2)' 
                      : '0 8px 25px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    transform: bookId === b.id ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '12px' 
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>B</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400', fontFamily: 'NanumSquare, sans-serif' }}>
                      ID: {b.id}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#1f2937',
                    lineHeight: '1.4',
                    marginBottom: '8px',
                    fontFamily: 'NanumSquare, sans-serif'
                  }}>
                    {b.title}
                  </div>
                  {bookId === b.id && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#667eea',
                      fontSize: '14px',
                      fontWeight: '700',
                      fontFamily: 'NanumSquare, sans-serif'
                    }}>
                      <span>✓</span>
                      <span>선택됨</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px', fontFamily: 'NanumSquare, sans-serif', fontWeight: '400' }}>
                  현재 선택된 교재
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', fontFamily: 'NanumSquare, sans-serif' }}>
                  {MOCK_TEXTBOOKS.find(b => b.id === bookId)?.title}
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                style={{
                  ...primaryButtonStyle,
                  padding: '12px 24px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                다음 단계: 페이지 선택 →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={cardStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>📄</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  페이지 선택
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  AI 분석할 페이지를 선택해주세요 (최대 20장)
                </p>
              </div>
              <div style={{ 
                padding: '12px 20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#667eea'
              }}>
                {selectedPages.length} / 20 선택됨
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
              gap: '12px',
              marginBottom: '24px'
            }}>
              {MOCK_PAGES.map((pg) => {
                const checked = selectedPages.includes(pg);
                return (
                  <button
                    key={pg}
                    onClick={() => onTogglePage(pg)}
                    style={{
                      padding: '16px 8px',
                      borderRadius: '12px',
                      border: checked ? '3px solid #667eea' : '2px solid rgba(102, 126, 234, 0.2)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: checked 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'rgba(255, 255, 255, 0.9)',
                      color: checked ? 'white' : '#374151',
                      boxShadow: checked 
                        ? '0 8px 25px rgba(102, 126, 234, 0.3)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      transform: checked ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  >
                    {checked && <span style={{ marginRight: '4px' }}>✓</span>}
                    {pg}
                  </button>
                );
              })}
            </div>
            
            <div style={{ 
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                선택된 페이지 목록
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#1f2937',
                wordBreak: 'break-all'
              }}>
                {selectedPages.length > 0 ? selectedPages.join(", ") : "선택된 페이지가 없습니다"}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button 
                onClick={() => setStep(1)}
                style={{
                  ...secondaryButtonStyle,
                  padding: '12px 24px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← 이전 단계
              </button>
              <button 
                onClick={() => setStep(3)}
                style={{
                  ...primaryButtonStyle,
                  padding: '12px 24px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                다음 단계: 문제편집 →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>✏️</div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                  문제편집 & AI 분석
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  문제를 편집하고 AI로 자동 분류해보세요
                </p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Left: 문제 목록 */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '600' }}>문제 목록 - 총 {problems.length}건</span>
                  <div 
                    onClick={addProblem}
                    style={{ 
                      fontSize: '12px', 
                      color: '#667eea', 
                      fontWeight: '600',
                      fontFamily: 'NanumSquare, sans-serif',
                      padding: '4px 8px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    + 문제 추가
                  </div>
                </div>
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'left' }}>No.</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>페이지</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>문제번호</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.map((p, i) => (
                        <tr
                          key={p.id}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: selectedProblemId === p.id ? '#f3f4f6' : 'transparent'
                          }}
                          onClick={() => setSelectedProblemId(p.id)}
                        >
                          <td style={{ padding: '8px' }}>
                            <input type="checkbox" style={{ marginRight: '8px' }} />
                            {i + 1}
                          </td>
                          <td style={{ padding: '8px', fontFamily: 'monospace' }}>{p.pageNo}</td>
                          <td style={{ padding: '8px', fontFamily: 'monospace' }}>{p.problemNo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Center: 문제 이미지 & 해설 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>문제 이미지</div>
                  {selectedProblem ? (
                    <MathProblemImage 
                      problem={selectedProblem} 
                      width="100%" 
                      height="300px"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                      문제를 선택해주세요
                    </div>
                  )}
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>해설</div>
                  <textarea
                    style={{ width: '100%', height: '120px', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', fontSize: '14px' }}
                    placeholder="[풀이] 소수는 2, 23, 47의 3개"
                    defaultValue="[풀이] 소수는 2, 23, 47의 3개"
                  />
                </div>
              </div>

              {/* Right: 검수 결과 입력/AI 분류 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={{...cardStyle, height: '605.38px', display: 'flex', flexDirection: 'column'}}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#667eea', 
                      fontWeight: '600',
                      fontFamily: 'NanumSquare, sans-serif',
                      padding: '4px 8px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '6px'
                    }}>
                      AI
                    </span>
                    <span>분류 결과</span>
                  </div>
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    {busy && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginBottom: '8px',
                          fontSize: '14px',
                          color: '#667eea',
                          fontWeight: '500'
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #667eea',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          AI 분석 중... {progress}%
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' }}>기본정답:</label>
                        <input
                          type="text"
                          value={aiResults[selectedProblem?.id]?.기본정답 || ''}
                          onChange={(e) => {
                            if (selectedProblem?.id) {
                              setAiResults(prev => ({
                                ...prev,
                                [selectedProblem.id]: {
                                  ...prev[selectedProblem.id],
                                  기본정답: e.target.value
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'NanumSquare, sans-serif'
                          }}
                          placeholder="기본정답을 입력하세요"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' }}>추가정답:</label>
                        <input
                          type="text"
                          value={aiResults[selectedProblem?.id]?.추가정답 || ''}
                          onChange={(e) => {
                            if (selectedProblem?.id) {
                              setAiResults(prev => ({
                                ...prev,
                                [selectedProblem.id]: {
                                  ...prev[selectedProblem.id],
                                  추가정답: e.target.value
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'NanumSquare, sans-serif'
                          }}
                          placeholder="추가정답을 입력하세요"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' }}>개념:</label>
                        <input
                          type="text"
                          value={aiResults[selectedProblem?.id]?.개념 || ''}
                          onChange={(e) => {
                            if (selectedProblem?.id) {
                              setAiResults(prev => ({
                                ...prev,
                                [selectedProblem.id]: {
                                  ...prev[selectedProblem.id],
                                  개념: e.target.value
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'NanumSquare, sans-serif'
                          }}
                          placeholder="개념을 입력하세요"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' }}>문제유형:</label>
                        <input
                          type="text"
                          value={aiResults[selectedProblem?.id]?.문제유형 || ''}
                          onChange={(e) => {
                            if (selectedProblem?.id) {
                              setAiResults(prev => ({
                                ...prev,
                                [selectedProblem.id]: {
                                  ...prev[selectedProblem.id],
                                  문제유형: e.target.value
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'NanumSquare, sans-serif'
                          }}
                          placeholder="문제유형을 입력하세요"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' }}>풀이전략:</label>
                        <textarea
                          value={aiResults[selectedProblem?.id]?.풀이전략 || ''}
                          onChange={(e) => {
                            if (selectedProblem?.id) {
                              setAiResults(prev => ({
                                ...prev,
                                [selectedProblem.id]: {
                                  ...prev[selectedProblem.id],
                                  풀이전략: e.target.value
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'NanumSquare, sans-serif',
                            height: '60px',
                            resize: 'vertical'
                          }}
                          placeholder="풀이전략을 입력하세요"
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' }}>풀이과정:</label>
                        <textarea
                          value={aiResults[selectedProblem?.id]?.풀이과정 || ''}
                          onChange={(e) => {
                            if (selectedProblem?.id) {
                              setAiResults(prev => ({
                                ...prev,
                                [selectedProblem.id]: {
                                  ...prev[selectedProblem.id],
                                  풀이과정: e.target.value
                                }
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'NanumSquare, sans-serif',
                            height: '80px',
                            resize: 'vertical'
                          }}
                          placeholder="풀이과정을 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 완료 모달 */}
      {showCompletionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            fontFamily: 'NanumSquare, sans-serif'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px'
            }}>
              ✓
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              marginBottom: '16px', 
              color: '#1f2937',
              fontFamily: 'NanumSquare, sans-serif'
            }}>
              처리 완료
            </h2>
            <div style={{ 
              color: '#374151', 
              fontSize: '16px', 
              marginBottom: '32px',
              lineHeight: '1.6',
              fontFamily: 'NanumSquare, sans-serif'
            }}>
              {MOCK_TEXTBOOKS.find(b => b.id === bookId)?.title} 교재의 페이지 {selectedPages.slice(0, 3).join(", ")} 외 {Math.max(selectedPages.length - 3, 0)}장에 대해<br/>
              문제편집 및 AI 자동 분류 데모가 완료되었습니다.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setShowCompletionModal(false);
                  setStep(1);
                }}
                style={{
                  ...buttonStyle,
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151',
                  border: '1px solid #d1d5db'
                }}
              >
                처음으로
              </button>
              <button 
                onClick={() => setShowCompletionModal(false)}
                style={primaryButtonStyle}
              >
                문제편집으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 16px', fontSize: '12px', color: '#6b7280' }}>
        Provider-agnostic demo · 인라인 스타일 · Replace endpoint via REACT_APP_AI_ENDPOINT and set REACT_APP_USE_REAL_AI=true to call real LLM.
      </footer>
    </div>
  );
}
