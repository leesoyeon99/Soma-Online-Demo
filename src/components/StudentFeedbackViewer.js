import React, { useState, useRef, useEffect, useCallback } from 'react';

const StudentFeedbackViewer = ({ 
  feedback, 
  onBackToStudentPage 
}) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const imageRef = useRef(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);
  
  // 레이어 토글 상태
  const [showStudentWork, setShowStudentWork] = useState(true);
  const [showTeacherFeedback, setShowTeacherFeedback] = useState(true);
  
  // 오디오 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 가상의 학생 필기 + 선생님 첨삭 이미지 생성
  const createFeedbackImage = useCallback(() => {
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
    ctx.fillText(feedback?.bookTitle || '소마 프리미어 교재', canvas.width / 2, 50);
    
    // 학생 이름
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`학생: ${feedback?.studentName || '김학생'}`, 50, 100);
    
    // 문제 영역
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('문제 1. 다음 수식을 계산하시오.', 50, 150);
    ctx.fillText('2x + 3y = 12', 50, 180);
    ctx.fillText('x - y = 1', 50, 210);
    
    // 학생 필기 (회색으로)
    if (showStudentWork) {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 학생이 그린 선들
      ctx.beginPath();
      ctx.moveTo(100, 250);
      ctx.lineTo(200, 250);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(100, 280);
      ctx.lineTo(300, 280);
      ctx.stroke();
      
      // 학생이 쓴 답
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.fillText('x = 3, y = 2', 100, 320);
    }
    
    // 선생님 첨삭 (빨간색으로)
    if (showTeacherFeedback) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 선생님이 그린 첨삭 선들
      ctx.beginPath();
      ctx.moveTo(95, 245);
      ctx.lineTo(205, 245);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(95, 275);
      ctx.lineTo(305, 275);
      ctx.stroke();
      
      // 선생님 피드백 텍스트
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('✓ 정답입니다!', 320, 320);
      
      // 추가 문제
      ctx.fillStyle = '#374151';
      ctx.font = '18px Arial';
      ctx.fillText('문제 2. 그래프를 그리시오.', 50, 400);
      
      // 학생이 그린 그래프 (회색)
      if (showStudentWork) {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 500);
        ctx.lineTo(300, 500);
        ctx.moveTo(200, 400);
        ctx.lineTo(200, 600);
        ctx.stroke();
        
        // 좌표축 라벨
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.fillText('x', 310, 500);
        ctx.fillText('y', 200, 390);
      }
      
      // 선생님 첨삭 (빨간색)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(95, 495);
      ctx.lineTo(305, 495);
      ctx.moveTo(195, 395);
      ctx.lineTo(195, 605);
      ctx.stroke();
      
      // 선생님 피드백
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('좋습니다! 좌표축을 정확히 그렸네요.', 320, 520);
      
      // 추가 피드백
      ctx.fillStyle = '#3b82f6';
      ctx.font = '16px Arial';
      ctx.fillText('💡 팁: 그래프에 눈금을 표시하면 더 좋겠어요!', 50, 650);
      
      // 전체적인 피드백
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('전체적으로 잘했어요! 계속 열심히 해주세요!', 50, 700);
    }
    
    return canvas.toDataURL();
  }, [feedback, showStudentWork, showTeacherFeedback]);

  // 이미지 로드
  useEffect(() => {
    if (feedback) {
      setImageLoaded(false);
      const imageDataUrl = createFeedbackImage();
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        renderImage(img);
      };
      img.src = imageDataUrl;
    }
  }, [feedback, createFeedbackImage]);

  // 이미지 렌더링
  const renderImage = useCallback((img) => {
    const canvas = canvasRef.current;
    
    if (canvas && img) {
      const scale = zoomScale || 1.0;
      const width = img.width * scale;
      const height = img.height * scale;
      
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(img, 0, 0, width, height);
    }
  }, [zoomScale]);

  // 줌 변경 시 이미지 다시 렌더링
  useEffect(() => {
    if (imageLoaded && feedback) {
      const imageDataUrl = createFeedbackImage();
      const img = new Image();
      img.onload = () => {
        renderImage(img);
      };
      img.src = imageDataUrl;
    }
  }, [zoomScale, imageLoaded, feedback, createFeedbackImage, renderImage]);

  // 줌 기능
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.2, 0.5));
  };

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

  if (!feedback) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <h2>첨삭을 확인해주세요</h2>
          <p>선생님이 보내주신 첨삭이 없습니다.</p>
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
        borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
        padding: '1rem 2rem',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
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
              onClick={onBackToStudentPage}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
              ← 학습 페이지로
            </button>
            
            <div>
              <h1 style={{
                color: '#1e3a8a',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)',
                margin: '0 0 0.25rem 0'
              }}>
                선생님 첨삭 확인
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '0.9rem',
                margin: '0',
                fontFamily: 'var(--font-body)'
              }}>
                {feedback.bookTitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        {/* 왼쪽: 이미지 뷰어 */}
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
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
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
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.5rem',
                borderRadius: '8px'
              }}>
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 0.5}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: zoomScale <= 0.5 ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: zoomScale <= 0.5 ? '#9ca3af' : '#10b981',
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
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: zoomScale >= 3.0 ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: zoomScale >= 3.0 ? '#9ca3af' : '#10b981',
                    cursor: zoomScale >= 3.0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              </div>

              {/* 레이어 토글 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowStudentWork(!showStudentWork)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: showStudentWork ? '2px solid #10b981' : '2px solid rgba(16, 185, 129, 0.3)',
                    background: showStudentWork ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                    color: showStudentWork ? '#10b981' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  내 필기
                </button>
                <button
                  onClick={() => setShowTeacherFeedback(!showTeacherFeedback)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: showTeacherFeedback ? '2px solid #ef4444' : '2px solid rgba(239, 68, 68, 0.3)',
                    background: showTeacherFeedback ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                    color: showTeacherFeedback ? '#ef4444' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  선생님 첨삭
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
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
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
                  borderTop: '4px solid #10b981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#6b7280', fontSize: '1rem' }}>첨삭 로딩 중...</span>
              </div>
            )}
            
            {imageLoaded && (
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
            )}
          </div>
        </div>

        {/* 오른쪽: 첨삭 정보 */}
        <div style={{
          width: '350px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          margin: '1rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* 첨삭 정보 */}
          <div>
            <h3 style={{
              color: '#1e3a8a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-title)'
            }}>
              첨삭 정보
            </h3>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>교재:</strong> {feedback.bookTitle}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>첨삭일:</strong> {new Date(feedback.timestamp).toLocaleString('ko-KR')}
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>선생님:</strong> {feedback.teacherName}
              </p>
            </div>
          </div>

          {/* 레이어 설명 */}
          <div>
            <h3 style={{
              color: '#1e3a8a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-title)'
            }}>
              레이어 설명
            </h3>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '20px',
                  height: '3px',
                  background: '#6b7280',
                  borderRadius: '2px'
                }}></div>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>내 필기</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '20px',
                  height: '3px',
                  background: '#ef4444',
                  borderRadius: '2px'
                }}></div>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>선생님 첨삭</span>
              </div>
            </div>
          </div>

          {/* 피드백 요약 */}
          <div>
            <h3 style={{
              color: '#1e3a8a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0',
              fontFamily: 'var(--font-title)'
            }}>
              피드백 요약
            </h3>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>정답:</strong> ✓ 맞습니다!
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>그래프:</strong> 잘 그렸어요!
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>
                <strong>전체:</strong> 계속 열심히 해주세요!
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

export default StudentFeedbackViewer;
