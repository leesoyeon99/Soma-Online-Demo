import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle, memo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Base64 } from 'js-base64';

// PDF.js worker 설정 - CDN 사용 (API 버전과 일치)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';

const StaticPDFViewerComponent = forwardRef(({
  pdfFileName = 'somapremier.pdf',
  pageNum = 1,
  zoomScale = 1.0,
  selectedTool = 'pen',
  selectedColor = '#ef4444',
  brushSize = 3,
  onStrokeDataChange,
  isRecording = false,
  isReplaying = false,
  studentStrokeData = null,
  teacherFeedbackData = null,
  showTeacherFeedback = false,
  isTeacherMode = false,
  isStudentMode = false,
  onPageCountChange,
  onPageChange,
  feedbackTexts = []
}, ref) => {
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
  const isReplayingRef = useRef(false); // 재생 상태를 ref로 관리 (재렌더링 방지)
  
  // PDF 페이지 제한 제거 - 전체 페이지 표시
  // const MAX_PAGES = 5; // 최대 5페이지만 표시
  // 썸네일 기능 임시 비활성화 (성능 최적화)
  const [thumbnails, setThumbnails] = useState({});
  const [showThumbnails, setShowThumbnails] = useState(false);
  const THUMBNAIL_ENABLED = false; // 썸네일 기능 활성화/비활성화 플래그
  
  // 오디오 재생 관련 상태
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  const [strokeStartTime, setStrokeStartTime] = useState(null); // 스트로크 시작 시간

  // 지우개 커서 상태
  const [eraserCursor, setEraserCursor] = useState({ x: 0, y: 0, show: false });

  // 동영상 모달 상태
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // isReplaying 동기화 (재렌더링 방지용 ref)
  useEffect(() => {
    isReplayingRef.current = isReplaying;
  }, [isReplaying]);

  // ref를 통해 캔버스에 접근할 수 있도록 함 (AIChatbot용)
  useImperativeHandle(ref, () => ({
    canvasRef,
    markupCanvasRef,
    currentPageNum: pageNum,
    pdfFileName
  }), [pageNum, pdfFileName]);

  // PDF 문서 로드 (정적 경로 사용)
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setPageRendering(true);
        console.log('PDF 로딩 시작:', pdfFileName);
        
        // 정적 경로로 PDF 로드 (PUBLIC_URL 포함)
        const pdfUrl = `${process.env.PUBLIC_URL || ''}${pdfFileName}`;
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

  // 스트로크 그리기 (상대 좌표 → 절대 좌표 변환) - useCallback으로 메모이제이션
  const drawStroke = useCallback((context, drawing) => {
    if (drawing.points.length < 2) return;

    const canvas = context.canvas;
    const currentCanvasWidth = canvas.width;
    const currentCanvasHeight = canvas.height;

    // 상대 좌표(0~1)를 현재 캔버스 크기에 맞게 절대 좌표로 변환
    // points[i].x가 1보다 크면 이미 절대 좌표 (하위 호환성)
    const denormalizedPoints = drawing.points.map(point => {
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

    context.save();

    if (drawing.tool === 'eraser') {
      // 지우개 스트로크는 destination-out 모드로 그리기
      context.globalCompositeOperation = 'destination-out';
      context.lineCap = 'round';
      context.lineJoin = 'round';

      // 각 점마다 원형으로 지우기
      const eraserSize = drawing.brushSize * 10 || 30;
      for (let i = 0; i < denormalizedPoints.length; i++) {
        context.beginPath();
        context.arc(denormalizedPoints[i].x, denormalizedPoints[i].y, eraserSize, 0, 2 * Math.PI);
        context.fill();
      }
    } else {
      // 펜 스트로크
      context.lineWidth = drawing.brushSize || 3;
      context.strokeStyle = drawing.color || '#ef4444';
      context.lineCap = 'round';
      context.lineJoin = 'round';

      context.beginPath();
      context.moveTo(denormalizedPoints[0].x, denormalizedPoints[0].y);
      for (let i = 1; i < denormalizedPoints.length; i++) {
        context.lineTo(denormalizedPoints[i].x, denormalizedPoints[i].y);
      }
      context.stroke();
    }

    context.restore();
  }, []); // 의존성 없음 - 모든 데이터를 파라미터로 받음

  // 마크업 다시 그리기 (성능 최적화) - useCallback으로 메모이제이션
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

    // 첨삭 텍스트 그리기 (손글씨 스타일)
    if (feedbackTexts && feedbackTexts.length > 0 && isTeacherMode) {
      feedbackTexts.forEach((feedback, index) => {
        context.save();

        // 손글씨 스타일 폰트 설정
        context.font = '18px "Comic Sans MS", cursive, "Malgun Gothic", sans-serif';
        context.fillStyle = feedback.color || '#ef4444';
        context.strokeStyle = feedback.color || '#ef4444';
        context.lineWidth = 1;
        context.textAlign = 'start';
        context.textBaseline = 'middle';

        // 텍스트에 약간의 회전 효과 (손글씨처럼)
        const rotation = (Math.sin(index * 0.5) * 0.05); // -0.05 ~ 0.05 라디안
        context.translate(feedback.x * zoomScale, feedback.y * zoomScale);
        context.rotate(rotation);

        // 텍스트 배경 (말풍선 효과)
        const textWidth = context.measureText(feedback.text).width;
        const padding = 8;
        const bgHeight = 25;

        // 말풍선 배경 그리기 (호환성을 위해 직사각형 사용)
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.strokeStyle = feedback.color || '#ef4444';
        context.lineWidth = 2;
        context.fillRect(-padding, -bgHeight/2, textWidth + padding*2, bgHeight);
        context.strokeRect(-padding, -bgHeight/2, textWidth + padding*2, bgHeight);

        // 텍스트 그리기
        context.fillStyle = feedback.color || '#ef4444';
        context.fillText(feedback.text, 0, 0);

        context.restore();
      });
    }
  }, [pageNum, isTeacherMode, studentStrokeData, isStudentMode, teacherFeedbackData, showTeacherFeedback, feedbackTexts, zoomScale, drawStroke]);
  // savedDrawings는 의존성에서 제외하고 내부에서 직접 참조

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
        
        context.restore();
      });
    };
    
    window.addEventListener('addGradingMarks', handleAddGradingMarks);
    return () => window.removeEventListener('addGradingMarks', handleAddGradingMarks);
  }, []);


  // 안전한 렌더링 작업 취소 (개선 버전)
  const cancelCurrentRenderTask = useCallback(async () => {
    const currentTask = renderTaskRef.current;
    if (!currentTask) {
      return; // 취소할 작업이 없으면 즉시 반환
    }

    try {
      await currentTask.cancel();
      console.log('✅ 렌더링 작업 취소 완료');
    } catch (error) {
      if (error.name !== 'RenderingCancelledException') {
        console.log('렌더링 작업 취소 중 오류:', error);
      }
    } finally {
      renderTaskRef.current = null;
      setIsRendering(false);
      setRenderTask(null);
    }

    // 취소 완료까지 대기
    await new Promise(resolve => setTimeout(resolve, 50));
  }, []);

  // 페이지 렌더링 (완전히 개선된 버전 - 동시 렌더링 방지)
  const renderPage = useCallback(async (page, canvas, scale) => {
    // 재생 중이면 렌더링 차단
    if (isReplayingRef.current) {
      console.log('⏸️ 재생 중이므로 PDF 렌더링 차단');
      return null;
    }

    console.log('🔄 페이지 렌더링 시작:', { pageNum: page.pageNumber, scale });

    // 이전 작업이 있으면 완전히 취소될 때까지 대기
    if (renderTaskRef.current) {
      console.log('⏳ 이전 렌더링 작업 취소 대기 중...');
      await cancelCurrentRenderTask();
    }

    try {
      // 캔버스 초기화
      const context = canvas.getContext('2d', { alpha: false }); // alpha 채널 비활성화로 성능 향상

      // 뷰포트 설정 (회전 체크)
      const viewport = page.getViewport({ scale, rotation: 0 }); // 항상 회전 없이 표시

      // 캔버스 크기 설정 전 초기화
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 캔버스 초기화
      context.clearRect(0, 0, canvas.width, canvas.height);

      console.log('📐 캔버스 크기 설정:', {
        width: canvas.width,
        height: canvas.height,
        rotation: viewport.rotation
      });

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        intent: 'display' // 화면 표시용으로 명시
      };

      // 새로운 렌더링 작업
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
        console.log('⏹️ 렌더링이 취소됨');
        return null;
      }
      console.error('❌ 페이지 렌더링 오류:', error);
      throw error;
    } finally {
      renderTaskRef.current = null;
      setIsRendering(false);
      setRenderTask(null);
    }
  }, [cancelCurrentRenderTask]);

  // 페이지 변경 시 렌더링 (완전히 최적화된 버전)
  useEffect(() => {
    // 재생 중이면 페이지 렌더링 완전 차단
    if (isReplayingRef.current) {
      console.log('⏸️ 재생 중이므로 페이지 렌더링 완전 차단');
      return;
    }

    const validPageNum = typeof pageNum === 'number' ? pageNum : parseInt(pageNum, 10);

    if (!pdfDoc || isNaN(validPageNum) || validPageNum <= 0 || validPageNum > totalPages) {
      if (!isNaN(validPageNum) && validPageNum > totalPages && totalPages > 0) {
        console.warn(`⚠️ 페이지 ${validPageNum}은 전체 페이지 수(${totalPages}페이지)를 벗어남`);
        if (onPageChange) {
          onPageChange(1);
        }
      }
      return;
    }

    console.log('🚀 페이지 렌더링 시작, 페이지:', validPageNum);
    setPageRendering(true);

    // 현재 페이지의 필기 데이터 로드
    const pageDrawings = savedDrawings[validPageNum] || [];
    setCurrentPageDrawings(pageDrawings);

    // 렌더링 작업을 순차적으로 처리
    const renderCurrentPage = async () => {
      try {
        const page = await pdfDoc.getPage(validPageNum);
        const canvas = canvasRef.current;
        const markupCanvas = markupCanvasRef.current;

        if (!canvas || !markupCanvas) {
          console.warn('⚠️ 캔버스가 준비되지 않음');
          return;
        }

        const scale = zoomScale || 1.0;

        // PDF 렌더링 (재생 중이면 null 반환)
        const result = await renderPage(page, canvas, scale);

        if (!result) {
          // 렌더링이 취소되었거나 재생 중
          return;
        }

        // 마크업 캔버스 크기 조정 (PDF 캔버스와 완전히 동기화)
        if (markupCanvas.width !== canvas.width || markupCanvas.height !== canvas.height) {
          markupCanvas.width = canvas.width;
          markupCanvas.height = canvas.height;
          console.log('📐 마크업 캔버스 크기 동기화:', { width: canvas.width, height: canvas.height });
        }

        // 마크업 다시 그리기 (재생 중이 아닐 때만)
        if (!isReplayingRef.current) {
          requestAnimationFrame(() => {
            const context = markupCanvas.getContext('2d');
            context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);

            const pageDrawings = savedDrawings[validPageNum] || [];
            pageDrawings.forEach(drawing => {
              drawStroke(context, drawing);
            });

            // 스크롤 위치 복원
            const container = containerRef.current;
            if (container && scrollPositionRef.current) {
              container.scrollLeft = scrollPositionRef.current.x;
              container.scrollTop = scrollPositionRef.current.y;
            }
          });
        }
      } catch (error) {
        if (error?.name !== 'RenderingCancelledException') {
          console.error('❌ 페이지 렌더링 오류:', error);
        }
      } finally {
        setPageRendering(false);
      }
    };

    renderCurrentPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNum, zoomScale, totalPages, onPageChange, renderPage, drawStroke]);
  // savedDrawings는 의존성에서 제외 (렌더링 내부에서 최신값 참조)

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

  // 실제 그리기 함수 (draw에서 drawOnCanvas로 분리) - 먼저 선언
  const drawOnCanvas = useCallback((e) => {
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

    // 실시간 그리기 (안정적인 렌더링)
    const canvas = markupCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');

    if (selectedTool === 'eraser') {
      // 픽셀 기반 지우개 - 실제 지우개처럼 동작
      context.save();
      context.globalCompositeOperation = 'destination-out'; // 지우기 모드
      context.beginPath();
      context.arc(pos.x, pos.y, brushSize * 10, 0, 2 * Math.PI); // 원형 지우개
      context.fill();
      context.restore();

      // 지우개 경로도 저장 (나중에 다시 그릴 때 사용)
      setCurrentPath(prev => [...prev, pos]);

      // 지우개 사용 중이면 여기서 종료 (펜 그리기 방지)
      return;
    }

    if (selectedTool === 'pen' || selectedTool === 'highlighter') {
      // currentPath의 마지막 점을 함수형 업데이트로 가져오기
      setCurrentPath(prev => {
        context.save();
        context.beginPath();
        context.lineWidth = brushSize;
        context.strokeStyle = selectedColor;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        if (selectedTool === 'highlighter') {
          context.globalAlpha = 0.3; // 하이라이터는 반투명
        } else {
          context.globalAlpha = 1;
        }
        context.globalCompositeOperation = 'source-over';

        if (prev.length > 0) {
          const lastPoint = prev[prev.length - 1];
          context.moveTo(lastPoint.x, lastPoint.y);
          context.lineTo(pos.x, pos.y);
          context.stroke();
        }

        context.restore();
        return [...prev, pos];
      });

      return; // 여기서 리턴
    }

    // 다른 도구는 경로만 저장
    setCurrentPath(prev => [...prev, pos]);
  }, [isDrawing, selectedTool, getEventPos, brushSize, selectedColor]);

  // 그리기 시작
  const startDrawing = useCallback((e) => {
    if (selectedTool === 'hand') return;

    e.preventDefault();
    e.stopPropagation();

    const pos = getEventPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    setCurrentPath([pos]);

    // 녹음 중이라면 현재 시간 기록 (스트로크 시작 시간)
    if (isRecording) {
      const startTime = Date.now();
      setStrokeStartTime(startTime);
      console.log('🎨 스트로크 시작 (녹음 중), 시작 시간:', startTime);
    }
  }, [selectedTool, getEventPos, isRecording]);

  // 마우스 이동 감지 (지우개 커서용)
  const handleMouseMove = useCallback((e) => {
    const pos = getEventPos(e);

    // 지우개 모드일 때 커서 위치 업데이트
    if (selectedTool === 'eraser') {
      setEraserCursor({ x: pos.x, y: pos.y, show: true });
    } else {
      setEraserCursor(prev => ({ ...prev, show: false }));
    }

    // 그리기 중이면 draw 로직 실행
    if (isDrawing) {
      drawOnCanvas(e);
    }
  }, [selectedTool, isDrawing, getEventPos]); // drawOnCanvas 제거!

  // 그리기 종료 (성능 최적화)
  const stopDrawing = useCallback((e) => {
    if (selectedTool === 'hand') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 펜과 지우개 모두 저장 (지우개도 스트로크로 저장)
    if (isDrawing && currentPath.length > 1) {
      const canvas = markupCanvasRef.current;
      const canvasWidth = canvas?.width || 1;
      const canvasHeight = canvas?.height || 1;
      
      // 절대 좌표를 상대 좌표(0~1)로 변환하여 저장
      const normalizedPoints = currentPath.map(point => ({
        x: point.x / canvasWidth,
        y: point.y / canvasHeight
      }));
      
      const newDrawing = {
        id: Date.now(),
        type: 'stroke',
        tool: selectedTool, // 'pen' 또는 'eraser'
        color: selectedColor,
        brushSize: brushSize,
        points: normalizedPoints, // 상대 좌표로 저장
        canvasWidth: canvasWidth, // 원본 캔버스 크기도 저장 (디버깅용)
        canvasHeight: canvasHeight,
        timestamp: strokeStartTime, // 스트로크 시작 시간 (밀리초)
        isRecording: isRecording,
        student_mem_seq:Base64.decode(window.sessionStorage.getItem("noma@mem_seq")),
      };
      
      console.log('✏️ 스트로크 저장됨:', {
        id: newDrawing.id,
        tool: newDrawing.tool,
        isRecording: newDrawing.isRecording,
        strokeStartTime: strokeStartTime,
        pointsLength: newDrawing.points.length
      });
      
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
    setStrokeStartTime(null); // 스트로크 시작 시간 초기화
  }, [isDrawing, currentPath, selectedTool, selectedColor, brushSize, isRecording, onStrokeDataChange, pageNum, isTeacherMode, pdfFileName, strokeStartTime]);

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
                cursor: selectedTool === 'hand' ? 'grab' : selectedTool === 'eraser' ? 'crosshair' : 'crosshair',
                borderRadius: '8px',
                pointerEvents: 'auto', // 항상 이벤트 받기 (내부에서 hand 체크)
                touchAction: selectedTool === 'hand' ? 'auto' : 'none', // 펜/지우개 모드에서 스크롤 방지
                // 번쩍거림 방지를 위한 최적화
                willChange: 'auto',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={(e) => {
                stopDrawing(e);
                setEraserCursor(prev => ({ ...prev, show: false }));
              }}
              onTouchStart={startDrawing}
              onTouchMove={handleMouseMove}
              onTouchEnd={stopDrawing}
            />
            
            {/* 지우개 영역 표시 */}
            {eraserCursor.show && selectedTool === 'eraser' && (
              <div
                style={{
                  position: 'absolute',
                  left: eraserCursor.x - brushSize * 2,
                  top: eraserCursor.y - brushSize * 2,
                  width: brushSize * 4,
                  height: brushSize * 4,
                  border: '2px dashed #ff6b6b',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              />
            )}
            
            {/* 동영상 버튼 - 2페이지에만 표시 */}
            {/* {pageNum === 2 && ( */}
            {pageNum === 2 && pdfFileName === '/assets/pdf/2023-프리미어 초급2-내지_DEMO_compressed.pdf' && (
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
            {/* {pageNum === 2 && ( */}
            {pageNum === 2 && pdfFileName === '/assets/pdf/2023-프리미어 초급2-내지_DEMO_compressed.pdf' && (
              <>
                {/* 숨겨진 오디오 엘리먼트 */}
                <audio
                  ref={audioRef}
                  // src="/assets/audio/소마온라인_TTS_최종.wav"
                  src={`${process.env.PUBLIC_URL}/assets/audio/소마온라인_TTS_최종.wav`}
                  onEnded={() => setIsAudioPlaying(false)}
                  onPause={() => setIsAudioPlaying(false)}
                  onPlay={() => setIsAudioPlaying(true)}
                />
                
                {/* 헤드셋 재생/일시정지 버튼 */}
                <button
                  onClick={() => {
                    if (!audioRef.current) return;
                    
                    if (isAudioPlaying) {
                      // 재생 중이면 일시정지
                      audioRef.current.pause();
                    } else {
                      // 일시정지 중이면 재생
                      audioRef.current.play().catch(error => {
                        console.error('오디오 재생 오류:', error);
                        alert('오디오 파일을 찾을 수 없습니다. 경로를 확인해주세요.');
                      });
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '17%',
                    left: '45%',
                    background: isAudioPlaying 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                      : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isAudioPlaying
                      ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                      : '0 4px 16px rgba(249, 115, 22, 0.4)',
                    transition: 'all 0.3s ease',
                    zIndex: 10,
                    pointerEvents: 'auto',
                    opacity: 0.9
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = isAudioPlaying
                      ? '0 6px 24px rgba(239, 68, 68, 0.6)'
                      : '0 6px 24px rgba(249, 115, 22, 0.6)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = isAudioPlaying
                      ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                      : '0 4px 16px rgba(249, 115, 22, 0.4)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  title={isAudioPlaying ? '일시정지' : '재생'}
                >
                  {isAudioPlaying ? (
                    // 일시정지 아이콘
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    // 헤드셋 아이콘
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                    </svg>
                  )}
                </button>
              </>
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
});

// React.memo 제거 - 상태 관리를 위해 정상 재렌더링 필요
const StaticPDFViewer = StaticPDFViewerComponent;

export default StaticPDFViewer;