import React, { useState } from 'react';

const EnhancedToolbar = ({ 
  selectedTool,
  selectedColor,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange
}) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showBrushSizes, setShowBrushSizes] = useState(false);

  const colors = [
    '#ef4444', // 빨강
    '#3b82f6', // 파랑
    '#22c55e', // 초록
    '#eab308', // 노랑
    '#8b5cf6', // 보라
    '#000000'  // 검정
  ];

  const brushSizes = [1, 3, 5, 8, 12];

  const tools = [
    { 
      id: 'hand', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4z"/>
        </svg>
      ), 
      name: '이동' 
    },
    { 
      id: 'pen', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      ), 
      name: '펜' 
    },
    { 
      id: 'eraser', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.36z"/>
        </svg>
      ), 
      name: '지우개' 
    }
  ];

  return (
    <div style={{
      backgroundColor: '#2d3748',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      justifyContent: 'center'
    }}>
      {/* 도구 버튼들 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            style={{
              backgroundColor: selectedTool === tool.id ? '#3b82f6' : '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '48px',
              minHeight: '48px'
            }}
            onMouseEnter={(e) => {
              if (selectedTool !== tool.id) {
                e.target.style.backgroundColor = '#718096';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== tool.id) {
                e.target.style.backgroundColor = '#4a5568';
              }
            }}
            title={tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* 구분선 */}
      <div style={{
        width: '1px',
        height: '2rem',
        backgroundColor: '#4a5568'
      }}></div>

      {/* 색상 선택 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowColorPalette(!showColorPalette)}
          style={{
            backgroundColor: selectedColor,
            border: '2px solid white',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
          title="색상 선택"
        />
        
        {showColorPalette && (
          <div style={{
            position: 'absolute',
            top: '3rem',
            left: '0',
            backgroundColor: '#1a202c',
            borderRadius: '8px',
            padding: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.25rem',
            zIndex: 1000
          }}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onColorChange(color);
                  setShowColorPalette(false);
                }}
                style={{
                  backgroundColor: color,
                  border: color === selectedColor ? '2px solid #3b82f6' : '1px solid #4a5568',
                  borderRadius: '4px',
                  width: '1.5rem',
                  height: '1.5rem',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 브러시 크기 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowBrushSizes(!showBrushSizes)}
          style={{
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {brushSize}px 
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        
        {showBrushSizes && (
          <div style={{
            position: 'absolute',
            top: '3rem',
            left: '0',
            backgroundColor: '#1a202c',
            borderRadius: '8px',
            padding: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            minWidth: '80px'
          }}>
            {brushSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  onBrushSizeChange(size);
                  setShowBrushSizes(false);
                }}
                style={{
                  backgroundColor: size === brushSize ? '#3b82f6' : 'transparent',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '0.25rem'
                }}
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedToolbar;