import React, { useRef, useEffect, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정 - 로컬 worker 사용
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const EnhancedPDFViewer = React.memo(({ 
  pdfUrl, 
  pageNum, 
  zoomScale, 
  selectedTool,
  selectedColor,
  brushSize,
  onPageCountChange 
}) => {
  const canvasRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const containerRef = useRef(null);
  
  // 더블 버퍼링을 위한 오프스크린 캔버스
  const offscreenCanvasRef = useRef(null);
  const offscreenMarkupCanvasRef = useRef(null);
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState({});
  const [savedTexts, setSavedTexts] = useState({});
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  // 캔버스 크기 고정을 위한 상태
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  
  // Shape drawing state
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPos, setShapeStartPos] = useState({ x: 0, y: 0 });
  
  // Text state
  const [isAddingText, setIsAddingText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  // PDF 문서 로드
  useEffect(() => {
    if (pdfUrl) {
      setPageRendering(true);
      console.log('PDF 로딩 시작:', pdfUrl);
      
      pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.4.168/cmaps/',
        cMapPacked: true,
      }).promise
        .then(pdf => {
          console.log('PDF 로딩 성공:', pdf.numPages, '페이지');
          setPdfDoc(pdf);
          if (onPageCountChange) {
            onPageCountChange(pdf.numPages);
          }
          setPageRendering(false);
        })
        .catch(error => {
          console.error('PDF 로드 오류:', error);
          setPageRendering(false);
          alert('PDF 파일을 불러올 수 없습니다. 파일 경로를 확인해주세요.');
        });
    }
  }, [pdfUrl, onPageCountChange]);

  // 더블 버퍼링을 사용한 페이지 렌더링
  const renderPage = useCallback(async (page, canvas, scale) => {
    const viewport = page.getViewport({ scale });
    
    // 오프스크린 캔버스 생성 또는 업데이트
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenContext = offscreenCanvas.getContext('2d');
    
    // 오프스크린 캔버스 크기 설정
    offscreenCanvas.width = viewport.width;
    offscreenCanvas.height = viewport.height;
    
    // 렌더링 품질 향상
    offscreenContext.imageSmoothingEnabled = true;
    offscreenContext.imageSmoothingQuality = 'high';
    
    const renderContext = {
      canvasContext: offscreenContext,
      viewport: viewport,
      intent: 'display',
      renderInteractiveForms: false,
      enableWebGL: false
    };
    
    // 오프스크린 캔버스에 렌더링
    await page.render(renderContext).promise;
    
    // 메인 캔버스 크기 설정
    if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setCanvasSize({ width: viewport.width, height: viewport.height });
    }
    
    // 오프스크린 캔버스 내용을 메인 캔버스로 복사 (깜빡임 없음)
    const mainContext = canvas.getContext('2d');
    mainContext.clearRect(0, 0, canvas.width, canvas.height);
    mainContext.drawImage(offscreenCanvas, 0, 0);
    
    setIsCanvasReady(true);
  }, []);

  // 더블 버퍼링을 사용한 마크업 다시 그리기
  const redrawMarkups = useCallback((pageNumber, canvas) => {
    const context = canvas.getContext('2d');
    
    // 오프스크린 마크업 캔버스 생성 또는 업데이트
    if (!offscreenMarkupCanvasRef.current) {
      offscreenMarkupCanvasRef.current = document.createElement('canvas');
    }
    
    const offscreenMarkupCanvas = offscreenMarkupCanvasRef.current;
    const offscreenMarkupContext = offscreenMarkupCanvas.getContext('2d');
    
    // 오프스크린 마크업 캔버스 크기 설정
    offscreenMarkupCanvas.width = canvas.width;
    offscreenMarkupCanvas.height = canvas.height;
    
    // 오프스크린 캔버스 초기화
    offscreenMarkupContext.clearRect(0, 0, offscreenMarkupCanvas.width, offscreenMarkupCanvas.height);
    
    const drawings = savedDrawings[pageNumber] || [];
    
    // 오프스크린 캔버스에 그리기
    for (let drawing of drawings) {
      if (drawing.type === 'stroke') {
        drawStroke(offscreenMarkupContext, drawing);
      } else if (drawing.type === 'shape') {
        drawShape(offscreenMarkupContext, drawing);
      }
    }
    
    // 메인 마크업 캔버스에 복사
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(offscreenMarkupCanvas, 0, 0);
  }, [savedDrawings]);

  // 스트로크 그리기
  const drawStroke = (context, drawing) => {
    if (drawing.points.length < 2) return;
    
    context.beginPath();
    context.lineWidth = drawing.brushSize || 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    if (drawing.tool === 'highlighter') {
      context.globalAlpha = 0.3;
      context.globalCompositeOperation = 'multiply';
    } else {
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    }
    
    context.strokeStyle = drawing.color || '#ef4444';
    
    context.moveTo(drawing.points[0].x, drawing.points[0].y);
    for (let i = 1; i < drawing.points.length; i++) {
      context.lineTo(drawing.points[i].x, drawing.points[i].y);
    }
    context.stroke();
    
    // 복원
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  };

  // 도형 그리기
  const drawShape = (context, drawing) => {
    context.beginPath();
    context.lineWidth = drawing.brushSize || 3;
    context.strokeStyle = drawing.color || '#ef4444';
    context.fillStyle = drawing.color || '#ef4444';
    
    const { startX, startY, endX, endY } = drawing;
    const width = endX - startX;
    const height = endY - startY;
    
    switch (drawing.shapeType) {
      case 'rectangle':
        context.strokeRect(startX, startY, width, height);
        break;
      case 'circle':
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        const radius = Math.sqrt(width * width + height * height) / 2;
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();
        break;
      case 'arrow':
        drawArrow(context, startX, startY, endX, endY);
        break;
      case 'line':
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        break;
      default:
        break;
    }
  };

  // 화살표 그리기
  const drawArrow = (context, startX, startY, endX, endY) => {
    const headLength = 15;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    // 화살표 선
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    
    // 화살표 머리
    context.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), 
                   endY - headLength * Math.sin(angle - Math.PI / 6));
    context.moveTo(endX, endY);
    context.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), 
                   endY - headLength * Math.sin(angle + Math.PI / 6));
    context.stroke();
  };

  // 페이지 변경 시 렌더링 - useLayoutEffect로 깜빡임 완전 방지
  useLayoutEffect(() => {
    if (pdfDoc && pageNum) {
      setPageRendering(true);
      setIsCanvasReady(false);
      
      pdfDoc.getPage(pageNum).then(page => {
        const canvas = canvasRef.current;
        const markupCanvas = markupCanvasRef.current;
        
        if (canvas && markupCanvas) {
          const scale = zoomScale || 1.0;
          
          // PDF 캔버스와 마크업 캔버스 완전 분리
          Promise.all([
            renderPage(page, canvas, scale),
            new Promise(resolve => {
              // 마크업 캔버스 크기를 PDF 캔버스와 동일하게 설정
              markupCanvas.height = canvas.height;
              markupCanvas.width = canvas.width;
              
              // 마크업 캔버스 컨텍스트 최적화
              const markupContext = markupCanvas.getContext('2d');
              markupContext.imageSmoothingEnabled = true;
              markupContext.imageSmoothingQuality = 'high';
              
              resolve();
            })
          ]).then(() => {
            // 마크업과 텍스트 다시 그리기
            redrawMarkups(pageNum, markupCanvas);
            redrawTexts(pageNum);
            setPageRendering(false);
          }).catch(error => {
            console.error('캔버스 설정 오류:', error);
            setPageRendering(false);
          });
        }
      }).catch(error => {
        console.error('페이지 렌더링 오류:', error);
        setPageRendering(false);
      });
    }
  }, [pdfDoc, pageNum, zoomScale, renderPage, redrawMarkups]);

  // 텍스트 다시 그리기
  const redrawTexts = (pageNumber) => {
    const texts = savedTexts[pageNumber] || [];
    const textLayer = textLayerRef.current;
    
    if (textLayer) {
      textLayer.innerHTML = '';
      texts.forEach(text => {
        const textElement = document.createElement('div');
        textElement.style.position = 'absolute';
        textElement.style.left = `${text.x}px`;
        textElement.style.top = `${text.y}px`;
        textElement.style.color = text.color;
        textElement.style.fontSize = `${text.fontSize || 16}px`;
        textElement.style.fontFamily = 'Arial, sans-serif';
        textElement.style.pointerEvents = 'none';
        textElement.textContent = text.content;
        textLayer.appendChild(textElement);
      });
    }
  };

  // 마우스/터치 위치 계산 - 최적화된 버전
  const getEventPos = useCallback((e) => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 캔버스 내부 좌표로 변환
    const x = Math.max(0, Math.min(canvas.width, clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, clientY - rect.top));
    
    return { x, y };
  }, []);

  // 그리기/도형 시작
  const startDrawing = useCallback((e) => {
    const pos = getEventPos(e);
    
    if (selectedTool === 'text') {
      setIsAddingText(true);
      setTextPosition(pos);
      return;
    }
    
    if (['pen', 'highlighter', 'eraser'].includes(selectedTool)) {
      e.preventDefault();
      setIsDrawing(true);
      setLastPos(pos);
      setCurrentPath([pos]);
    } else if (['rectangle', 'circle', 'arrow', 'line'].includes(selectedTool)) {
      e.preventDefault();
      setIsDrawingShape(true);
      setShapeStartPos(pos);
    }
  }, [selectedTool, getEventPos]);

  // 그리기/도형 진행 - 최적화된 버전 (throttling 적용)
  const draw = useCallback((e) => {
    const pos = getEventPos(e);
    
    if (isDrawing && ['pen', 'highlighter'].includes(selectedTool)) {
      e.preventDefault();
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
        
        // 컨텍스트 설정 최적화
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
        
        // 부드러운 선 그리기
        context.beginPath();
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(pos.x, pos.y);
        context.stroke();
        
        setCurrentPath(prev => [...prev, pos]);
        setLastPos(pos);
        
        // 컨텍스트 복원
        context.restore();
      }
    } else if (isDrawing && selectedTool === 'eraser') {
      e.preventDefault();
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
        const eraseSize = brushSize * 2;
        
        // 지우개 최적화
        context.save();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(pos.x, pos.y, eraseSize/2, 0, 2 * Math.PI);
        context.fill();
        context.restore();
      }
    } else if (isDrawingShape) {
      e.preventDefault();
      // 실시간 도형 미리보기는 여기에서 구현 가능
    }
  }, [isDrawing, isDrawingShape, selectedTool, getEventPos, lastPos, brushSize, selectedColor]);

  // throttled draw 함수
  const throttledDraw = useCallback((e) => {
    requestAnimationFrame(() => draw(e));
  }, [draw]);

  // 캔버스 스타일 메모이제이션 - 깜빡임 방지
  const canvasContainerStyle = useMemo(() => ({
    position: 'relative',
    display: pageRendering ? 'none' : 'block',
    // 레이아웃 시프트 방지를 위한 최소 크기 설정
    minHeight: canvasSize.height > 0 ? `${canvasSize.height}px` : '600px',
    minWidth: canvasSize.width > 0 ? `${canvasSize.width}px` : '400px',
    // 부드러운 전환을 위한 CSS
    transition: 'opacity 0.2s ease-in-out',
    opacity: isCanvasReady ? 1 : 0.7
  }), [pageRendering, canvasSize, isCanvasReady]);

  const pdfCanvasStyle = useMemo(() => ({
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    display: 'block',
    position: 'relative',
    zIndex: 1,
    // 레이아웃 시프트 방지
    width: '100%',
    height: 'auto',
    maxWidth: '100%',
    // GPU 가속 활성화
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform'
  }), []);

  const markupCanvasStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: selectedTool === 'hand' ? 'grab' : 'crosshair',
    borderRadius: '8px',
    zIndex: 2,
    backgroundColor: 'transparent',
    pointerEvents: selectedTool === 'hand' ? 'none' : 'auto',
    // GPU 가속 활성화
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform'
  }), [selectedTool]);

  // 그리기/도형 종료
  const stopDrawing = useCallback(() => {
    if (isDrawing && currentPath.length > 1) {
      const newDrawing = {
        type: 'stroke',
        tool: selectedTool,
        color: selectedColor,
        brushSize: brushSize,
        points: currentPath
      };
      
      setSavedDrawings(prev => ({
        ...prev,
        [pageNum]: [...(prev[pageNum] || []), newDrawing]
      }));
      
      // Undo stack 업데이트
      setUndoStack(prev => [...prev, { type: 'stroke', pageNum, drawing: newDrawing }]);
      setRedoStack([]);
    }
    
    if (isDrawingShape) {
      // 도형 완성 로직
    }
    
    setIsDrawing(false);
    setIsDrawingShape(false);
    setCurrentPath([]);
  }, [isDrawing, isDrawingShape, currentPath, selectedTool, selectedColor, brushSize, pageNum]);

  // 텍스트 추가
  const addText = () => {
    if (textInput.trim() && isAddingText) {
      const newText = {
        x: textPosition.x,
        y: textPosition.y,
        content: textInput,
        color: selectedColor,
        fontSize: 16
      };
      
      setSavedTexts(prev => ({
        ...prev,
        [pageNum]: [...(prev[pageNum] || []), newText]
      }));
      
      setTextInput('');
      setIsAddingText(false);
      redrawTexts(pageNum);
    }
  };

  // Undo 기능
  const undo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, lastAction]);
      setUndoStack(prev => prev.slice(0, -1));
      
      // 해당 페이지의 마지막 그리기 제거
      if (lastAction.type === 'stroke') {
        setSavedDrawings(prev => ({
          ...prev,
          [lastAction.pageNum]: (prev[lastAction.pageNum] || []).slice(0, -1)
        }));
      }
    }
  };

  // Redo 기능
  const redo = () => {
    if (redoStack.length > 0) {
      const nextAction = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, nextAction]);
      setRedoStack(prev => prev.slice(0, -1));
      
      // 해당 페이지에 그리기 추가
      if (nextAction.type === 'stroke') {
        setSavedDrawings(prev => ({
          ...prev,
          [nextAction.pageNum]: [...(prev[nextAction.pageNum] || []), nextAction.drawing]
        }));
      }
    }
  };

  // 스크롤 이벤트 최적화
  const handleScroll = useCallback((e) => {
    // 스크롤 시 불필요한 리렌더링 방지
    e.preventDefault();
  }, []);

  // 캡쳐 기능 구현
  const captureCanvas = useCallback((canvas, name) => {
    if (!canvas) return null;
    
    try {
      // 캔버스를 이미지로 변환
      const dataURL = canvas.toDataURL('image/png', 1.0);
      return {
        name: name,
        dataURL: dataURL,
        width: canvas.width,
        height: canvas.height
      };
    } catch (error) {
      console.error('캡쳐 오류:', error);
      return null;
    }
  }, []);

  // PDF 페이지와 마크업 레이어 캡쳐
  const capturePageAndMarkup = useCallback(() => {
    const pdfCanvas = canvasRef.current;
    const markupCanvas = markupCanvasRef.current;
    
    const pdfCapture = captureCanvas(pdfCanvas, 'PDF 페이지');
    const markupCapture = captureCanvas(markupCanvas, '필기 레이어');
    
    return {
      pdf: pdfCapture,
      markup: markupCapture,
      timestamp: new Date().toISOString(),
      pageNumber: pageNum
    };
  }, [captureCanvas, pageNum]);

  // 메모리 정리 함수
  const cleanup = useCallback(() => {
    const canvas = canvasRef.current;
    const markupCanvas = markupCanvasRef.current;
    
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (markupCanvas) {
      const markupContext = markupCanvas.getContext('2d');
      markupContext.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
    }
    
    // 오프스크린 캔버스도 정리
    if (offscreenCanvasRef.current) {
      const offscreenContext = offscreenCanvasRef.current.getContext('2d');
      offscreenContext.clearRect(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
    }
    
    if (offscreenMarkupCanvasRef.current) {
      const offscreenMarkupContext = offscreenMarkupCanvasRef.current.getContext('2d');
      offscreenMarkupContext.clearRect(0, 0, offscreenMarkupCanvasRef.current.width, offscreenMarkupCanvasRef.current.height);
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 외부에서 호출할 수 있도록 함수들을 전달
  useEffect(() => {
    // 전역 함수 등록
    window.pdfViewerActions = {
      undo: undo,
      redo: redo,
      cleanup: cleanup,
      capturePageAndMarkup: capturePageAndMarkup
    };
    
    console.log('PDF 뷰어 액션 함수들이 등록되었습니다:', window.pdfViewerActions);
  }, [undoStack, redoStack, cleanup, capturePageAndMarkup]);

  return (
    <div 
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        padding: '1rem',
        position: 'relative',
        // 스크롤 성능 최적화
        scrollBehavior: 'smooth',
        overscrollBehavior: 'contain',
        // GPU 가속
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'scroll-position'
      }}
      onScroll={handleScroll}
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
          <span style={{ color: '#6b7280', fontSize: '1rem' }}>페이지 로딩 중...</span>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={canvasContainerStyle} className="pdf-canvas-container">
          {/* PDF 캔버스 - 배경 레이어 */}
          <canvas
            ref={canvasRef}
            style={pdfCanvasStyle}
            className="pdf-canvas"
          />
          {/* 마크업 캔버스 - 투명 오버레이 레이어 */}
          <canvas
            ref={markupCanvasRef}
            style={markupCanvasStyle}
            onMouseDown={startDrawing}
            onMouseMove={throttledDraw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={throttledDraw}
            onTouchEnd={stopDrawing}
          />
          {/* 텍스트 레이어 - 최상위 레이어 */}
          <div
            ref={textLayerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              zIndex: 3,
              // GPU 가속 활성화
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          />
        </div>
      </div>
      
      {/* 텍스트 입력 모달 */}
      {isAddingText && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="텍스트를 입력하세요"
            style={{
              width: '300px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              marginBottom: '1rem'
            }}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addText();
              }
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsAddingText(false)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              onClick={addText}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              추가
            </button>
          </div>
        </div>
      )}
      
      {/* CSS 애니메이션 - 깜빡임 방지 */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.4), 0 0 0 4px rgba(251, 191, 36, 0.2);
          }
          50% {
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.6), 0 0 0 8px rgba(251, 191, 36, 0.1);
          }
          100% {
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.4), 0 0 0 4px rgba(251, 191, 36, 0.2);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes smoothTransition {
          from {
            opacity: 0.7;
          }
          to {
            opacity: 1;
          }
        }
        
        /* 깜빡임 방지를 위한 추가 CSS */
        .pdf-canvas-container {
          contain: layout style paint;
          will-change: transform;
        }
        
        .pdf-canvas {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  // props 비교 함수 - 깊은 비교로 불필요한 리렌더링 방지
  return (
    prevProps.pdfUrl === nextProps.pdfUrl &&
    prevProps.pageNum === nextProps.pageNum &&
    prevProps.zoomScale === nextProps.zoomScale &&
    prevProps.selectedTool === nextProps.selectedTool &&
    prevProps.selectedColor === nextProps.selectedColor &&
    prevProps.brushSize === nextProps.brushSize
  );
});

EnhancedPDFViewer.displayName = 'EnhancedPDFViewer';

export default EnhancedPDFViewer;
