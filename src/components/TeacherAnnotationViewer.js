import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import StaticPDFViewer from './StaticPDFViewer';

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
  const pdfViewerRef = useRef(null);
  
  const [zoomScale, setZoomScale] = useState(1.0);
  
  // 첨삭 도구 상태
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  
  
  // 첨삭 데이터
  const [teacherAnnotations, setTeacherAnnotations] = useState([]);
  
  
  // 오디오 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // 선생 첨삭 재생 상태
  const [isTeacherReplaying, setIsTeacherReplaying] = useState(false);
  const syncIntervalRef = useRef(null);
  const [enableStrokeAnimation] = useState(true);

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

  // 제출물 데이터 디버깅
  useEffect(() => {
    console.log('🎓 TeacherAnnotationViewer 렌더링:', {
      hasSubmission: !!submission,
      isTeacherFeedback: submission?.isTeacherFeedback,
      teacherName: submission?.teacherName,
      hasAudioBase64: !!submission?.audioBase64,
      hasAudioUrl: !!submission?.audioUrl,
      strokeCount: submission?.strokeData?.length,
      recordingStartTime: submission?.recordingStartTime
    });
    console.log('📦 전체 submission 객체:', submission);
    
    // 선생 첨삭 데이터가 있으면 복원
    if (submission?.isTeacherFeedback && submission?.strokeData) {
      setTeacherAnnotations(submission.strokeData);
      console.log('✅ 선생 첨삭 스트로크 복원:', submission.strokeData.length, '개');
    }
  }, [submission]);

  // PDF 파일 경로 추출 (useMemo로 최적화)
  const pdfFilePath = useMemo(() => {
    // pdfFileName 또는 bookUrl에서 전체 경로 가져오기
    const pdfPath = submission?.pdfFileName || submission?.bookUrl;
    
    console.log('🔍 PDF 경로 계산 중:', {
      'submission?.pdfFileName': submission?.pdfFileName,
      'submission?.bookUrl': submission?.bookUrl,
      'pdfPath': pdfPath
    });
    
    if (!pdfPath) {
      console.warn('⚠️ PDF 경로를 찾을 수 없습니다. 기본값 사용');
      return '/assets/pdf/mvp_2023_소마_프리미어.pdf';
    }
    
    console.log('📄 원본 PDF 경로:', pdfPath);
    
    // 이미 전체 경로면 그대로 반환
    if (pdfPath.startsWith('/assets/pdf/') || pdfPath.startsWith('/')) {
      console.log('✅ 전체 경로 반환:', pdfPath);
      return pdfPath;
    }
    
    // 파일명만 있으면 경로 추가
    const fullPath = `/assets/pdf/${pdfPath}`;
    console.log('➕ 경로 추가 후 반환:', fullPath);
    return fullPath;
  }, [submission?.pdfFileName, submission?.bookUrl]);





  // 오디오 재생 핸들러
  // 학생 제출물 통합 재생 (오디오 + 스트로크 동기화)
  const handleStudentWorkReplay = async () => {
    const audio = audioRef.current;
    const pdfViewerCanvas = document.querySelector('canvas'); // PDF 캔버스
    
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    
    // 재생 시작
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
    
    console.log('🎬 학생 제출물 재생 시작:', {
      strokeCount: submission.strokeData?.length,
      hasAudio: !!(submission.audioBase64 || submission.audioUrl),
      recordingStartTime: submission.recordingStartTime
    });
    
    // 스트로크 애니메이션 (타임스탬프에 맞춰 그리기)
    if (submission.strokeData && submission.strokeData.length > 0) {
      const recordingStrokes = submission.strokeData.filter(
        stroke => stroke.isRecording && typeof stroke.timestamp === 'number'
      );
      
      console.log('재생할 녹음 스트로크:', recordingStrokes.length, '개');
      
      // 스트로크 동기화 인터벌
      const syncInterval = setInterval(() => {
        if (!audio || audio.paused || audio.ended) {
          clearInterval(syncInterval);
          return;
        }
        
        const currentAudioTime = audio.currentTime;
        
        // 현재 오디오 시간에 맞는 스트로크 그리기
        recordingStrokes.forEach(stroke => {
          if (stroke.timestamp <= currentAudioTime && !stroke.drawn) {
            console.log(`스트로크 그리기: ${stroke.timestamp.toFixed(2)}s`);
            // TODO: 캔버스에 실제로 그리기
            stroke.drawn = true;
          }
        });
      }, 50);
    }
  };

  // 선생 첨삭 재생 (오디오 + 스트로크 동기화)
  const handleTeacherFeedbackReplay = async () => {
    console.log('🎬 선생 첨삭 재생 시작');
    
    const markupCanvas = pdfViewerRef?.current?.markupCanvasRef?.current;
    
    if (!markupCanvas) {
      console.error('❌ 마크업 캔버스를 찾을 수 없습니다');
      return;
    }
    
    // 재생 중이면 중지
    if (isTeacherReplaying) {
      console.log('⏸️ 재생 중지');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      setIsTeacherReplaying(false);
      setIsPlaying(false);
      return;
    }
    
    // 재생 시작
    setIsTeacherReplaying(true);
    
    // 캔버스 초기화
    const context = markupCanvas.getContext('2d');
    context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
    
    // 선생 녹음 스트로크 필터링
    const teacherRecordingStrokes = (submission?.strokeData || []).filter(
      stroke => stroke.isRecording && typeof stroke.timestamp === 'number' && 
                stroke.timestamp !== null && stroke.timestamp !== undefined
    );
    
    console.log('👨‍🏫 선생 녹음 스트로크:', teacherRecordingStrokes.length, '개');
    
    if (teacherRecordingStrokes.length === 0) {
      console.warn('⚠️ 선생 녹음 스트로크가 없습니다!');
      setIsTeacherReplaying(false);
      return;
    }
    
    // 현재 캔버스 크기
    const currentCanvasWidth = markupCanvas.width;
    const currentCanvasHeight = markupCanvas.height;
    
    // 상대 좌표 → 절대 좌표 변환
    const denormalizePoints = (points) => {
      return points.map(point => {
        if (point.x <= 1 && point.y <= 1) {
          return { x: point.x * currentCanvasWidth, y: point.y * currentCanvasHeight };
        } else {
          return point;
        }
      });
    };
    
    // 오디오 재생
    let audioInstance = null;
    if (submission?.audioBase64 || submission?.audioUrl) {
      try {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          await audio.play();
          setIsPlaying(true);
          audioInstance = audio;
          console.log('🎵 선생 오디오 재생 시작');
        }
      } catch (error) {
        console.error('❌ 선생 오디오 재생 오류:', error);
        setIsTeacherReplaying(false);
        return;
      }
    }
    
    // 스트로크 재생 동기화
    const hasAudio = audioInstance !== null;
    let startTime = Date.now();
    
    syncIntervalRef.current = setInterval(() => {
      let currentPlaybackTime = 0;
      
      if (hasAudio && audioInstance && !audioInstance.paused && !audioInstance.ended) {
        currentPlaybackTime = audioInstance.currentTime;
      } else if (!hasAudio) {
        currentPlaybackTime = (Date.now() - startTime) / 1000;
      } else {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
        setIsTeacherReplaying(false);
        setIsPlaying(false);
        return;
      }
      
      // 현재 재생 시간에 맞는 스트로크 그리기
      teacherRecordingStrokes.forEach((stroke) => {
        if (stroke.timestamp && stroke.timestamp <= currentPlaybackTime && !stroke.drawn) {
          console.log(`✏️ 선생 스트로크 그리기: 타입=${stroke.tool}, 타임스탬프 ${stroke.timestamp.toFixed(2)}s`);
          
          const absolutePoints = stroke.points ? denormalizePoints(stroke.points) : [];
          
          context.save();
          
          if (stroke.tool === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
            const eraserSize = stroke.brushSize * 10 || 30;
            
            for (let i = 0; i < absolutePoints.length; i++) {
              context.beginPath();
              context.arc(absolutePoints[i].x, absolutePoints[i].y, eraserSize, 0, 2 * Math.PI);
              context.fill();
            }
          } else {
            context.beginPath();
            context.lineWidth = stroke.brushSize || 3;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = stroke.color || '#ef4444';
            
            if (absolutePoints.length > 1) {
              context.moveTo(absolutePoints[0].x, absolutePoints[0].y);
              for (let i = 1; i < absolutePoints.length; i++) {
                context.lineTo(absolutePoints[i].x, absolutePoints[i].y);
              }
              context.stroke();
            }
          }
          
          stroke.drawn = true;
          context.restore();
        }
      });
      
      // 오디오 없이 스트로크만 재생하는 경우, 모든 스트로크가 그려지면 종료
      if (!hasAudio && teacherRecordingStrokes.every(s => s.drawn)) {
        console.log('✅ 모든 선생 스트로크 재생 완료 (오디오 없음)');
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
        setIsTeacherReplaying(false);
        
        // drawn 플래그 초기화
        teacherRecordingStrokes.forEach(stroke => delete stroke.drawn);
      }
    }, 50);
    
    // 오디오 종료 이벤트
    if (audioInstance) {
      audioInstance.onended = () => {
        console.log('🎵 선생 오디오 재생 종료');
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
        setIsTeacherReplaying(false);
        setIsPlaying(false);
        
        // drawn 플래그 초기화
        teacherRecordingStrokes.forEach(stroke => delete stroke.drawn);
      };
    }
  };

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

            </div>
          </div>

          {/* PDF 뷰어 */}
          <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <StaticPDFViewer
              ref={pdfViewerRef}
              pdfFileName={pdfFilePath}
              pageNum={submission?.currentPage || 1}
              zoomScale={zoomScale}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              isReplaying={isPlaying || isTeacherReplaying}
              isRecording={false}
              recordingStartTime={null}
              onStrokeDataChange={(newStrokeData) => {
                console.log('📝 선생 onStrokeDataChange 호출됨, 스트로크 수:', newStrokeData.length);
                setTeacherAnnotations(newStrokeData);
              }}
              isTeacherMode={true}
              studentStrokeData={submission?.strokeData}
              onPageCountChange={() => {}}
              onPageChange={() => {}}
              feedbackTexts={[]}
            />
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

          {/* 제출 정보 */}
          <div>
            <h3 style={{
              color: '#1e3a8a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-title)'
            }}>
              제출 정보
            </h3>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.9rem',
              color: '#64748b'
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>페이지:</strong> {submission.currentPage || '정보 없음'}
              </p>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>스트로크:</strong> {submission.strokeData?.length || 0}개
              </p>
              <p style={{ margin: '0' }}>
                <strong>오디오:</strong> {(submission.audioBase64 || submission.audioUrl) ? '있음 ✅' : '없음 ❌'}
              </p>
            </div>
          </div>

          {/* 오디오 플레이어 */}
          {(submission.audioBase64 || submission.audioUrl) && (
            <div>
              <h3 style={{
                color: '#1e3a8a',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                margin: '0 0 0.5rem 0',
                fontFamily: 'var(--font-title)'
              }}>
                학생 녹음 재생
              </h3>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <audio
                  ref={audioRef}
                  src={submission.audioBase64 || submission.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  style={{ display: 'none' }}
                />
                
                {/* 선생 첨삭 재생 버튼 (선생 첨삭인 경우에만 표시) */}
                {submission?.isTeacherFeedback ? (
                  <button
                    onClick={handleTeacherFeedbackReplay}
                    style={{
                      background: isTeacherReplaying 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                      marginBottom: '0.5rem'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      {isTeacherReplaying ? (
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      ) : (
                        <path d="M8 5v14l11-7z"/>
                      )}
                    </svg>
                    {isTeacherReplaying ? '재생 중...' : '🎬 선생님 첨삭 재생'}
                  </button>
                ) : (
                  // 통합 재생 버튼 (오디오 + 스트로크) - 학생 제출물인 경우
                  <button
                    onClick={handleStudentWorkReplay}
                    style={{
                      background: isPlaying 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                      marginBottom: '0.5rem'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      {isPlaying ? (
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      ) : (
                        <path d="M8 5v14l11-7z"/>
                      )}
                    </svg>
                    {isPlaying ? '재생 중...' : '🎬 학습 재생 (오디오+필기)'}
                  </button>
                )}
                
                {/* 오디오만 재생 버튼 */}
                <button
                  onClick={handleAudioPlay}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    opacity: 0.8
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  오디오만 재생
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
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>녹음:</strong> {submission.audioUrl ? '있음' : '없음'}
              </p>
              
              {/* 첨삭 재생 버튼 */}
              <button
                onClick={submission?.isTeacherFeedback ? handleTeacherFeedbackReplay : handleStudentWorkReplay}
                disabled={!submission?.audioBase64 && !submission?.audioUrl && (!submission?.strokeData || submission.strokeData.length === 0)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: isTeacherReplaying ? '2px solid #fbbf24' : '2px solid #8b5cf6',
                  background: isTeacherReplaying ? 'rgba(251, 191, 36, 0.1)' : 'rgba(139, 92, 246, 0.2)',
                  color: isTeacherReplaying ? '#f59e0b' : '#7c3aed',
                  cursor: (!submission?.audioBase64 && !submission?.audioUrl && (!submission?.strokeData || submission.strokeData.length === 0)) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: (!submission?.audioBase64 && !submission?.audioUrl && (!submission?.strokeData || submission.strokeData.length === 0)) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = isTeacherReplaying 
                      ? '0 4px 12px rgba(251, 191, 36, 0.4)' 
                      : '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={isTeacherReplaying ? '첨삭 재생 중지' : '첨삭 재생'}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  {isTeacherReplaying ? (
                    // 일시정지 아이콘
                    <>
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </>
                  ) : (
                    // 재생 아이콘
                    <polygon points="5 3 19 12 5 21 5 3" />
                  )}
                </svg>
                {isTeacherReplaying ? '첨삭 재생 중지' : '첨삭 재생'}
              </button>
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
