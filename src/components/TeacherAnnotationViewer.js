import React, { useState, useRef, useEffect, useCallback } from 'react';

// CSS 애니메이션 추가
const feedbackAnimationStyle = `
  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(var(--rotation));
    }
  }
`;

const TeacherAnnotationViewer = ({ 
  submission, 
  onBackToSubmissions, 
  onSaveFeedback 
}) => {
  const canvasRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const audioRef = useRef(null);
  // const imageRef = useRef(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);
  
  // 첨삭 도구 상태
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  
  // 그리기 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  
  // 첨삭 데이터
  const [teacherAnnotations, setTeacherAnnotations] = useState([]);
  const [showStudentWork, setShowStudentWork] = useState(true);
  const [showTeacherAnnotations, setShowTeacherAnnotations] = useState(true);
  
  // 샘플 첨삭 텍스트 (PDF/이미지 위에 표시될 내용)
  const sampleFeedbackTexts = [
    { text: "계산 과정이 정확해요! 👍", x: 180, y: 320, color: '#10b981', id: 1 },
    { text: "단위를 써주세요", x: 250, y: 280, color: '#ef4444', id: 2 },
    { text: "이 부분을 다시 확인해보세요", x: 120, y: 420, color: '#f59e0b', id: 3 },
    { text: "좋은 접근입니다!", x: 200, y: 500, color: '#3b82f6', id: 4 }
  ];
  
  // 오디오 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // CSS 애니메이션 스타일 추가
  useEffect(() => {
    if (!document.getElementById('feedback-animation-style')) {
      const style = document.createElement('style');
      style.id = 'feedback-animation-style';
      style.textContent = feedbackAnimationStyle;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById('feedback-animation-style');
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // 가상의 학생 필기 이미지 생성
  const createStudentWorkImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정 (A4 비율)
    canvas.width = 800;
    canvas.height = 1000;
    
    // 배경 (흰색)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 교재 제목
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(submission?.bookTitle || '소마 프리미어 교재', canvas.width / 2, 50);
    
    // 학생 이름
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`학생: ${submission?.studentName || '김학생'}`, 50, 100);
    
    // 문제 영역
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('문제 1. 다음 수식을 계산하시오.', 50, 150);
    ctx.fillText('2x + 3y = 12', 50, 180);
    ctx.fillText('x - y = 1', 50, 210);
    
    // 학생 필기 시뮬레이션 (더 현실적으로 - 흔들린 선, 지워진 흔적 등)
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 학생이 그린 선들 (흔들린 느낌)
    ctx.beginPath();
    ctx.moveTo(100, 250);
    ctx.lineTo(120, 248);
    ctx.lineTo(140, 252);
    ctx.lineTo(160, 249);
    ctx.lineTo(180, 251);
    ctx.lineTo(200, 250);
    ctx.stroke();
    
    // 지워진 흔적 (연한 회색)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 280);
    ctx.lineTo(200, 280);
    ctx.stroke();
    
    // 다시 쓴 선 (더 진한 회색)
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 280);
    ctx.lineTo(250, 280);
    ctx.stroke();
    
    // 학생이 쓴 답 (흔들린 글씨)
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('x = 3', 100, 320);
    ctx.fillText('y = 2', 100, 340);
    
    // 추가 문제
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('문제 2. 그래프를 그리시오.', 50, 400);
    
    // 학생이 그린 그래프 (더 현실적으로 - 흔들린 선, 불완전한 축)
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    
    // x축 (흔들린 선)
    ctx.beginPath();
    ctx.moveTo(100, 500);
    ctx.lineTo(120, 498);
    ctx.lineTo(140, 502);
    ctx.lineTo(160, 499);
    ctx.lineTo(180, 501);
    ctx.lineTo(200, 500);
    ctx.lineTo(220, 502);
    ctx.lineTo(240, 499);
    ctx.lineTo(260, 501);
    ctx.lineTo(280, 500);
    ctx.lineTo(300, 502);
    ctx.stroke();
    
    // y축 (흔들린 선)
    ctx.beginPath();
    ctx.moveTo(200, 400);
    ctx.lineTo(198, 420);
    ctx.lineTo(202, 440);
    ctx.lineTo(199, 460);
    ctx.lineTo(201, 480);
    ctx.lineTo(200, 500);
    ctx.lineTo(202, 520);
    ctx.lineTo(199, 540);
    ctx.lineTo(201, 560);
    ctx.lineTo(200, 580);
    ctx.lineTo(202, 600);
    ctx.stroke();
    
    // 불완전한 좌표축 라벨 (흔들린 글씨)
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.fillText('x', 305, 505);
    ctx.fillText('y', 205, 395);
    
    // 학생이 그린 함수 그래프 (간단하고 흔들린)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 450);
    ctx.lineTo(170, 440);
    ctx.lineTo(190, 430);
    ctx.lineTo(210, 420);
    ctx.lineTo(230, 430);
    ctx.lineTo(250, 440);
    ctx.stroke();
    
    return canvas.toDataURL();
  }, [submission]);

  // 이미지 로드
  useEffect(() => {
    if (submission) {
      setImageLoaded(false);
      const imageDataUrl = createStudentWorkImage();
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        renderImage(img);
      };
      img.src = imageDataUrl;
    }
  }, [submission, createStudentWorkImage]);

  // 이미지 렌더링
  const renderImage = useCallback((img) => {
    const canvas = canvasRef.current;
    const markupCanvas = markupCanvasRef.current;
    
    if (canvas && markupCanvas && img) {
      const scale = zoomScale || 1.0;
      const width = img.width * scale;
      const height = img.height * scale;
      
      // 메인 캔버스 설정
      canvas.width = width;
      canvas.height = height;
      
      // 마크업 캔버스 설정
      markupCanvas.width = width;
      markupCanvas.height = height;
      
      // 이미지 그리기
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(img, 0, 0, width, height);
      
      // 첨삭 다시 그리기
      redrawAnnotations();
    }
  }, [zoomScale]);

  // 줌 변경 시 이미지 다시 렌더링
  useEffect(() => {
    if (imageLoaded && submission) {
      const imageDataUrl = createStudentWorkImage();
      const img = new Image();
      img.onload = () => {
        renderImage(img);
      };
      img.src = imageDataUrl;
    }
  }, [zoomScale, imageLoaded, submission, createStudentWorkImage, renderImage]);

  // 마우스/터치 위치 계산
  const getEventPos = useCallback((e) => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = Math.max(0, Math.min(canvas.width, clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, clientY - rect.top));
    
    return { x, y };
  }, []);

  // 그리기 시작
  const startDrawing = useCallback((e) => {
    if (['pen', 'highlighter', 'eraser'].includes(selectedTool)) {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getEventPos(e);
      setLastPos(pos);
      setCurrentPath([pos]);
    }
  }, [selectedTool, getEventPos]);

  // 그리기 진행
  const draw = useCallback((e) => {
    if (isDrawing && ['pen', 'highlighter'].includes(selectedTool)) {
      e.preventDefault();
      const pos = getEventPos(e);
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
        
        context.save();
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        if (selectedTool === 'highlighter') {
          context.globalAlpha = 0.3;
          context.globalCompositeOperation = 'multiply';
        } else {
          context.globalAlpha = 1;
          context.globalCompositeOperation = 'source-over';
        }
        
        context.strokeStyle = selectedColor;
        
        context.beginPath();
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(pos.x, pos.y);
        context.stroke();
        
        setCurrentPath(prev => [...prev, pos]);
        setLastPos(pos);
        
        context.restore();
      }
    } else if (isDrawing && selectedTool === 'eraser') {
      e.preventDefault();
      const pos = getEventPos(e);
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
        const eraseSize = brushSize * 2;
        
        context.save();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(pos.x, pos.y, eraseSize/2, 0, 2 * Math.PI);
        context.fill();
        context.restore();
      }
    }
  }, [isDrawing, selectedTool, getEventPos, lastPos, brushSize, selectedColor]);

  // 그리기 종료
  const stopDrawing = useCallback(() => {
    if (isDrawing && currentPath.length > 1) {
      const newAnnotation = {
        type: 'stroke',
        tool: selectedTool,
        color: selectedColor,
        brushSize: brushSize,
        points: currentPath,
        timestamp: new Date().toISOString()
      };
      
      setTeacherAnnotations(prev => [...prev, newAnnotation]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, selectedTool, selectedColor, brushSize]);

  // 첨삭 다시 그리기
  const redrawAnnotations = useCallback(() => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 학생 필기 그리기 (손글씨 느낌으로)
    if (showStudentWork && submission?.strokeData && Array.isArray(submission.strokeData)) {
      context.save();
      
      submission.strokeData.forEach(stroke => {
        if (stroke && stroke.points && Array.isArray(stroke.points) && stroke.points.length > 1) {
          // 도구별로 다른 스타일 적용
          if (stroke.tool === 'pen') {
            // 펜 필기 - 원래 색상 사용하되 약간 투명하게
            context.globalAlpha = 0.8;
            context.strokeStyle = stroke.color || '#1f2937';
            context.lineWidth = stroke.brushSize || 2;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            // 손글씨 느낌을 위한 약간의 불규칙성 추가
            context.shadowColor = 'rgba(0, 0, 0, 0.1)';
            context.shadowBlur = 1;
            context.shadowOffsetX = 0.5;
            context.shadowOffsetY = 0.5;
            
          } else if (stroke.tool === 'highlighter') {
            // 하이라이터 - 원래 색상 사용하되 투명하게
            context.globalAlpha = 0.4;
            context.strokeStyle = stroke.color || '#fbbf24';
            context.lineWidth = (stroke.brushSize || 4) + 2; // 하이라이터는 더 두껍게
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.globalCompositeOperation = 'multiply';
            
          } else if (stroke.type === 'text') {
            // 텍스트 - 손글씨 폰트 느낌으로
            context.globalAlpha = 0.9;
            context.fillStyle = stroke.color || '#1f2937';
            context.font = `${stroke.fontSize || 14}px "Comic Sans MS", "맑은 고딕", cursive`;
            context.textBaseline = 'top';
            
            // 텍스트 그림자 효과
            context.shadowColor = 'rgba(0, 0, 0, 0.1)';
            context.shadowBlur = 1;
            context.shadowOffsetX = 0.5;
            context.shadowOffsetY = 0.5;
            
            context.fillText(stroke.content, stroke.x, stroke.y);
            return; // 텍스트는 stroke가 아니므로 return
            
          } else if (stroke.type === 'shape') {
            // 도형 - 원래 색상 사용
            context.globalAlpha = 0.8;
            context.strokeStyle = stroke.color || '#1f2937';
            context.lineWidth = stroke.brushSize || 2;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            // 도형 그리기
            if (stroke.shapeType === 'circle') {
              const centerX = stroke.startX + (stroke.endX - stroke.startX) / 2;
              const centerY = stroke.startY + (stroke.endY - stroke.startY) / 2;
              const radius = Math.sqrt(Math.pow(stroke.endX - stroke.startX, 2) + Math.pow(stroke.endY - stroke.startY, 2)) / 2;
              
              context.beginPath();
              context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              context.stroke();
              return;
              
            } else if (stroke.shapeType === 'rectangle') {
              context.beginPath();
              context.rect(stroke.startX, stroke.startY, stroke.endX - stroke.startX, stroke.endY - stroke.startY);
              context.stroke();
              return;
            }
          }
          
          // 일반 stroke 그리기 (펜, 하이라이터)
          if (stroke.type === 'stroke') {
            context.beginPath();
            context.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
              context.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            context.stroke();
          }
        }
      });
      
      context.restore();
    }
    
    // 강사 첨삭 그리기 (원래 색상으로)
    if (showTeacherAnnotations) {
      teacherAnnotations.forEach(annotation => {
        if (annotation.type === 'stroke' && annotation.points.length > 1) {
          context.save();
          context.strokeStyle = annotation.color;
          context.lineWidth = annotation.brushSize;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          
          if (annotation.tool === 'highlighter') {
            context.globalAlpha = 0.3;
            context.globalCompositeOperation = 'multiply';
          } else {
            context.globalAlpha = 1;
            context.globalCompositeOperation = 'source-over';
          }
          
          context.beginPath();
          context.moveTo(annotation.points[0].x, annotation.points[0].y);
          for (let i = 1; i < annotation.points.length; i++) {
            context.lineTo(annotation.points[i].x, annotation.points[i].y);
          }
          context.stroke();
          context.restore();
        }
      });
    }
  }, [submission?.strokeData, teacherAnnotations, showStudentWork, showTeacherAnnotations]);

  // 첨삭 다시 그리기 (의존성 변경 시)
  useEffect(() => {
    redrawAnnotations();
  }, [redrawAnnotations]);

  // 오디오 재생 핸들러
  const handleAudioPlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  // 오디오 시간 업데이트
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  // 오디오 로드 완료
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  };

  // 오디오 종료
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 첨삭 저장
  const handleSaveFeedback = () => {
    if (teacherAnnotations.length === 0) {
      alert('첨삭할 내용이 없습니다.');
      return;
    }
    
    const feedback = {
      id: Date.now(),
      teacherId: 'teacher1',
      teacherName: '선생님',
      timestamp: new Date().toISOString(),
      feedbackStrokeData: teacherAnnotations,
      studentSubmissionId: submission.id,
      bookTitle: submission.bookTitle,
      bookUrl: submission.bookUrl
    };
    
    if (onSaveFeedback) {
      onSaveFeedback(feedback);
    }
    
    alert('첨삭이 저장되었습니다!');
  };

  // 줌 기능
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.2, 0.5));
  };

  if (!submission) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <h2>제출물을 선택해주세요</h2>
          <p>학생 제출물 목록에서 첨삭할 과제를 선택하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* 헤더 */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
        padding: '1rem 2rem',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={onBackToSubmissions}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              ← 제출물 목록으로
            </button>
            
            <div>
              <h1 style={{
                color: '#1e3a8a',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)',
                margin: '0 0 0.25rem 0'
              }}>
                첨삭하기 - {submission.studentName}
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '0.9rem',
                margin: '0',
                fontFamily: 'var(--font-body)'
              }}>
                {submission.bookTitle}
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={handleSaveFeedback}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              첨삭 저장
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        {/* 왼쪽: PDF 뷰어 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem'
        }}>
          {/* 툴바 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* 줌 컨트롤 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '0.5rem',
                borderRadius: '8px'
              }}>
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 0.5}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: zoomScale <= 0.5 ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: zoomScale <= 0.5 ? '#9ca3af' : '#3b82f6',
                    cursor: zoomScale <= 0.5 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13H5v-2h14v2z"/>
                  </svg>
                </button>
                
                <span style={{
                  fontSize: '0.875rem',
                  color: '#1e3a8a',
                  fontFamily: 'var(--font-ui)',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {Math.round(zoomScale * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 3.0}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: zoomScale >= 3.0 ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: zoomScale >= 3.0 ? '#9ca3af' : '#3b82f6',
                    cursor: zoomScale >= 3.0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              </div>

              {/* 도구 버튼들 */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { tool: 'pen', label: '펜' },
                  { tool: 'highlighter', label: '하이라이터' },
                  { tool: 'eraser', label: '지우개' }
                ].map(({ tool, label }) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: selectedTool === tool ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
                      background: selectedTool === tool ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                      color: selectedTool === tool ? '#1e3a8a' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    title={label}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* 색상 선택 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>색상:</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: selectedColor === color ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
                        background: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 브러시 크기 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>크기:</span>
                <select
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#1e3a8a',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={1}>1px</option>
                  <option value={3}>3px</option>
                  <option value={5}>5px</option>
                  <option value={8}>8px</option>
                  <option value={12}>12px</option>
                </select>
              </div>

              {/* 레이어 토글 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowStudentWork(!showStudentWork)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: showStudentWork ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
                    background: showStudentWork ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                    color: showStudentWork ? '#1e3a8a' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  학생 필기
                </button>
                <button
                  onClick={() => setShowTeacherAnnotations(!showTeacherAnnotations)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: showTeacherAnnotations ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
                    background: showTeacherAnnotations ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                    color: showTeacherAnnotations ? '#1e3a8a' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  첨삭 내용
                </button>
              </div>
            </div>
          </div>

          {/* 이미지 뷰어 */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'auto'
          }}>
            {!imageLoaded && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#6b7280', fontSize: '1rem' }}>학생 필기 로딩 중...</span>
              </div>
            )}
            
            {imageLoaded && (
              <div style={{ position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white',
                    display: 'block',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
                <canvas
                  ref={markupCanvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: selectedTool === 'pen' ? 'crosshair' : selectedTool === 'highlighter' ? 'crosshair' : 'grab',
                    borderRadius: '8px',
                    zIndex: 2,
                    backgroundColor: 'transparent',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {/* 선생님 첨삭 텍스트 오버레이 */}
                {showTeacherAnnotations && sampleFeedbackTexts.map((feedback) => (
                  <div
                    key={feedback.id}
                    style={{
                      position: 'absolute',
                      left: `${(feedback.x / 800) * 100}%`, // 800은 캔버스 기본 너비
                      top: `${(feedback.y / 1000) * 100}%`, // 1000은 캔버스 기본 높이
                      transform: `translate(-50%, -50%) rotate(${Math.sin(feedback.id * 0.5) * 2}deg)`, // 손글씨 느낌의 회전
                      zIndex: 3,
                      pointerEvents: 'none',
                      fontFamily: '"Comic Sans MS", cursive, "Malgun Gothic", sans-serif',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: feedback.color,
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: `2px solid ${feedback.color}`,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      whiteSpace: 'nowrap',
                      animation: 'fadeInScale 0.5s ease-out',
                      animationDelay: `${feedback.id * 0.2}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    {feedback.text}
                    {/* 말풍선 꼬리 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: `8px solid ${feedback.color}`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 오디오 플레이어 및 정보 */}
        <div style={{
          width: '350px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          margin: '1rem',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* 학생 정보 */}
          <div>
            <h3 style={{
              color: '#1e3a8a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-title)'
            }}>
              학생 정보
            </h3>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>이름:</strong> {submission.studentName}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>교재:</strong> {submission.bookTitle}
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>제출일:</strong> {new Date(submission.submittedAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 오디오 플레이어 */}
          {submission.audioUrl && (
            <div>
              <h3 style={{
                color: '#1e3a8a',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                margin: '0 0 0.5rem 0',
                fontFamily: 'var(--font-title)'
              }}>
                학생 녹음
              </h3>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <audio
                  ref={audioRef}
                  src={submission.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  style={{ display: 'none' }}
                />
                
                <button
                  onClick={handleAudioPlay}
                  style={{
                    background: isPlaying ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    {isPlaying ? (
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    ) : (
                      <path d="M8 5v14l11-7z"/>
                    )}
                  </svg>
                  {isPlaying ? '일시정지' : '재생'}
                </button>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  marginBottom: '0.5rem'
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    transition: 'width 0.1s ease'
                  }}></div>
                </div>
              </div>
            </div>
          )}

          {/* 첨삭 통계 */}
          <div>
            <h3 style={{
              color: '#1e3a8a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-title)'
            }}>
              첨삭 현황
            </h3>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>첨삭 횟수:</strong> {teacherAnnotations.length}개
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>학생 필기:</strong> {submission.strokeData?.length || 0}개
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>녹음:</strong> {submission.audioUrl ? '있음' : '없음'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TeacherAnnotationViewer;
