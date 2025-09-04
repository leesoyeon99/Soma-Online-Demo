import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정 - 로컬 worker 사용
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const EnhancedPDFViewer = ({ 
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
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState({});
  const [savedTexts, setSavedTexts] = useState({});
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
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

  // 페이지 렌더링
  const renderPage = useCallback(async (page, canvas, scale) => {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
  }, []);

  // 마크업 다시 그리기
  const redrawMarkups = useCallback((pageNumber, canvas) => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawings = savedDrawings[pageNumber] || [];
    
    for (let drawing of drawings) {
      if (drawing.type === 'stroke') {
        drawStroke(context, drawing);
      } else if (drawing.type === 'shape') {
        drawShape(context, drawing);
      }
    }
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

  // 페이지 변경 시 렌더링
  useEffect(() => {
    if (pdfDoc && pageNum) {
      setPageRendering(true);
      
      pdfDoc.getPage(pageNum).then(page => {
        const canvas = canvasRef.current;
        const markupCanvas = markupCanvasRef.current;
        
        if (canvas && markupCanvas) {
          const scale = zoomScale || 1.0;
          
          Promise.all([
            renderPage(page, canvas, scale),
            new Promise(resolve => {
              markupCanvas.height = canvas.height;
              markupCanvas.width = canvas.width;
              resolve();
            })
          ]).then(() => {
            redrawMarkups(pageNum, markupCanvas);
            redrawTexts(pageNum);
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

  // 그리기/도형 진행
  const draw = useCallback((e) => {
    const pos = getEventPos(e);
    
    if (isDrawing && ['pen', 'highlighter'].includes(selectedTool)) {
      e.preventDefault();
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
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
        
        // 복원
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
      }
    } else if (isDrawing && selectedTool === 'eraser') {
      e.preventDefault();
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
        const eraseSize = brushSize * 2;
        context.clearRect(pos.x - eraseSize/2, pos.y - eraseSize/2, eraseSize, eraseSize);
      }
    } else if (isDrawingShape) {
      e.preventDefault();
      // 실시간 도형 미리보기는 여기에서 구현 가능
    }
  }, [isDrawing, isDrawingShape, selectedTool, getEventPos, lastPos, brushSize, selectedColor]);

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

  // 외부에서 호출할 수 있도록 함수들을 전달
  useEffect(() => {
    if (window.pdfViewerActions) {
      window.pdfViewerActions.undo = undo;
      window.pdfViewerActions.redo = redo;
    }
  }, [undoStack, redoStack]);

  return (
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
          <span style={{ color: '#6b7280', fontSize: '1rem' }}>페이지 로딩 중...</span>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'relative',
          display: pageRendering ? 'none' : 'block'
        }}>
          <canvas
            ref={canvasRef}
            style={{
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white'
            }}
          />
          <canvas
            ref={markupCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              cursor: selectedTool === 'hand' ? 'grab' : 'crosshair',
              borderRadius: '8px'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div
            ref={textLayerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none'
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
    </div>
  );
};

export default EnhancedPDFViewer;
