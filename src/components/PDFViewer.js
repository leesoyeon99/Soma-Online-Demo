import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정 - 안정적인 CDN 사용
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

const PDFViewer = ({ 
  pdfUrl, 
  pageNum, 
  zoomScale, 
  drawingMode, 
  onPageCountChange 
}) => {
  const canvasRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState({});
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // PDF 문서 로드
  useEffect(() => {
    if (pdfUrl) {
      setPageRendering(true);
      pdfjsLib.getDocument(pdfUrl).promise
        .then(pdf => {
          setPdfDoc(pdf);
          onPageCountChange(pdf.numPages);
          setPageRendering(false);
        })
        .catch(error => {
          console.error('PDF 로드 오류:', error);
          setPageRendering(false);
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
    
    const strokes = savedDrawings[pageNumber] || [];
    
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    
    let isPathStarted = false;
    
    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i];
      if (stroke.type === 'start') {
        if (isPathStarted) {
          context.stroke();
        }
        context.beginPath();
        context.moveTo(stroke.x, stroke.y);
        isPathStarted = true;
      } else if (stroke.type === 'draw') {
        context.lineTo(stroke.x, stroke.y);
      }
    }
    
    if (isPathStarted) {
      context.stroke();
    }
  }, [savedDrawings]);

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
            setPageRendering(false);
          });
        }
      }).catch(error => {
        console.error('페이지 렌더링 오류:', error);
        setPageRendering(false);
      });
    }
  }, [pdfDoc, pageNum, zoomScale, renderPage, redrawMarkups]);

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
    if (drawingMode === 'pen') {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getEventPos(e);
      setLastPos(pos);
      
      setSavedDrawings(prev => ({
        ...prev,
        [pageNum]: [...(prev[pageNum] || []), { type: 'start', x: pos.x, y: pos.y }]
      }));
    }
  }, [drawingMode, getEventPos, pageNum]);

  // 그리기
  const draw = useCallback((e) => {
    if (!isDrawing || drawingMode !== 'pen') return;
    
    e.preventDefault();
    const pos = getEventPos(e);
    const canvas = markupCanvasRef.current;
    
    if (canvas) {
      const context = canvas.getContext('2d');
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      
      context.beginPath();
      context.moveTo(lastPos.x, lastPos.y);
      context.lineTo(pos.x, pos.y);
      context.stroke();
      
      setSavedDrawings(prev => ({
        ...prev,
        [pageNum]: [...(prev[pageNum] || []), { type: 'draw', x: pos.x, y: pos.y }]
      }));
      
      setLastPos(pos);
    }
  }, [isDrawing, drawingMode, getEventPos, lastPos, pageNum]);

  // 그리기 종료
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // 지우기 (간단한 구현)
  const handleErase = useCallback((e) => {
    if (drawingMode === 'erase') {
      e.preventDefault();
      const pos = getEventPos(e);
      const canvas = markupCanvasRef.current;
      
      if (canvas) {
        const context = canvas.getContext('2d');
        const eraseSize = 20;
        context.clearRect(pos.x - eraseSize/2, pos.y - eraseSize/2, eraseSize, eraseSize);
      }
    }
  }, [drawingMode, getEventPos]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-auto bg-slate-100 rounded-xl shadow-inner p-4"
    >
      {pageRendering && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-600">페이지 로딩 중...</span>
        </div>
      )}
      
      <div className="relative flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-slate-300 shadow-lg bg-white"
            style={{ display: pageRendering ? 'none' : 'block' }}
          />
          <canvas
            ref={markupCanvasRef}
            className="absolute top-0 left-0 cursor-crosshair"
            style={{ display: pageRendering ? 'none' : 'block' }}
            onMouseDown={drawingMode === 'pen' ? startDrawing : handleErase}
            onMouseMove={drawingMode === 'pen' ? draw : (isDrawing ? handleErase : undefined)}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={drawingMode === 'pen' ? startDrawing : handleErase}
            onTouchMove={drawingMode === 'pen' ? draw : (isDrawing ? handleErase : undefined)}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
