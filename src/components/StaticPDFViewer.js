import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker 설정 - 로컬 worker 사용
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
  onPageCountChange 
}) => {
  const canvasRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  
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
        
        // 정적 경로로 PDF 로드
        const pdfUrl = `/${pdfFileName}`;
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        if (onPageCountChange) {
          onPageCountChange(pdf.numPages);
        }
        
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

  // 마크업 다시 그리기
  const redrawMarkups = useCallback(() => {
    const canvas = markupCanvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 학생 필기 그리기 (선생님 모드에서)
    if (isTeacherMode && studentStrokeData) {
      context.globalAlpha = 0.7;
      context.strokeStyle = '#3b82f6';
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      for (let stroke of studentStrokeData) {
        if (stroke.points && stroke.points.length > 1) {
          context.beginPath();
          context.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            context.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    }
    
    // 선생님 첨삭 그리기 (학생 모드에서)
    if (isStudentMode && teacherFeedbackData && showTeacherFeedback) {
      context.globalAlpha = 0.8;
      context.strokeStyle = '#ef4444';
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      for (let stroke of teacherFeedbackData) {
        if (stroke.points && stroke.points.length > 1) {
          context.beginPath();
          context.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            context.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    }
    
    // 현재 그리기 중인 필기
    for (let drawing of savedDrawings) {
      if (drawing.type === 'stroke') {
        drawStroke(context, drawing);
      }
    }
  }, [savedDrawings, isTeacherMode, studentStrokeData, isStudentMode, teacherFeedbackData, showTeacherFeedback]);

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
            redrawMarkups();
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
    if (['pen', 'highlighter', 'eraser'].includes(selectedTool)) {
      e.preventDefault();
      e.stopPropagation();
      setIsDrawing(true);
      const pos = getEventPos(e);
      setLastPos(pos);
      setCurrentPath([pos]);
    }
  }, [selectedTool, getEventPos]);

  // 그리기 진행
  const draw = useCallback((e) => {
    if (!isDrawing) return;
    
    const pos = getEventPos(e);
    const canvas = markupCanvasRef.current;
    
    if (canvas && ['pen', 'highlighter'].includes(selectedTool)) {
      e.preventDefault();
      e.stopPropagation();
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
    } else if (canvas && selectedTool === 'eraser') {
      e.preventDefault();
      e.stopPropagation();
      const context = canvas.getContext('2d');
      const eraseSize = brushSize * 2;
      context.clearRect(pos.x - eraseSize/2, pos.y - eraseSize/2, eraseSize, eraseSize);
    }
  }, [isDrawing, selectedTool, getEventPos, lastPos, brushSize, selectedColor]);

  // 그리기 종료
  const stopDrawing = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
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
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, selectedTool, selectedColor, brushSize, isRecording, onStrokeDataChange]);

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
              display: 'block'
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
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startDrawing(e);
            }}
            onMouseMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
              draw(e);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopDrawing(e);
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopDrawing(e);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startDrawing(e);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
              draw(e);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopDrawing(e);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StaticPDFViewer;
