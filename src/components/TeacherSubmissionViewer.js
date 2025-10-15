import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import StaticPDFViewer from './StaticPDFViewer';

const TeacherSubmissionViewer = ({ 
  submission, 
  onBackToSubmissions, 
  onSaveFeedback 
}) => {
  const audioRef = useRef(null);
  const pdfViewerRef = useRef(null);
  const syncIntervalRef = useRef(null);
  
  const [zoomScale, setZoomScale] = useState(1.0);
  
  // 첨삭 도구 상태
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  
  // 첨삭 데이터
  const [teacherAnnotations, setTeacherAnnotations] = useState([]);
  
  // 샘플 첨삭 텍스트 (PDF 위에 표시될 내용)
  const sampleFeedbackTexts = [
    { text: "좋아요! 계산이 정확해요", x: 200, y: 300, color: '#ef4444' },
    { text: "단위를 써주세요", x: 350, y: 450, color: '#3b82f6' },
    { text: "여기서 실수했어요", x: 180, y: 600, color: '#f59e0b' },
    { text: "과정이 명확해요 👍", x: 400, y: 200, color: '#10b981' }
  ];
  
  // 오디오 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 제출물 데이터 디버깅
  useEffect(() => {
    console.log('🎓 TeacherSubmissionViewer 렌더링:', {
      hasSubmission: !!submission,
      studentName: submission?.studentName,
      currentPage: submission?.currentPage,
      bookUrl: submission?.bookUrl,
      pdfFileName: submission?.pdfFileName,
      hasAudioBase64: !!submission?.audioBase64,
      hasAudioUrl: !!submission?.audioUrl,
      strokeCount: submission?.strokeData?.length
    });
    console.log('📦 전체 submission 객체:', submission);
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

  // 첨삭 그리기
  // const drawAnnotations = useCallback(() => {
  //   // 빈 함수 - 나중에 구현 예정
  // }, []);

  // 선생님 첨삭 그리기
  // const drawTeacherAnnotations = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
  //   
  //   const context = canvas.getContext('2d');
  //   
  //   teacherAnnotations.forEach(annotation => {
  //     if (annotation.type === 'stroke') {
  //       context.save();
  //       context.strokeStyle = annotation.color;
  //       context.lineWidth = annotation.brushSize;
  //       context.lineCap = 'round';
  //       context.lineJoin = 'round';
  //       
  //       if (annotation.tool === 'highlighter') {
  //         context.globalAlpha = 0.3;
  //         context.globalCompositeOperation = 'multiply';
  //       } else {
  //         context.globalAlpha = 1;
  //         context.globalCompositeOperation = 'source-over';
  //       }
  //       
  //       context.beginPath();
  //       context.moveTo(annotation.points[0].x, annotation.points[0].y);
  //       for (let i = 1; i < annotation.points.length; i++) {
  //         context.lineTo(annotation.points[i].x, annotation.points[i].y);
  //       }
  //       context.stroke();
  //       context.restore();
  //     }
  //   });
  // }, [teacherAnnotations]);


  // 전체 삭제
  const handleClearAll = () => {
    if (window.confirm('현재 페이지의 모든 첨삭을 삭제하시겠습니까?')) {
      setTeacherAnnotations([]);
      // StaticPDFViewer의 전체 삭제 이벤트 발생
      const event = new CustomEvent('clearAllDrawings');
      window.dispatchEvent(event);
    }
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

  // 페이지 변경 핸들러 (메모이제이션으로 불필요한 리렌더링 방지)
  const handlePageChange = useCallback(() => {}, []);
  const handlePageCountChange = useCallback(() => {}, []);

  // 학생 학습 재생 (오디오 + 스트로크 동기화)
  const handleCombinedReplay = useCallback(() => {
    const audio = audioRef.current;
    const markupCanvas = pdfViewerRef?.current?.markupCanvasRef?.current;
    
    console.log('🎬 학생 학습 재생 시작:', {
      hasAudio: !!audio,
      hasCanvas: !!markupCanvas,
      strokeCount: submission?.strokeData?.length,
      recordingStartTime: submission?.recordingStartTime
    });
    
    if (!markupCanvas) {
      console.error('❌ 마크업 캔버스를 찾을 수 없습니다.');
      alert('PDF 뷰어가 준비되지 않았습니다.');
      return;
    }
    
    // 이미 재생 중이면 중지
    if (isReplaying) {
      if (audio) audio.pause();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      setIsReplaying(false);
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }
    
    // 마크업 캔버스 초기화
    const context = markupCanvas.getContext('2d');
    context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
    
    // 녹음된 스트로크 필터링 (isRecording: true, timestamp 있음)
    const recordingStrokes = (submission?.strokeData || []).filter(
      stroke => stroke.isRecording && typeof stroke.timestamp === 'number' && 
                stroke.timestamp !== null && stroke.timestamp !== undefined
    );
    
    // 배경 스트로크 (isRecording: false, eraser 제외)
    const backgroundStrokes = (submission?.strokeData || []).filter(
      stroke => !stroke.isRecording && stroke.tool !== 'eraser'
    );
    
    console.log('📊 스트로크 분류:', {
      전체: submission?.strokeData?.length,
      녹음: recordingStrokes.length,
      배경: backgroundStrokes.length
    });
    
    const currentCanvasWidth = markupCanvas.width;
    const currentCanvasHeight = markupCanvas.height;
    
    // 상대 좌표를 절대 좌표로 변환하는 헬퍼 함수
    const denormalizePoints = (points) => {
      return points.map(point => {
        if (point.x <= 1 && point.y <= 1) {
          // 상대 좌표 → 절대 좌표
          return {
            x: point.x * currentCanvasWidth,
            y: point.y * currentCanvasHeight
          };
        } else {
          // 이미 절대 좌표 (기존 데이터 호환)
          return point;
        }
      });
    };
    
    // 배경 스트로크 먼저 그리기
    backgroundStrokes.forEach(stroke => {
      if (stroke.tool === 'pen' && stroke.points) {
        const denormalizedPoints = denormalizePoints(stroke.points);
        
        context.save();
        context.strokeStyle = stroke.color || '#000000';
        context.lineWidth = stroke.brushSize || 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        denormalizedPoints.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.stroke();
        context.restore();
      } else if (stroke.tool === 'eraser' && stroke.points) {
        const denormalizedPoints = denormalizePoints(stroke.points);
        
        context.save();
        context.globalCompositeOperation = 'destination-out';
        denormalizedPoints.forEach(point => {
          context.beginPath();
          context.arc(point.x, point.y, (stroke.brushSize || 20) / 2, 0, Math.PI * 2);
          context.fill();
        });
        context.restore();
      }
    });
    
    // drawn 플래그 초기화
    recordingStrokes.forEach(stroke => {
      stroke.drawn = false;
      stroke.animationIndex = 0;
    });
    
    setIsReplaying(true);
    
    // 오디오 재생
    if (audio && submission?.audioBase64) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('오디오 재생 오류:', err));
      setIsPlaying(true);
    }
    
    // 스트로크 동기화 인터벌
    const localSyncInterval = setInterval(() => {
      const currentAudioTime = audio?.currentTime || 0;
      
      recordingStrokes.forEach(stroke => {
        if (stroke.timestamp <= currentAudioTime && !stroke.drawn) {
          // 스트로크 그리기 (상대 좌표 변환 적용)
          if (stroke.tool === 'pen' && stroke.points) {
            const denormalizedPoints = denormalizePoints(stroke.points);
            
            context.save();
            context.strokeStyle = stroke.color || '#000000';
            context.lineWidth = stroke.brushSize || 3;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            context.beginPath();
            denormalizedPoints.forEach((point, index) => {
              if (index === 0) {
                context.moveTo(point.x, point.y);
              } else {
                context.lineTo(point.x, point.y);
              }
            });
            context.stroke();
            context.restore();
          } else if (stroke.tool === 'eraser' && stroke.points) {
            const denormalizedPoints = denormalizePoints(stroke.points);
            
            context.save();
            context.globalCompositeOperation = 'destination-out';
            denormalizedPoints.forEach(point => {
              context.beginPath();
              context.arc(point.x, point.y, (stroke.brushSize || 20) / 2, 0, Math.PI * 2);
              context.fill();
            });
            context.restore();
          }
          
          stroke.drawn = true;
        }
      });
      
      // 재생 완료 체크
      if (audio && audio.ended) {
        clearInterval(localSyncInterval);
        syncIntervalRef.current = null;
        setIsReplaying(false);
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('✅ 재생 완료');
      }
    }, 50);
    
    syncIntervalRef.current = localSyncInterval;
    
    // 오디오 종료 이벤트 핸들러
    if (audio) {
      audio.onended = () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
        setIsReplaying(false);
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('✅ 오디오 종료, 재생 완료');
      };
    }
  }, [submission, isReplaying]);
  
  // 오디오만 재생
  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // 오디오 메타데이터 로드
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      console.log('🎵 오디오 로드 완료:', {
        duration: audioRef.current.duration,
        src: audioRef.current.src ? '데이터 있음' : '데이터 없음'
      });
    }
  };

  // 오디오 시간 업데이트
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // 오디오 종료
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!submission) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <h2>제출물을 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      padding: '2rem'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* 뒤로가기 버튼 */}
          <div style={{ alignSelf: 'flex-start' }}>
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
          </div>
          
          {/* 제목과 학생 정보 */}
          <div>
            <h1 style={{
              color: '#1e3a8a',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-title)',
              margin: '0 0 0.25rem 0'
            }}>
              {submission.bookTitle} - 강사 첨삭
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: '0'
            }}>
              학생: {submission.studentName} | 페이지: {submission.currentPage || '정보 없음'} | 제출: {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 도구 모음 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              도구:
            </span>
            {['pen', 'eraser'].map(tool => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                style={{
                  background: selectedTool === tool ? '#3b82f6' : 'white',
                  color: selectedTool === tool ? 'white' : '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tool === 'pen' ? '펜' : '지우개'}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              색상:
            </span>
            {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: selectedColor === color ? '3px solid #1f2937' : '2px solid #e5e7eb',
                  background: color,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              크기:
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              style={{
                width: '100px'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {brushSize}px
            </span>
          </div>

        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        height: 'calc(100vh - 200px)'
      }}>
        {/* PDF 뷰어 영역 */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
            isReplaying={isReplaying}
            onStrokeDataChange={(strokeData) => {
              setTeacherAnnotations(strokeData);
            }}
            isTeacherMode={true}
            studentStrokeData={null}
            onPageCountChange={handlePageCountChange}
            onPageChange={handlePageChange}
            feedbackTexts={sampleFeedbackTexts}
          />
          
          {/* 줌 컨트롤 */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 10
          }}>
            <button
              onClick={handleZoomOut}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              -
            </button>
            <span style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* 사이드바 */}
        <div style={{
          width: '300px',
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem',
            fontFamily: 'var(--font-title)'
          }}>
            첨삭 정보
          </h3>

          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                학생:
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {submission.studentName}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                제출 시간:
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                첨삭 개수:
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {teacherAnnotations.length}개
              </span>
            </div>
          </div>

          {/* 학습 재생 버튼 (오디오 + 스트로크 동기화) */}
          {submission.audioUrl && (
            <div style={{
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                학생 학습 재생
              </h4>
              <button
                onClick={handleCombinedReplay}
                style={{
                  width: '100%',
                  background: isReplaying 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem'
                }}
              >
                {isReplaying ? '⏸️ 재생 중지' : '▶️ 학습 재생 (오디오+필기)'}
              </button>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
              </div>
              <audio
                ref={audioRef}
                src={submission?.audioBase64 || submission?.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                style={{ display: 'none' }}
              />
            </div>
          )}

          <button
            onClick={handleSaveFeedback}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            첨삭 저장하기
          </button>

          {/* 전체삭제 버튼 */}
          <button
            onClick={handleClearAll}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '2px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            title="전체삭제"
          >
            전체삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubmissionViewer;
