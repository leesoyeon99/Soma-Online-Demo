import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const canvasKeyRef = useRef(0);
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState({}); // 페이지별 필기 데이터 저장
  const [currentPageDrawings, setCurrentPageDrawings] = useState([]); // 현재 페이지의 필기
  const [totalPages, setTotalPages] = useState(0);
  const [renderTask, setRenderTask] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTaskRef = useRef(null);
  const scrollPositionRef = useRef({ x: 0, y: 0 }); // 스크롤 위치 저장
  
  // PDF 페이지 제한 제거 - 전체 페이지 표시
  // const MAX_PAGES = 5; // 최대 5페이지만 표시
  // 썸네일 기능 임시 비활성화 (성능 최적화)
  const [thumbnails, setThumbnails] = useState({});
  const [showThumbnails, setShowThumbnails] = useState(false);
  const THUMBNAIL_ENABLED = false; // 썸네일 기능 활성화/비활성화 플래그
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  
  // 동영상 모달 상태
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // PDF 문서 로드 (정적 경로 사용)
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setPageRendering(true);
        console.log('PDF 로딩 시작:', pdfFileName);
        
        // 정적 경로로 PDF 로드 (PUBLIC_URL 포함)
        const pdfUrl = `${process.env.PUBLIC_URL}/${pdfFileName}`;
        console.log('PDF URL:', pdfUrl);
        console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
        console.log('pdfFileName:', pdfFileName);
        
        // PDF.js로 직접 로드 (최적화된 방식)
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.149/cmaps/',
          cMapPacked: true,
          verbosity: 0,
          disableAutoFetch: false,
          disableStream: false,
          // 성능 최적화 옵션
          maxImageSize: 1024 * 1024, // 1MB로 이미지 크기 제한
          isEvalSupported: false, // eval 사용 비활성화
          useSystemFonts: true // 시스템 폰트 사용
        });
        
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        // 전체 페이지 수 표시
        setTotalPages(pdf.numPages);
        if (onPageCountChange) {
          onPageCountChange(pdf.numPages);
        }
        
        // 강사 모드에서 저장된 첨삭 데이터 로드
        if (isTeacherMode) {
          const savedTeacherFeedback = localStorage.getItem(`teacherFeedback_${pdfFileName}`);
          if (savedTeacherFeedback) {
            try {
              const feedbackData = JSON.parse(savedTeacherFeedback);
              setSavedDrawings(feedbackData);
              console.log('저장된 강사 첨삭 데이터 로드됨:', feedbackData);
            } catch (error) {
              console.error('강사 첨삭 데이터 로드 실패:', error);
            }
          }
        }
        
        console.log(`PDF 로드 완료: 전체 ${pdf.numPages}페이지 표시`);
        
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
  }, [pdfFileName, onPageCountChange, isTeacherMode]);

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
    
    // 현재 페이지의 필기 데이터 그리기
    const pageDrawings = savedDrawings[pageNum] || [];
    pageDrawings.forEach(drawing => {
      drawStroke(context, drawing);
    });
  }, [savedDrawings, pageNum, isTeacherMode, studentStrokeData, isStudentMode, teacherFeedbackData, showTeacherFeedback]);

  // 전체 삭제 이벤트 리스너
  useEffect(() => {
    const handleClearAll = () => {
      setSavedDrawings({});
      setCurrentPageDrawings([]);
      if (onStrokeDataChange) {
        onStrokeDataChange([]);
      }
      
      // 강사 모드에서 로컬 스토리지도 삭제
      if (isTeacherMode) {
        localStorage.removeItem(`teacherFeedback_${pdfFileName}`);
      }
      
      // 캔버스 다시 그리기
      redrawMarkups();
    };
    
    window.addEventListener('clearAllDrawings', handleClearAll);
    return () => window.removeEventListener('clearAllDrawings', handleClearAll);
  }, [onStrokeDataChange, isTeacherMode, pdfFileName, redrawMarkups]);

  // 채점 표시 이벤트 리스너
  useEffect(() => {
    const handleAddGradingMarks = (event) => {
      const { marks } = event.detail;
      
      // 각 표시를 빨간펜으로 그리기
      marks.forEach((mark, index) => {
        const canvas = markupCanvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        context.save();
        
        if (mark.type === 'correct') {
          // O 그리기 (초록색)
          context.strokeStyle = '#10b981';
          context.fillStyle = 'rgba(16, 185, 129, 0.1)';
          context.lineWidth = 4;
          context.beginPath();
          context.arc(mark.x, mark.y, 20, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
          
          // 체크마크 그리기
          context.strokeStyle = '#10b981';
          context.lineWidth = 3;
          context.lineCap = 'round';
          context.beginPath();
          context.moveTo(mark.x - 8, mark.y);
          context.lineTo(mark.x - 2, mark.y + 6);
          context.lineTo(mark.x + 8, mark.y - 6);
          context.stroke();
        } else {
          // X 그리기 (빨간색)
          context.strokeStyle = '#ef4444';
          context.fillStyle = 'rgba(239, 68, 68, 0.1)';
          context.lineWidth = 4;
          context.beginPath();
          context.arc(mark.x, mark.y, 20, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
          
          // X 표시 그리기
          context.strokeStyle = '#ef4444';
          context.lineWidth = 3;
          context.lineCap = 'round';
          context.beginPath();
          context.moveTo(mark.x - 12, mark.y - 12);
          context.lineTo(mark.x + 12, mark.y + 12);
          context.moveTo(mark.x + 12, mark.y - 12);
          context.lineTo(mark.x - 12, mark.y + 12);
          context.stroke();
        }
        
        // 점수 표시 (선택사항)
        context.fillStyle = mark.type === 'correct' ? '#10b981' : '#ef4444';
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(`${mark.score}/${mark.maxScore}`, mark.x, mark.y + 25);
        
        context.restore();
      });
    };
    
    window.addEventListener('addGradingMarks', handleAddGradingMarks);
    return () => window.removeEventListener('addGradingMarks', handleAddGradingMarks);
  }, []);

  // 캔버스 재생성 (강제 초기화)
  const recreateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const markupCanvas = markupCanvasRef.current;
    
    if (canvas) {
      // 캔버스 완전 초기화
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      
      // 캔버스 키 변경으로 강제 재렌더링
      canvasKeyRef.current += 1;
    }
    
    if (markupCanvas) {
      const markupContext = markupCanvas.getContext('2d');
      markupContext.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
      markupCanvas.width = 0;
      markupCanvas.height = 0;
    }
  }, []);

  // 안전한 렌더링 작업 취소
  const cancelCurrentRenderTask = useCallback(async () => {
    const currentTask = renderTaskRef.current;
    if (currentTask) {
      try {
        currentTask.cancel();
        console.log('현재 렌더링 작업 취소됨');
      } catch (error) {
        console.log('렌더링 작업 취소 중 오류:', error);
      }
      renderTaskRef.current = null;
    }
    
    // 상태 초기화
    setIsRendering(false);
    setRenderTask(null);
    
    // 캔버스 재생성
    recreateCanvas();
    
    // 취소 완료까지 대기
    await new Promise(resolve => setTimeout(resolve, 100));
  }, [recreateCanvas]);

  // 페이지 렌더링 (단순하고 안전한 버전)
  const renderPage = useCallback(async (page, canvas, scale) => {
    console.log('🔄 페이지 렌더링 시작:', { pageNum: page.pageNumber, scale });
    
    // 현재 작업 취소
    const currentTask = renderTaskRef.current;
    if (currentTask) {
      try {
        currentTask.cancel();
        console.log('✅ 이전 렌더링 작업 취소됨');
      } catch (error) {
        console.log('렌더링 작업 취소 중 오류:', error);
      }
      renderTaskRef.current = null;
    }
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // 캔버스 초기화
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      console.log('📐 캔버스 크기 설정:', { width: canvas.width, height: canvas.height });
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      // 새로운 렌더링 작업
      console.log('PDF 렌더링 작업 시작');
      const task = page.render(renderContext);
      renderTaskRef.current = task;
      setRenderTask(task);
      setIsRendering(true);
      
      await task.promise;
      
      console.log('✅ 페이지 렌더링 완료');
      renderTaskRef.current = null;
      setRenderTask(null);
      setIsRendering(false);
      
      return task;
    } catch (error) {
      if (error.name === 'RenderingCancelledException') {
        console.log('렌더링이 취소되었습니다');
        renderTaskRef.current = null;
        setRenderTask(null);
        setIsRendering(false);
        return null;
      }
      console.error('❌ 페이지 렌더링 오류:', error);
      renderTaskRef.current = null;
      setRenderTask(null);
      setIsRendering(false);
      throw error;
    }
  }, []);

  // 페이지 변경 시 렌더링 (단순화된 안전한 렌더링)
  useEffect(() => {
    console.log('페이지 변경 감지:', { pdfDoc: !!pdfDoc, pageNum, totalPages });
    
    if (pdfDoc && pageNum && pageNum <= totalPages) {
      console.log('🚀 페이지 렌더링 시작');
      setPageRendering(true);
      
      // 현재 페이지의 필기 데이터 로드
      const pageDrawings = savedDrawings[pageNum] || [];
      setCurrentPageDrawings(pageDrawings);
      
      // 렌더링 작업을 순차적으로 처리
      const renderCurrentPage = async () => {
        try {
          console.log('📖 PDF 페이지 가져오기:', pageNum);
          const page = await pdfDoc.getPage(pageNum);
          const canvas = canvasRef.current;
          const markupCanvas = markupCanvasRef.current;
          
          console.log('🎯 캔버스 상태:', { 
            canvas: !!canvas, 
            markupCanvas: !!markupCanvas,
            canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null
          });
          
          if (canvas && markupCanvas) {
            const scale = zoomScale || 1.0;
            console.log('렌더링 설정:', { scale });
            
            // PDF 렌더링
            await renderPage(page, canvas, scale);
            
            // 마크업 캔버스 크기 조정
            markupCanvas.height = canvas.height;
            markupCanvas.width = canvas.width;
            console.log('📐 마크업 캔버스 크기 조정 완료');
            
            // 마크업 다시 그리기 (지연 실행으로 성능 최적화)
            setTimeout(() => {
              console.log('마크업 다시 그리기');
              
              // 현재 페이지의 필기 데이터 그리기
              const markupCanvas = markupCanvasRef.current;
              if (markupCanvas) {
                const context = markupCanvas.getContext('2d');
                const pageDrawings = savedDrawings[pageNum] || [];
                pageDrawings.forEach(drawing => {
                  drawStroke(context, drawing);
                });
              }
              
              // 스크롤 위치 복원 (리렌더링 후 위치 유지)
              const container = containerRef.current;
              if (container && scrollPositionRef.current) {
                container.scrollLeft = scrollPositionRef.current.x;
                container.scrollTop = scrollPositionRef.current.y;
              }
            }, 100);
          } else {
            console.warn('캔버스가 준비되지 않음');
          }
        } catch (error) {
          console.error('❌ 페이지 렌더링 오류:', error);
        } finally {
          console.log('✅ 페이지 렌더링 완료');
          setPageRendering(false);
        }
      };
      
      // 렌더링 시작
      renderCurrentPage();
    } else if (pageNum > totalPages) {
      // 페이지 범위를 벗어나면 첫 페이지로 이동
      console.log(`페이지 ${pageNum}은 전체 페이지 수(${totalPages}페이지)를 벗어납니다.`);
      if (onPageChange) {
        onPageChange(1);
      }
    } else {
      console.log('PDF 문서가 로드되지 않음 또는 페이지 번호가 유효하지 않음');
    }
  }, [pdfDoc, pageNum, zoomScale, totalPages, onPageChange, renderPage]);

  // 컴포넌트 언마운트 시 렌더링 작업 정리
  useEffect(() => {
    return () => {
      // 렌더링 작업 취소
      cancelCurrentRenderTask();
    };
  }, [cancelCurrentRenderTask]);

  // 썸네일 생성 함수 (메모리 최적화 + 안전한 렌더링)
  const generateThumbnail = useCallback(async (page, pageNumber) => {
    try {
      const viewport = page.getViewport({ scale: 0.15 }); // 더 작은 스케일로 메모리 절약
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // 최대 크기 제한
      const maxWidth = 150;
      const maxHeight = 200;
      
      let finalViewport = viewport;
      
      if (viewport.width > maxWidth || viewport.height > maxHeight) {
        const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
        finalViewport = page.getViewport({ scale: 0.15 * scale });
      }
      
      canvas.width = finalViewport.width;
      canvas.height = finalViewport.height;
      
      const renderContext = {
        canvasContext: context,
        viewport: finalViewport
      };
      
      // 썸네일용 별도 렌더링 작업
      const thumbnailTask = page.render(renderContext);
      await thumbnailTask.promise;
      
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
      if (error.name === 'RenderingCancelledException') {
        console.log(`썸네일 생성 취소됨 (페이지 ${pageNumber})`);
        return;
      }
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
    
    // 스크롤 위치 저장 (리렌더링 방지)
    const container = containerRef.current;
    if (container) {
      scrollPositionRef.current = {
        x: container.scrollLeft,
        y: container.scrollTop
      };
    }
    
    const pos = getEventPos(e);
    setLastPos(pos);
    setCurrentPath(prev => [...prev, pos]);
    
    // 실시간 그리기 (안정적인 렌더링)
    const canvas = markupCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      
      if (selectedTool === 'eraser') {
        // 지우개 기능 - 스트로크 단위로 지우기
        const currentPageDrawings = savedDrawings[pageNum] || [];
        const threshold = brushSize * 3; // 지우개 크기의 3배 범위 내에서 스트로크 찾기
        
        for (let i = currentPageDrawings.length - 1; i >= 0; i--) {
          const stroke = currentPageDrawings[i];
          if (stroke.points && stroke.points.length > 0) {
            // 스트로크의 각 점들과 마우스 위치 비교
            for (let j = 0; j < stroke.points.length; j++) {
              const point = stroke.points[j];
              const distance = Math.sqrt(
                Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)
              );
              
              if (distance <= threshold) {
                // 해당 스트로크를 삭제
                const updatedPageDrawings = currentPageDrawings.filter((_, index) => index !== i);
                setSavedDrawings(prev => ({
                  ...prev,
                  [pageNum]: updatedPageDrawings
                }));
                
                // 현재 페이지 필기 상태도 업데이트
                setCurrentPageDrawings(updatedPageDrawings);
                
                // 부모 컴포넌트에 전체 스트로크 데이터 전달
                if (onStrokeDataChange) {
                  const allDrawings = Object.values({
                    ...savedDrawings,
                    [pageNum]: updatedPageDrawings
                  }).flat();
                  onStrokeDataChange(allDrawings);
                }
                
                // 강사 모드에서 로컬 스토리지에 자동 저장
                if (isTeacherMode) {
                  const updatedDrawings = {
                    ...savedDrawings,
                    [pageNum]: updatedPageDrawings
                  };
                  localStorage.setItem(`teacherFeedback_${pdfFileName}`, JSON.stringify(updatedDrawings));
                }
                
                // 캔버스 다시 그리기
                redrawMarkups();
                return;
              }
            }
          }
        }
      } else if (selectedTool === 'pen') {
        // 펜 기능
        context.save();
        context.beginPath();
        context.lineWidth = brushSize;
        context.strokeStyle = selectedColor;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
        
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(pos.x, pos.y);
        context.stroke();
        context.restore();
      }
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
      
      // 현재 페이지의 필기 데이터에 추가
      setSavedDrawings(prev => {
        const updatedPageDrawings = {
          ...prev,
          [pageNum]: [...(prev[pageNum] || []), newDrawing]
        };
        
        // 강사 모드에서 로컬 스토리지에 자동 저장
        if (isTeacherMode) {
          localStorage.setItem(`teacherFeedback_${pdfFileName}`, JSON.stringify(updatedPageDrawings));
          console.log('강사 첨삭 데이터 자동 저장됨:', updatedPageDrawings);
        }
        
        // 부모 컴포넌트에 전체 스트로크 데이터 전달 (모든 페이지의 필기)
        if (onStrokeDataChange) {
          const allDrawings = Object.values(updatedPageDrawings).flat();
          onStrokeDataChange(allDrawings);
        }
        
        return updatedPageDrawings;
      });
      
      // 현재 페이지 필기 상태도 업데이트
      setCurrentPageDrawings(prev => [...prev, newDrawing]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, selectedTool, selectedColor, brushSize, isRecording, onStrokeDataChange, pageNum]);

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              페이지 미리보기
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
                      // 마우스 오버 시 썸네일 생성
                      generateThumbnailIfNeeded(pageNumber);
                    }}
                    onMouseLeave={(e) => {
                      if (pageNumber !== pageNum) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = 'transparent';
                      }
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
        {(pageRendering || isRendering) && (
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
            <span style={{ color: '#6b7280', fontSize: '1rem' }}>
              {isRendering ? '페이지 렌더링 중...' : 'PDF 로딩 중...'} 잠시만 기다려주세요
            </span>
            <div style={{ 
              color: '#9ca3af', 
              fontSize: '0.875rem',
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              {isRendering 
                ? '페이지를 안전하게 렌더링하고 있습니다.' 
                : '교재를 불러오는 중입니다. 네트워크 상태에 따라 시간이 걸릴 수 있습니다.'
              }
            </div>
          </div>
        )}
        
        <div style={{
          display: (pageRendering || isRendering) ? 'none' : 'flex',
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
              key={`pdf-canvas-${canvasKeyRef.current}`}
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
              key={`markup-canvas-${canvasKeyRef.current}`}
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
            
            {/* 동영상 버튼 - 2페이지에만 표시 */}
            {pageNum === 2 && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                style={{
                  position: 'absolute',
                  top: '17%',
                  left: '40%',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '56px',
                  height: '56px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4)',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  opacity: 0.9
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 6px 24px rgba(249, 115, 22, 0.6)';
                  e.target.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 16px rgba(249, 115, 22, 0.4)';
                  e.target.style.opacity = '0.9';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            )}

            {/* 음성 버튼 - 2페이지에만 표시 */}
            {pageNum === 2 && (
              <button
                onClick={() => {
                  // 음성 재생 기능 (임시)
                  alert('음성 재생 기능입니다!');
                }}
                style={{
                  position: 'absolute',
                  top: '17%',
                  left: '45%',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '56px',
                  height: '56px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4)',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  opacity: 0.9
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 6px 24px rgba(249, 115, 22, 0.6)';
                  e.target.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 16px rgba(249, 115, 22, 0.4)';
                  e.target.style.opacity = '0.9';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
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
      
      {/* 동영상 모달 */}
      {isVideoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#6b7280',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                e.target.style.color = '#6b7280';
              }}
            >
              ✕
            </button>
            
            {/* 동영상 제목 */}
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              교재 설명 동영상
            </h3>
            
            {/* YouTube 동영상 임베드 */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '0',
              paddingBottom: '56.25%', // 16:9 비율
              marginBottom: '1rem'
            }}>
              <iframe
                src="https://www.youtube.com/embed/Fw9IrzJtgQo?si=bz3hFvmjEkcYKHMg&autoplay=1"
                title="교재 설명 동영상"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* 동영상 설명 */}
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: 0
            }}>
              이 동영상을 통해 교재 내용을 더 자세히 학습할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticPDFViewer;