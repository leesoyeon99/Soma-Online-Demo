import React, { useState, useRef, useEffect, useCallback } from 'react';
import StaticPDFViewer from './StaticPDFViewer';

const TeacherSubmissionViewer = ({ 
  submission, 
  onBackToSubmissions, 
  onSaveFeedback 
}) => {
  const audioRef = useRef(null);
  
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

  // PDF 파일명 추출
  const getPdfFileName = () => {
    if (!submission?.bookUrl) return 'somapremier.pdf';
    const url = submission.bookUrl;
    if (url.includes('/')) {
      return url.split('/').pop();
    }
    return url;
  };

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

  // 오디오 재생
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

  // 오디오 시간 업데이트
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
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
              학생: {submission.studentName} | 제출: {new Date(submission.submittedAt).toLocaleString()}
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
            pdfFileName={getPdfFileName()}
            pageNum={1}
            zoomScale={zoomScale}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            brushSize={brushSize}
            onStrokeDataChange={(strokeData) => {
              setTeacherAnnotations(strokeData);
            }}
            isTeacherMode={true}
            onPageCountChange={() => {}}
            onPageChange={() => {}}
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

          {/* 오디오 재생 */}
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
                학생 음성 설명
              </h4>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <button
                  onClick={handlePlayAudio}
                  style={{
                    background: isPlaying ? '#ef4444' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
{isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <div style={{
                  flex: 1,
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                </div>
              </div>
              <audio
                ref={audioRef}
                src={submission.audioUrl}
                onTimeUpdate={handleTimeUpdate}
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
