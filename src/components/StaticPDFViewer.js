import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정 - CDN 사용 (API 버전과 일치)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';

const StaticPDFViewer = ({ 
  pdfFileName = 'somapremier.pdf',
  pageNum = 1, 
  zoomScale = 1.0, 
  selectedTool = 'pen',
  selectedColor = '#ef4444',
  brushSize = 3,
  onStrokeDataChange,
  isRecording = false,
  studentStrokeData = null,
  teacherFeedbackData = null,
  showTeacherFeedback = false,
  isTeacherMode = false,
  isStudentMode = false,
  onPageCountChange,
  onPageChange
}) => {
  const canvasRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [renderTask, setRenderTask] = useState(null);
  
  // PDF 페이지 제한 (성능 최적화)
  const MAX_PAGES = 5; // 최대 5페이지만 표시
  // 썸네일 기능 임시 비활성화 (성능 최적화)
  const [thumbnails, setThumbnails] = useState({});
  const [showThumbnails, setShowThumbnails] = useState(false);
  const THUMBNAIL_ENABLED = false; // 썸네일 기능 활성화/비활성화 플래그
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);

  // PDF 문서 로드 (정적 경로 사용)
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setPageRendering(true);
        console.log('PDF 로딩 시작:', pdfFileName);
        
        // 정적 경로로 PDF 로드 (PUBLIC_URL 포함)
        const pdfUrl = `${process.env.PUBLIC_URL}/static/${pdfFileName}`;
        console.log('PDF URL:', pdfUrl);
        console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
        console.log('pdfFileName:', pdfFileName);
        
        // 먼저 fetch로 PDF 파일을 가져와서 ArrayBuffer로 변환
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log('PDF 파일 다운로드 완료, 크기:', arrayBuffer.byteLength);
        
        // 첫 100바이트를 확인해서 실제 PDF인지 검증
        const firstBytes = new Uint8Array(arrayBuffer.slice(0, 100));
        const firstString = String.fromCharCode.apply(null, firstBytes);
        console.log('파일 시작 부분:', firstString);
        
        if (!firstString.startsWith('%PDF')) {
          throw new Error('다운로드된 파일이 PDF가 아닙니다. HTML 에러 페이지일 가능성이 있습니다.');
        }
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.149/cmaps/',
          cMapPacked: true,
          verbosity: 0
        });
        
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        // 실제 페이지 수와 표시할 페이지 수 중 작은 값 사용
        const displayPages = Math.min(pdf.numPages, MAX_PAGES);
        setTotalPages(displayPages);
        if (onPageCountChange) {
          onPageCountChange(displayPages);
        }
        
        console.log(`PDF 로드 완료: 전체 ${pdf.numPages}페이지 중 ${displayPages}페이지만 표시`);
        
        console.log('PDF 로드 완료:', pdf.numPages, '페이지');
        setPageRendering(false);
      } catch (error) {
        console.error('PDF 로드 오류:', error);
        setPageRendering(false);
      }
    };

    if (pdfFileName) {
      loadPDF();
    }
  }, [pdfFileName, onPageCountChange]);

  // 스트로크 그리기
  const drawStroke = (context, drawing) => {
    if (drawing.points.length < 2) return;
    
    context.beginPath();
    context.lineWidth = drawing.brushSize || 3;
    context.strokeStyle = drawing.color || '#ef4444';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    context.moveTo(drawing.points[0].x, drawing.points[0].y);
    for (let i = 1; i < drawing.points.length; i++) {
      context.lineTo(drawing.points[i].x, drawing.points[i].y);
    }
    context.stroke();
  };

  // 마크업 다시 그리기 (성능 최적화)
  const redrawMarkups = useCallback(() => {
    const markupCanvas = markupCanvasRef.current;
    if (!markupCanvas) return;
    
    const context = markupCanvas.getContext('2d');
    
    // 캔버스 크기가 변경되지 않았을 때만 clearRect 사용
    if (markupCanvas.width > 0 && markupCanvas.height > 0) {
      context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
    }
    
    // 학생 스트로크 데이터 그리기
    if (isStudentMode && studentStrokeData) {
      studentStrokeData.forEach(drawing => {
        drawStroke(context, drawing);
      });
    }
    
    // 선생님 피드백 데이터 그리기
    if (isTeacherMode && teacherFeedbackData && showTeacherFeedback) {
      teacherFeedbackData.forEach(drawing => {
        drawStroke(context, drawing);
      });
    }
    
    // 현재 저장된 그림들 그리기
    savedDrawings.forEach(drawing => {
      drawStroke(context, drawing);
    });
  }, [savedDrawings, isTeacherMode, studentStrokeData, isStudentMode, teacherFeedbackData, showTeacherFeedback]);

  // 페이지 렌더링 (안전한 렌더링 관리)
  const renderPage = useCallback(async (page, canvas, scale) => {
    // 이전 렌더링 작업이 있다면 완전히 취소하고 대기
    const currentRenderTask = renderTask;
    if (currentRenderTask) {
      try {
        currentRenderTask.cancel();
        // 취소 완료까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.log('이전 렌더링 작업 취소됨');
      }
      setRenderTask(null);
    }
    
    // 캔버스 초기화
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const viewport = page.getViewport({ scale });
    
    // 캔버스 크기 설정
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    // 새로운 렌더링 작업 시작
    const task = page.render(renderContext);
    
    try {
      await task.promise;
    } catch (error) {
      if (error.name === 'RenderingCancelledException') {
        console.log('렌더링이 취소되었습니다');
        return task;
      }
      console.error('페이지 렌더링 오류:', error);
    }
    
    return task;
  }, []);

  // 페이지 변경 시 렌더링 (안전한 렌더링 + 페이지 제한)
  useEffect(() => {
    if (pdfDoc && pageNum && pageNum <= MAX_PAGES) {
      setPageRendering(true);
      
      // 이전 렌더링 작업 취소
      const currentRenderTask = renderTask;
      if (currentRenderTask) {
        currentRenderTask.cancel();
        setRenderTask(null);
      }
      
      // 렌더링 작업을 순차적으로 처리
      const renderCurrentPage = async () => {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const canvas = canvasRef.current;
          const markupCanvas = markupCanvasRef.current;
          
          if (canvas && markupCanvas) {
            const scale = zoomScale || 1.0;
            
            // 캔버스 클리어
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // PDF 렌더링
            const task = await renderPage(page, canvas, scale);
            setRenderTask(task);
            
            // 마크업 캔버스 크기 조정
            markupCanvas.height = canvas.height;
            markupCanvas.width = canvas.width;
            
            // 마크업 다시 그리기 (지연 실행으로 성능 최적화)
            setTimeout(() => {
              redrawMarkups();
            }, 50);
          }
        } catch (error) {
          console.error('페이지 렌더링 오류:', error);
        } finally {
          setPageRendering(false);
        }
      };
      
      renderCurrentPage();
    } else if (pageNum > MAX_PAGES) {
      // 제한된 페이지 범위를 벗어나면 첫 페이지로 이동
      console.log(`페이지 ${pageNum}은 제한 범위(${MAX_PAGES}페이지)를 벗어납니다.`);
      if (onPageChange) {
        onPageChange(1);
      }
    }
  }, [pdfDoc, pageNum, zoomScale, redrawMarkups, MAX_PAGES, onPageChange]);

  // 컴포넌트 언마운트 시 렌더링 작업 정리
  useEffect(() => {
    return () => {
      if (renderTask) {
        try {
          renderTask.cancel();
          setRenderTask(null);
        } catch (error) {
          // 렌더링 취소 에러는 무시
          console.log('컴포넌트 언마운트 시 렌더링 작업 취소됨');
        }
      }
    };
  }, [renderTask]);

  // 렌더링 작업 상태 초기화
  useEffect(() => {
    return () => {
      setRenderTask(null);
      setPageRendering(false);
    };
  }, []);

  // 썸네일 생성 함수 (메모리 최적화)
  const generateThumbnail = useCallback(async (page, pageNumber) => {
    try {
      const viewport = page.getViewport({ scale: 0.15 }); // 더 작은 스케일로 메모리 절약
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // 최대 크기 제한
      const maxWidth = 150;
      const maxHeight = 200;
      
      if (viewport.width > maxWidth || viewport.height > maxHeight) {
        const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
        const scaledViewport = page.getViewport({ scale: 0.15 * scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        };
        
        await page.render(renderContext).promise;
      } else {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
      }
      
      // JPEG로 압축해서 메모리 사용량 줄이기
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      setThumbnails(prev => ({
        ...prev,
        [pageNumber]: dataUrl
      }));
      
      // 캔버스 메모리 해제
      canvas.width = 0;
      canvas.height = 0;
    } catch (error) {
      console.error(`썸네일 생성 오류 (페이지 ${pageNumber}):`, error);
    }
  }, []);

  // 개별 썸네일 생성 (지연 로딩 + 캐시 제한)
  const generateThumbnailIfNeeded = useCallback(async (pageNumber) => {
    if (thumbnails[pageNumber] || !pdfDoc) return;
    
    try {
      const page = await pdfDoc.getPage(pageNumber);
      await generateThumbnail(page, pageNumber);
      
      // 썸네일 캐시 제한 (최대 10개만 유지)
      setThumbnails(prev => {
        const newThumbnails = { ...prev };
        const keys = Object.keys(newThumbnails);
        
        if (keys.length > 10) {
          // 현재 페이지에서 가장 먼 페이지부터 삭제
          const sortedKeys = keys.sort((a, b) => {
            const distA = Math.abs(parseInt(a) - pageNum);
            const distB = Math.abs(parseInt(b) - pageNum);
            return distB - distA;
          });
          
          // 가장 먼 3개 삭제
          for (let i = 0; i < 3 && i < sortedKeys.length; i++) {
            delete newThumbnails[sortedKeys[i]];
          }
        }
        
        return newThumbnails;
      });
    } catch (error) {
      console.error(`페이지 ${pageNumber} 썸네일 생성 실패:`, error);
    }
  }, [pdfDoc, generateThumbnail, thumbnails, pageNum]);

  // 썸네일 사이드바가 열릴 때만 썸네일 생성 (조건부 실행)
  useEffect(() => {
    if (THUMBNAIL_ENABLED && showThumbnails && pdfDoc && totalPages > 0) {
      // 현재 페이지 주변의 썸네일만 먼저 생성
      const startPage = Math.max(1, pageNum - 2);
      const endPage = Math.min(totalPages, pageNum + 2);
      
      for (let i = startPage; i <= endPage; i++) {
        generateThumbnailIfNeeded(i);
      }
    }
  }, [THUMBNAIL_ENABLED, showThumbnails, pdfDoc, totalPages, pageNum, generateThumbnailIfNeeded]);

  // 페이지 변경 핸들러
  const handleThumbnailClick = useCallback((pageNumber) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  }, [onPageChange]);

  // 마우스/터치 위치 계산
  const getEventPos = useCallback((e) => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // 그리기 시작
  const startDrawing = useCallback((e) => {
    if (selectedTool === 'hand') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getEventPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    setCurrentPath([pos]);
  }, [selectedTool, getEventPos]);

  // 그리기 중 (안정적인 실시간 그리기)
  const draw = useCallback((e) => {
    if (!isDrawing || selectedTool === 'hand') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getEventPos(e);
    setLastPos(pos);
    setCurrentPath(prev => [...prev, pos]);
    
    // 실시간 그리기 (안정적인 렌더링)
    const canvas = markupCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      
      // 그리기 설정을 한 번만 설정
      context.save();
      context.beginPath();
      context.lineWidth = brushSize;
      context.strokeStyle = selectedColor;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.globalCompositeOperation = 'source-over';
      
      context.moveTo(lastPos.x, lastPos.y);
      context.lineTo(pos.x, pos.y);
      context.stroke();
      context.restore();
    }
  }, [isDrawing, selectedTool, getEventPos, lastPos, brushSize, selectedColor]);

  // 그리기 종료 (성능 최적화)
  const stopDrawing = useCallback((e) => {
    if (selectedTool === 'hand') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (isDrawing && currentPath.length > 1) {
      const newDrawing = {
        id: Date.now(),
        type: 'stroke',
        tool: selectedTool,
        color: selectedColor,
        brushSize: brushSize,
        points: currentPath,
        timestamp: new Date().toISOString(),
        isRecording: isRecording
      };
      
      setSavedDrawings(prev => {
        const updatedDrawings = [...prev, newDrawing];
        // 부모 컴포넌트에 스트로크 데이터 전달
        if (onStrokeDataChange) {
          onStrokeDataChange(updatedDrawings);
        }
        return updatedDrawings;
      });
      
      // 그리기 완료 후 마크업 다시 그리기 제거 (성능 최적화)
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, selectedTool, selectedColor, brushSize, isRecording, onStrokeDataChange, redrawMarkups]);

  return (
    <div style={{ display: 'flex', height: '100%', gap: '1rem' }}>
      {/* 썸네일 사이드바 (조건부 렌더링) */}
      {THUMBNAIL_ENABLED && (
        <div style={{
          width: showThumbnails ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
        {showThumbnails && (
          <div style={{
            padding: '1rem',
            height: '100%',
            overflow: 'auto'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              📄 페이지 미리보기
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const thumbnail = thumbnails[pageNumber];
                
                return (
                  <div
                    key={pageNumber}
                    onClick={() => handleThumbnailClick(pageNumber)}
                    style={{
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: pageNumber === pageNum ? '2px solid #3b82f6' : '2px solid transparent',
                      backgroundColor: pageNumber === pageNum ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (pageNumber !== pageNum) {
                        e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pageNumber !== pageNum) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = 'transparent';
                      }
                    }}
                    onMouseEnter={() => {
                      // 마우스 오버 시 썸네일 생성
                      generateThumbnailIfNeeded(pageNumber);
                    }}
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`페이지 ${pageNumber}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '80px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '0.75rem'
                      }}>
                        로딩 중...
                      </div>
                    )}
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      페이지 {pageNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      )}

      {/* 메인 PDF 뷰어 */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          padding: '1rem',
          position: 'relative'
        }}
      >
        {pageRendering && (
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
            <span style={{ color: '#6b7280', fontSize: '1rem' }}>PDF 로딩 중...</span>
          </div>
        )}
        
        <div style={{
          display: pageRendering ? 'none' : 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          minHeight: '100%'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
                display: 'block',
                // 번쩍거림 방지를 위한 최적화
                willChange: 'auto',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            />
            <canvas
              ref={markupCanvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: selectedTool === 'hand' ? 'grab' : 'crosshair',
                borderRadius: '8px',
                pointerEvents: 'auto',
                // 번쩍거림 방지를 위한 최적화
                willChange: 'auto',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>
      </div>
      
      {/* 페이지 네비게이션 버튼 */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        {/* 페이지 번호 표시 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-ui)'
        }}>
          {pageNum} / {totalPages}
        </div>
        
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange && pageNum > 1 && onPageChange(pageNum - 1)}
          disabled={pageNum <= 1}
          style={{
            background: pageNum <= 1 ? 'rgba(156, 163, 175, 0.5)' : 'rgba(59, 130, 246, 0.9)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'white',
            cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (pageNum > 1) {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 1)';
              e.target.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (pageNum > 1) {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
          </svg>
        </button>
        
        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange && pageNum < totalPages && onPageChange(pageNum + 1)}
          disabled={pageNum >= totalPages}
          style={{
            background: pageNum >= totalPages ? 'rgba(156, 163, 175, 0.5)' : 'rgba(59, 130, 246, 0.9)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'white',
            cursor: pageNum >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (pageNum < totalPages) {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 1)';
              e.target.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (pageNum < totalPages) {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
          </svg>
        </button>
      </div>
      
      {/* 썸네일 토글 버튼 (조건부 렌더링) */}
      {THUMBNAIL_ENABLED && (
        <button
          onClick={() => setShowThumbnails(!showThumbnails)}
          style={{
            position: 'absolute',
            top: '1rem',
            left: showThumbnails ? '220px' : '1rem',
            zIndex: 10,
            background: 'rgba(59, 130, 246, 0.9)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default StaticPDFViewer;