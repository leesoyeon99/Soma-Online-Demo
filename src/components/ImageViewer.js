import React, { useRef, useEffect, useState, useCallback } from 'react';

const ImageViewer = ({ 
  imageUrl, 
  zoomScale, 
  selectedTool,
  selectedColor,
  brushSize,
  onStrokeDataChange,
  isRecording,
  studentStrokeData,
  studentAudioUrl,
  teacherFeedbackData,
  showTeacherFeedback,
  isTeacherMode,
  isStudentMode
}) => {
  const imageRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);

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

  // 이미지 로드 완료 시 캔버스 크기 조정
  const handleImageLoad = useCallback(() => {
    console.log('이미지 로드 완료:', imageUrl);
    const image = imageRef.current;
    const canvas = markupCanvasRef.current;
    
    if (image && canvas) {
      console.log('이미지 크기:', image.naturalWidth, 'x', image.naturalHeight);
      
      // 캔버스 크기를 이미지의 실제 크기로 설정
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      // 캔버스 스타일 크기는 이미지와 동일하게 설정
      canvas.style.width = `${image.naturalWidth}px`;
      canvas.style.height = `${image.naturalHeight}px`;
      
      redrawMarkups();
      setImageLoaded(true);
      console.log('이미지 뷰어 초기화 완료 - 캔버스 크기:', canvas.width, 'x', canvas.height);
    }
  }, [redrawMarkups, imageUrl]);

  // 줌 변경 시 캔버스 크기 재조정
  useEffect(() => {
    if (imageLoaded) {
      const image = imageRef.current;
      const canvas = markupCanvasRef.current;
      
      if (image && canvas) {
        // 캔버스 크기는 이미지의 실제 크기로 유지
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.style.width = `${image.naturalWidth}px`;
        canvas.style.height = `${image.naturalHeight}px`;
        
        redrawMarkups();
      }
    }
  }, [zoomScale, imageLoaded, redrawMarkups]);

  // 마우스/터치 위치 계산
  const getEventPos = useCallback((e) => {
    const canvas = markupCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return { x: 0, y: 0 };
    
    const canvasRect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 캔버스 기준 좌표 계산 (줌 고려)
    const canvasX = (clientX - canvasRect.left) / zoomScale;
    const canvasY = (clientY - canvasRect.top) / zoomScale;
    
    return {
      x: Math.max(0, Math.min(canvasX, canvas.width)),
      y: Math.max(0, Math.min(canvasY, canvas.height))
    };
  }, [zoomScale]);

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
      {!imageLoaded && !imageError && (
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
          <span style={{ color: '#6b7280', fontSize: '1rem' }}>이미지 로딩 중...</span>
        </div>
      )}
      
      {imageError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>⚠️ 이미지를 불러올 수 없습니다</span>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>이미지 URL을 확인해주세요</span>
        </div>
      )}
      
      <div style={{
        display: imageLoaded ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        minHeight: '100%'
      }}>
        <div style={{
          position: 'relative',
          display: 'inline-block',
          transform: `scale(${zoomScale})`,
          transformOrigin: 'center center'
        }}>
                  <img
          ref={imageRef}
          src={imageUrl}
          alt="교재 이미지"
          onLoad={handleImageLoad}
          onError={(e) => {
            console.error('이미지 로드 실패:', e);
            setImageError(true);
            setImageLoaded(false);
          }}
          onMouseDown={(e) => {
            // 이미지에서 드래그 방지
            if (selectedTool !== 'hand') {
              e.preventDefault();
            }
          }}
          onDragStart={(e) => {
            // 이미지 드래그 방지
            e.preventDefault();
          }}
          style={{
            maxWidth: '800px',
            width: 'auto',
            height: 'auto',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white',
            display: 'block',
            userSelect: 'none',
            pointerEvents: selectedTool === 'hand' ? 'auto' : 'none'
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
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top left'
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

export default ImageViewer;
