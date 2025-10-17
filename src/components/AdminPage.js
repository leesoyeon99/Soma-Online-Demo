import React, { useState, useCallback } from "react";
import MathProblemImage from "./MathProblemImage";

// Mock data
const MOCK_TEXTBOOKS = [
  { id: "bk1", title: "2022 개정 미래탐구 중1-1 수학 개념 진도북" },
  { id: "bk2", title: "중1 2학기 2022개정 수학 개념 진도북_2단원_단원" },
  { id: "bk3", title: "중2 1학기 2022개정 수학 개념 진도북_1단원_단원" },
  { id: "bk4", title: "사고력 연산 지도사 과정 1 (M1)" },
];

const MOCK_PAGES = Array.from({ length: 200 }).map((_, i) =>
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

export default function AdminPage({ onBackToHome }) {
  const [step, setStep] = useState(1);
  const [bookId, setBookId] = useState(MOCK_TEXTBOOKS[0].id);
  const [selectedPages, setSelectedPages] = useState(["0023"]);
  const [problems, setProblems] = useState(generateProblems());
  const [selectedProblemId, setSelectedProblemId] = useState("p-0020-0001");
  const [busy, setBusy] = useState(false);
  const [aiResults, setAiResults] = useState({});
  const [progress, setProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  
  // 페이지 선택 UI 개선을 위한 새로운 상태들
  // const [currentPageRange, setCurrentPageRange] = useState({ start: 1, end: 20 });
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  // const [showPageNavigator, setShowPageNavigator] = useState(false);
  const [selectedPageSection, setSelectedPageSection] = useState(1);
  
  // 범위 선택을 위한 상태들
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  
  // 미리보기 문제 인덱스
  const [previewProblemIndex, setPreviewProblemIndex] = useState(0);
  
  // 미리보기용 문제 샘플 데이터
  const previewProblems = [
    {
      type: "다항식",
      title: "개념유형 1) 다항식의 연산",
      question: "(3x² + 2x - 1) + (2x² - 3x + 4)",
      description: "다항식의 덧셈과 뺄셈을 계산하여 정리하시오."
    },
    {
      type: "이차방정식",
      title: "개념유형 2) 이차방정식의 해",
      question: "x² - 5x + 6 = 0",
      description: "다음 이차방정식을 풀어라."
    },
    {
      type: "함수",
      title: "개념유형 3) 일차함수와 이차함수",
      question: "f(x) = 2x + 3",
      description: "다음 함수의 그래프를 그리고 성질을 설명하시오."
    },
    {
      type: "기하",
      title: "개념유형 4) 평면도형의 성질",
      question: "반지름이 5cm인 원의 넓이",
      description: "다음 도형의 넓이를 구하시오."
    },
    {
      type: "확률",
      title: "개념유형 5) 확률과 통계",
      question: "주사위를 한 번 던져서 3이 나올 확률",
      description: "다음 확률을 구하시오."
    }
  ];
  
  // 현재 미리보기 문제
  const currentPreviewProblem = previewProblems[previewProblemIndex];
  
  // 미리보기 문제 이동 핸들러
  const handlePrevPreview = () => {
    setPreviewProblemIndex((prev) => (prev - 1 + previewProblems.length) % previewProblems.length);
  };
  
  const handleNextPreview = () => {
    setPreviewProblemIndex((prev) => (prev + 1) % previewProblems.length);
  };

  // 페이지 섹션 계산 (20페이지씩 그룹화)
  const pageSections = Array.from({ length: Math.ceil(MOCK_PAGES.length / 20) }, (_, i) => ({
    id: i + 1,
    start: i * 20 + 1,
    end: Math.min((i + 1) * 20, MOCK_PAGES.length),
    label: `${i * 20 + 1}-${Math.min((i + 1) * 20, MOCK_PAGES.length)}`
  }));

  const selectedProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];

  // 현재 섹션의 페이지들
  const currentSectionPages = MOCK_PAGES.slice(
    (selectedPageSection - 1) * 20,
    selectedPageSection * 20
  );

  // 페이지 검색 필터링
  const filteredPages = currentSectionPages.filter(page => 
    page.includes(pageSearchQuery)
  );

  const onTogglePage = (pg) => {
    setSelectedPages((prev) => {
      if (prev.includes(pg)) return prev.filter((p) => p !== pg);
      const next = [...prev, pg];
      return next.length > 20 ? prev : next;
    });
  };

  // 범위 선택 핸들러들
  const handleRangeSelect = () => {
    const start = parseInt(rangeStart);
    const end = rangeEnd ? parseInt(rangeEnd) : start; // 끝값이 없으면 단일 페이지
    
    if (!start || start < 1 || start > 200) {
      alert('시작 페이지는 1-200 사이의 값이어야 합니다.');
      return;
    }
    
    if (end < start || end > 200) {
      alert('끝 페이지는 시작 페이지보다 크고 200 이하여야 합니다.');
      return;
    }
    
    // 범위 내의 모든 페이지를 선택
    const rangePagesToAdd = [];
    for (let i = start; i <= end; i++) {
      const pageStr = i.toString().padStart(4, "0");
      if (!selectedPages.includes(pageStr) && rangePagesToAdd.length + selectedPages.length < 20) {
        rangePagesToAdd.push(pageStr);
      }
    }
    
    if (rangePagesToAdd.length === 0) {
      alert('선택할 수 있는 새로운 페이지가 없거나 최대 20장을 초과합니다.');
      return;
    }
    
    setSelectedPages(prev => [...prev, ...rangePagesToAdd]);
    setRangeStart('');
    setRangeEnd('');
  };

  // 빠른 선택 핸들러들
  const handleQuickSelect = (startPage, endPage) => {
    const rangePagesToAdd = [];
    for (let i = startPage; i <= endPage; i++) {
      const pageStr = i.toString().padStart(4, "0");
      if (!selectedPages.includes(pageStr) && rangePagesToAdd.length + selectedPages.length < 20) {
        rangePagesToAdd.push(pageStr);
      }
    }
    
    if (rangePagesToAdd.length > 0) {
      setSelectedPages(prev => [...prev, ...rangePagesToAdd]);
    }
  };

  // 페이지 섹션 변경
  const changePageSection = useCallback((sectionId) => {
    setSelectedPageSection(sectionId);
    setPageSearchQuery('');
  }, []);

  // 페이지 범위 점프
  const jumpToPageRange = (startPage) => {
    const sectionId = Math.ceil(startPage / 20);
    setSelectedPageSection(sectionId);
    setPageSearchQuery(startPage.toString().padStart(4, "0"));
  };

  // 전체 선택/해제
  const toggleAllPages = useCallback(() => {
    if (selectedPages.length >= 20) {
      setSelectedPages([]);
    } else {
      const remainingSlots = 20 - selectedPages.length;
      const availablePages = filteredPages.filter(page => !selectedPages.includes(page));
      const pagesToAdd = availablePages.slice(0, remainingSlots);
      setSelectedPages(prev => [...prev, ...pagesToAdd]);
    }
  }, [selectedPages, filteredPages]);

  // 키보드 단축키 지원
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (step === 2) { // 페이지 선택 단계에서만
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'a':
              e.preventDefault();
              toggleAllPages();
              break;
            case 'f':
              e.preventDefault();
              document.querySelector('input[placeholder="페이지 번호 입력"]')?.focus();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              if (selectedPageSection > 1) {
                changePageSection(selectedPageSection - 1);
              }
              break;
            case 'ArrowRight':
              e.preventDefault();
              if (selectedPageSection < pageSections.length) {
                changePageSection(selectedPageSection + 1);
              }
              break;
            default:
              // 다른 키는 처리하지 않음
              break;
          }
        } else if (e.key === 'Escape') {
          setPageSearchQuery('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedPageSection, pageSections.length, toggleAllPages, changePageSection]);

  const runAutoClassify = async () => {
    setBusy(true);
    setProgress(0);
    setShowAIAnalysisModal(true);
    setAnalysisStage('문제 분석 중...');
    
    // 비동기 분석 시뮬레이션
    const analysisStages = [
      { stage: '이미지 처리 중...', duration: 800 },
      { stage: '텍스트 추출 중...', duration: 700 },
      { stage: '문제 유형 분석 중...', duration: 900 },
      { stage: '정답 생성 중...', duration: 600 },
      { stage: '풀이 과정 작성 중...', duration: 800 },
      { stage: '결과 검증 중...', duration: 500 }
    ];
    
    let currentProgress = 0;
    
    for (let i = 0; i < analysisStages.length; i++) {
      const { stage, duration } = analysisStages[i];
      setAnalysisStage(stage);
      
      // 각 단계별 진행률 업데이트
      const stageProgress = Math.floor((i + 1) * (100 / analysisStages.length));
      
      await new Promise(resolve => {
        const interval = setInterval(() => {
          currentProgress += 2;
          if (currentProgress >= stageProgress) {
            currentProgress = stageProgress;
            clearInterval(interval);
            resolve();
          }
          setProgress(currentProgress);
        }, duration / 10);
      });
    }
    
    // 문제 유형에 따른 AI 분류 결과 생성
    const getMockResults = (problemType) => {
      const results = {
        다항식: {
          기본정답: "(1) 5x² - x + 3  (2) x² - x - 6  (3) 4x² + 4x + 1",
          추가정답: "(1) 5x²-x+3 (2) x²-x-6 (3) 4x²+4x+1",
          개념: "다항식의 연산",
          문제유형: "다항식의 덧셈, 뺄셈, 곱셈",
          풀이전략: "다항식의 덧셈은 동류항끼리 모아서 계산하고, 곱셈은 분배법칙을 이용하여 전개한다. 완전제곱식의 경우 공식 (a+b)² = a² + 2ab + b²를 활용한다.",
          풀이과정: "(1) (3x² + 2x - 1) + (2x² - 3x + 4)\n= 3x² + 2x² + 2x - 3x - 1 + 4\n= 5x² - x + 3\n\n(2) (x + 2)(x - 3)\n= x² - 3x + 2x - 6\n= x² - x - 6\n\n(3) (2x + 1)²\n= (2x)² + 2·(2x)·1 + 1²\n= 4x² + 4x + 1\n\n따라서 답은 (1) 5x² - x + 3  (2) x² - x - 6  (3) 4x² + 4x + 1"
        },
        이차방정식: {
          기본정답: "(1) x = 2, 3  (2) x = -3, -1/2  (3) x = ±2",
          추가정답: "(1) x=2 또는 x=3 (2) x=-3 또는 x=-0.5 (3) x=2 또는 x=-2",
          개념: "이차방정식의 해",
          문제유형: "인수분해를 이용한 이차방정식 풀이",
          풀이전략: "이차방정식을 인수분해하여 (x-a)(x-b)=0 꼴로 만든 후, 각 인수가 0이 되는 x의 값을 구한다. 완전제곱식이나 제곱근을 이용한 방법도 활용한다.",
          풀이과정: "(1) x² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx - 2 = 0 또는 x - 3 = 0\n∴ x = 2 또는 x = 3\n\n(2) 2x² + 7x + 3 = 0\n(2x + 1)(x + 3) = 0\n2x + 1 = 0 또는 x + 3 = 0\n∴ x = -1/2 또는 x = -3\n\n(3) x² - 4 = 0\nx² = 4\n∴ x = ±2\n\n따라서 답은 (1) x = 2, 3  (2) x = -3, -1/2  (3) x = ±2"
        },
        함수: {
          기본정답: "(1) 기울기 2, y절편 3  (2) 꼭짓점 (2, -1)  (3) 꼭짓점 (1, 2)",
          추가정답: "(1) 일차함수, 증가 (2) 아래로 볼록, 최솟값 -1 (3) 위로 볼록, 최댓값 2",
          개념: "일차함수와 이차함수의 성질",
          문제유형: "함수의 그래프와 성질 분석",
          풀이전략: "일차함수는 y = ax + b 형태로 기울기와 y절편을 파악한다. 이차함수는 y = a(x-p)² + q 꼴로 변형하여 꼭짓점, 축, 최댓값/최솟값을 구한다.",
          풀이과정: "(1) f(x) = 2x + 3\n일차함수로 기울기는 2, y절편은 3이다.\nx가 1 증가할 때 y가 2 증가하는 직선이다.\n\n(2) g(x) = x² - 4x + 3\n= (x² - 4x + 4) - 4 + 3\n= (x - 2)² - 1\n꼭짓점: (2, -1), 축: x = 2\n아래로 볼록한 포물선, 최솟값 -1\n\n(3) h(x) = -x² + 2x + 1\n= -(x² - 2x) + 1\n= -(x² - 2x + 1 - 1) + 1\n= -(x - 1)² + 1 + 1\n= -(x - 1)² + 2\n꼭짓점: (1, 2), 축: x = 1\n위로 볼록한 포물선, 최댓값 2\n\n따라서 답은 (1) 기울기 2, y절편 3  (2) 꼭짓점 (2, -1)  (3) 꼭짓점 (1, 2)"
        },
        기하: {
          기본정답: "(1) 25π cm²  (2) 24 cm²  (3) 70 cm²",
          추가정답: "(1) 78.5cm² (2) 24제곱센티미터 (3) 70제곱센티미터",
          개념: "평면도형의 넓이",
          문제유형: "원, 삼각형, 사각형의 넓이 계산",
          풀이전략: "각 도형의 넓이 공식을 활용한다. 원의 넓이는 πr², 삼각형은 (밑변 × 높이) ÷ 2, 직사각형은 가로 × 세로를 이용한다.",
          풀이과정: "(1) 반지름이 5cm인 원의 넓이\n원의 넓이 = πr²\n= π × 5²\n= 25π (cm²)\n≈ 78.5 cm²\n\n(2) 밑변이 8cm, 높이가 6cm인 삼각형의 넓이\n삼각형의 넓이 = (밑변 × 높이) ÷ 2\n= (8 × 6) ÷ 2\n= 48 ÷ 2\n= 24 (cm²)\n\n(3) 가로 10cm, 세로 7cm인 직사각형의 넓이\n직사각형의 넓이 = 가로 × 세로\n= 10 × 7\n= 70 (cm²)\n\n따라서 답은 (1) 25π cm²  (2) 24 cm²  (3) 70 cm²"
        },
        확률: {
          기본정답: "(1) 1/6  (2) 1/4  (3) 3/10",
          추가정답: "(1) 6분의 1 (2) 0.25 (3) 0.3",
          개념: "확률의 기본 개념과 계산",
          문제유형: "경우의 수를 이용한 확률 계산",
          풀이전략: "확률 = (원하는 경우의 수) / (전체 경우의 수) 공식을 이용한다. 각 상황에서 가능한 모든 경우를 파악하고, 그 중 구하고자 하는 조건을 만족하는 경우를 센다.",
          풀이과정: "(1) 주사위를 한 번 던져서 3이 나올 확률\n전체 경우의 수: 6 (1, 2, 3, 4, 5, 6)\n3이 나오는 경우의 수: 1\n확률 = 1/6\n\n(2) 동전을 두 번 던져서 모두 앞면이 나올 확률\n전체 경우의 수: 4 (앞앞, 앞뒤, 뒤앞, 뒤뒤)\n모두 앞면인 경우의 수: 1 (앞앞)\n확률 = 1/4\n\n(3) 1부터 10까지의 수 중에서 3의 배수를 뽑을 확률\n전체 경우의 수: 10 (1~10)\n3의 배수: 3, 6, 9 → 3개\n확률 = 3/10\n\n따라서 답은 (1) 1/6  (2) 1/4  (3) 3/10"
        }
      };
      
      return results[problemType] || results.다항식;
    };
    
    // 모든 문제에 대해 AI 분류 실행
    const newResults = {};
    problems.forEach(problem => {
      const mockResults = getMockResults(problem.type);
      newResults[problem.id] = mockResults;
    });
    
    // 최종 분석 완료
    setAnalysisStage('분석 완료!');
    setProgress(100);
    
    await new Promise((r) => setTimeout(r, 1000));
    
    setAiResults(prev => ({
      ...prev,
      ...newResults
    }));
    
    setBusy(false);
    setProgress(0);
    setShowAIAnalysisModal(false);
    setAnalysisStage('');
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

  // 스크롤바 스타일을 위한 CSS 추가
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* 스크롤바 스타일링 - 디자인 시스템에 맞게 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(243, 244, 246, 0.6);
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        transition: all 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }
      
      /* Firefox 스크롤바 */
      * {
        scrollbar-width: thin;
        scrollbar-color: #667eea rgba(243, 244, 246, 0.6);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
              {/* 홈으로 돌아가기 버튼 */}
              <button
                onClick={onBackToHome}
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
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                title="홈으로"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </button>
              
              {/* 이전 단계로 돌아가기 버튼 (step > 1일 때만 표시) */}
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
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
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  title="이전 단계"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}
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
              {step === 3 && (
                <button
                  onClick={runAutoClassify}
                  disabled={busy}
                  style={{
                    background: busy ? 
                      'rgba(156, 163, 175, 0.1)' : 
                      'rgba(255, 255, 255, 0.9)',
                    color: busy ? '#9ca3af' : '#3b82f6',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: busy ? '1px solid #d1d5db' : '1px solid #3b82f6',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    boxShadow: busy ? 
                      '0 2px 8px rgba(156, 163, 175, 0.2)' : 
                      '0 2px 8px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.3s ease',
                    opacity: busy ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!busy) {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!busy) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {busy ? "AI 분석 중..." : "AI 자동 분류"}
                </button>
              )}
              {step === 3 && (
                <button style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#6366f1',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: '1px solid #6366f1',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.2)';
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                  </svg>
                  저장
                </button>
              )}
              {step === 3 && (
                <button 
                  onClick={() => setShowCompletionModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  완료하기
                </button>
              )}
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
             <div style={{ flex: 1 }}>
               <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#1f2937', fontFamily: 'NanumSquare, sans-serif' }}>
                 교재 선택
               </h2>
               <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: 'NanumSquare, sans-serif', fontWeight: '400' }}>
                 AI 분석을 위한 교재를 선택해주세요
               </p>
             </div>
             
             {/* 교재 업로드 버튼 */}
             <button 
               onClick={() => document.getElementById('file-upload').click()}
               style={{
                 background: 'white',
                 color: '#374151',
                 padding: '12px 24px',
                 fontSize: '14px',
                 fontWeight: '600',
                 borderRadius: '12px',
                 border: '1px solid #d1d5db',
                 cursor: 'pointer',
                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                 transition: 'all 0.3s ease',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
               onMouseEnter={(e) => {
                 e.target.style.transform = 'translateY(-2px)';
                 e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                 e.target.style.borderColor = '#9ca3af';
               }}
               onMouseLeave={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                 e.target.style.borderColor = '#d1d5db';
               }}
             >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
               </svg>
               교재 업로드
             </button>
             
             {/* 숨겨진 파일 입력 */}
             <input
               id="file-upload"
               type="file"
               accept=".pdf,.doc,.docx"
               style={{ display: 'none' }}
               onChange={(e) => {
                 if (e.target.files && e.target.files[0]) {
                   const file = e.target.files[0];
                   alert(`"${file.name}" 파일이 업로드되었습니다!`);
                   // 여기에 실제 업로드 로직을 추가할 수 있습니다
                 }
               }}
             />
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
            {/* 헤더 */}
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
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
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

            {/* 메인 레이아웃: 왼쪽 썸네일 + 오른쪽 컨트롤 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* 왼쪽: 썸네일 미리보기 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                      페이지 미리보기
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      선택할 페이지를 미리 확인하세요
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '8px 16px',
                      background: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#667eea',
                      border: '1px solid #667eea'
                    }}>
                      페이지 {selectedPages.length > 0 ? selectedPages[0] : '0001'}
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#667eea'
                    }}>
                      {previewProblemIndex + 1} / {previewProblems.length}
                    </div>
                  </div>
                </div>

                <div style={{
                  height: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '320px',
                    height: '450px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '20px',
                      paddingBottom: '12px',
                      borderBottom: '2px solid #667eea'
                    }}>
                      <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#667eea'
                      }}>
                        2022 개정 미래탐구 중1-1 수학 개념 진도북
                      </h2>
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        수학 개념 진도북
                      </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '12px'
                      }}>
                        {currentPreviewProblem.title}
                      </div>
                      
                      <div style={{
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          textAlign: 'center',
                          color: '#1f2937',
                          lineHeight: '1.5'
                        }}>
                          {currentPreviewProblem.question}
                        </div>
                      </div>

                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {currentPreviewProblem.description}
                      </div>
                    </div>

                    <div style={{
                      border: '1px dashed #d1d5db',
                      borderRadius: '6px',
                      padding: '12px',
                      background: '#fafafa',
                      minHeight: '60px'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginBottom: '8px'
                      }}>
                        답:
                      </div>
                      <div style={{ height: '2px', background: '#e5e7eb', marginBottom: '8px' }}></div>
                      <div style={{ height: '2px', background: '#e5e7eb', marginBottom: '8px' }}></div>
                      <div style={{ height: '2px', background: '#e5e7eb' }}></div>
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      fontSize: '10px',
                      color: '#9ca3af',
                      background: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {selectedPages.length > 0 ? selectedPages[0] : '0001'}
                    </div>
                  </div>

                  <button 
                    onClick={handlePrevPreview}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#667eea',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                    title="이전 문제 유형"
                  >
                    ←
                  </button>
                  
                  <button 
                    onClick={handleNextPreview}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#667eea',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                    title="다음 문제 유형"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* 오른쪽: 페이지 선택 컨트롤 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                padding: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  선택 옵션
                </h3>

                {/* 범위 선택 */}
                <div style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    페이지 선택 (단일 또는 범위)
                  </label>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="number"
                      placeholder="페이지 번호"
                      min="1"
                      max="200"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>~</span>
                    <input
                      type="number"
                      placeholder="끝 (선택사항)"
                      min="1"
                      max="200"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <button 
                    onClick={handleRangeSelect}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {rangeEnd ? '범위 선택' : '페이지 추가'}
                  </button>
                </div>

                {/* 빠른 선택 */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    빠른 선택
                  </label>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                  }}>
                    <button 
                      onClick={() => handleQuickSelect(1, 20)}
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      1-20
                    </button>
                    <button 
                      onClick={() => handleQuickSelect(21, 40)}
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      21-40
                    </button>
                    <button 
                      onClick={() => handleQuickSelect(41, 60)}
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      41-60
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPages([]); // 전체 해제
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#dc2626',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fee2e2';
                        e.target.style.borderColor = '#f87171';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fef2f2';
                        e.target.style.borderColor = '#fecaca';
                      }}
                    >
                      전체 해제
                    </button>
                  </div>
                </div>

                {/* 선택된 페이지 목록 */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    선택된 페이지
                  </label>
                  
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px',
                    background: '#fafafa'
                  }}>
                    {selectedPages.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '12px',
                        padding: '20px'
                      }}>
                        선택된 페이지가 없습니다
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        {selectedPages.map(page => (
                          <div
                            key={page}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: '#667eea',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              gap: '4px'
                            }}
                          >
                            {page}
                            <button
                              onClick={() => onTogglePage(page)}
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: 'none',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 기존 네비게이션 컨트롤들을 숨김 */}
            <div style={{
              display: 'none', // 기존 UI 숨김
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              {/* 페이지 섹션 선택 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>페이지 범위:</span>
                <select
                  value={selectedPageSection}
                  onChange={(e) => changePageSection(parseInt(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {pageSections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.label} ({section.start}-{section.end})
                    </option>
                  ))}
                </select>
              </div>

              {/* 페이지 검색 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>검색:</span>
                <input
                  type="text"
                  value={pageSearchQuery}
                  onChange={(e) => setPageSearchQuery(e.target.value)}
                  placeholder="페이지 번호 입력"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    width: '120px'
                  }}
                />
              </div>

              {/* 빠른 점프 버튼들 */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => jumpToPageRange(1)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  1페이지
                </button>
                <button
                  onClick={() => jumpToPageRange(50)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  50페이지
                </button>
                <button
                  onClick={() => jumpToPageRange(100)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  100페이지
                </button>
                <button
                  onClick={() => jumpToPageRange(150)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  150페이지
                </button>
              </div>

              {/* 전체 선택/해제 */}
              <button
                onClick={toggleAllPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #667eea',
                  background: selectedPages.length >= 20 ? '#667eea' : 'white',
                  color: selectedPages.length >= 20 ? 'white' : '#667eea',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Ctrl+A: 전체 선택/해제"
              >
                {selectedPages.length >= 20 ? '전체 해제' : '전체 선택'}
              </button>

              {/* 키보드 단축키 도움말 */}
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                background: 'rgba(107, 114, 128, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}>
                <div>드래그: 범위선택</div>
                <div>Ctrl+A: 전체선택</div>
                <div>Ctrl+F: 검색</div>
                <div>Ctrl+←/→: 섹션이동</div>
              </div>
            </div>


            {/* 페이지가 없을 때 메시지 */}
            {filteredPages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                fontSize: '16px',
                background: 'rgba(107, 114, 128, 0.05)',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                "{pageSearchQuery}"에 해당하는 페이지가 없습니다.
              </div>
            )}
            
            {/* 선택된 페이지 요약 */}
            <div style={{ 
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                  선택된 페이지 목록
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: selectedPages.length >= 20 ? '#ef4444' : '#10b981',
                  fontWeight: '600',
                  padding: '4px 8px',
                  background: selectedPages.length >= 20 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px'
                }}>
                  {selectedPages.length} / 20 페이지
                </div>
              </div>
              
              {selectedPages.length > 0 ? (
                <div style={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  maxHeight: '120px',
                  overflow: 'auto'
                }}>
                  {selectedPages.map((page, index) => (
                    <div
                      key={page}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}
                    >
                      <span>{page}</span>
                      <button
                        onClick={() => onTogglePage(page)}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: 'none',
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#9ca3af',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  선택된 페이지가 없습니다
                </div>
              )}
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
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
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
                  // setStep(1);
                  onBackToHome();
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
                onClick={() => {
                  setShowCompletionModal(false);
                  setStep(1);
                }}
                style={primaryButtonStyle}
              >
                교재선택으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 분석 모달 */}
      {showAIAnalysisModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* AI 아이콘 */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>

            {/* 제목 */}
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 1rem 0',
              fontFamily: 'NanumSquare, sans-serif'
            }}>
              AI 자동 분석 진행 중
            </h2>

            {/* 현재 단계 표시 */}
            <div style={{
              fontSize: '1rem',
              color: '#667eea',
              fontWeight: '600',
              marginBottom: '2rem',
              fontFamily: 'NanumSquare, sans-serif'
            }}>
              {analysisStage}
            </div>

            {/* 진행률 바 */}
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f3f4f6',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>

            {/* 진행률 퍼센트 */}
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#667eea',
              fontFamily: 'NanumSquare, sans-serif'
            }}>
              {progress}%
            </div>

            {/* 설명 텍스트 */}
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '1.5rem',
              lineHeight: '1.5',
              fontFamily: 'NanumSquare, sans-serif'
            }}>
              AI가 문제를 분석하고 있습니다.<br/>
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}

      <footer style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 16px', fontSize: '12px', color: '#6b7280' }}>
        Provider-agnostic demo · 인라인 스타일 · Replace endpoint via REACT_APP_AI_ENDPOINT and set REACT_APP_USE_REAL_AI=true to call real LLM.
      </footer>
    </div>
  );
}
