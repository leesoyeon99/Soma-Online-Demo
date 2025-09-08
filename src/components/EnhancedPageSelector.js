import React, { useState, useRef, useEffect, useMemo } from 'react';

const EnhancedPageSelector = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pdfDoc,
  style = {} 
}) => {
  const [showPageJump, setShowPageJump] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState({});
  const [showPageNavigator, setShowPageNavigator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const jumpInputRef = useRef(null);

  // 페이지 범위 계산 (현재 페이지 기준으로 앞뒤 10페이지씩)
  const pageRange = useMemo(() => {
    const start = Math.max(1, currentPage - 10);
    const end = Math.min(totalPages, currentPage + 10);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // 페이지 섹션 계산 (20페이지씩 그룹화)
  const pageSections = useMemo(() => {
    const sections = [];
    for (let i = 1; i <= totalPages; i += 20) {
      const end = Math.min(i + 19, totalPages);
      sections.push({
        start: i,
        end: end,
        label: `${i}-${end}`,
        currentPageInSection: currentPage >= i && currentPage <= end
      });
    }
    return sections;
  }, [totalPages, currentPage]);

  // 키보드 단축키 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (currentPage > 1) onPageChange(currentPage - 1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentPage < totalPages) onPageChange(currentPage + 1);
            break;
          case 'g':
            e.preventDefault();
            setShowPageJump(true);
            setTimeout(() => jumpInputRef.current?.focus(), 100);
            break;
          case 't':
            e.preventDefault();
            setShowThumbnails(!showThumbnails);
            break;
          case 'n':
            e.preventDefault();
            setShowPageNavigator(!showPageNavigator);
            break;
          case 'Home':
            e.preventDefault();
            onPageChange(1);
            break;
          case 'End':
            e.preventDefault();
            onPageChange(totalPages);
            break;
        }
      } else if (e.key === 'Escape') {
        setShowPageJump(false);
        setShowThumbnails(false);
        setShowPageNavigator(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onPageChange, showThumbnails, showPageNavigator]);

  // 썸네일 생성
  const generateThumbnail = async (pageNum) => {
    if (thumbnails[pageNum] || !pdfDoc) return;
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.2 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      setThumbnails(prev => ({
        ...prev,
        [pageNum]: canvas.toDataURL()
      }));
    } catch (error) {
      console.error('썸네일 생성 실패:', error);
    }
  };

  // 페이지 점프 처리
  const handlePageJump = () => {
    const pageNum = parseInt(jumpPageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setShowPageJump(false);
      setJumpPageInput('');
    }
  };

  // 썸네일 클릭으로 페이지 이동
  const handleThumbnailClick = (pageNum) => {
    onPageChange(pageNum);
    setShowThumbnails(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      ...style
    }}>
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          padding: '0.5rem',
          borderRadius: '8px',
          border: 'none',
          background: currentPage <= 1 
            ? 'rgba(156, 163, 175, 0.3)' 
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: currentPage <= 1 ? '#9ca3af' : 'white',
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: currentPage <= 1 ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)'
        }}
        title="이전 페이지 (Ctrl+←)"
        onMouseEnter={(e) => {
          if (currentPage > 1) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage > 1) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      {/* 페이지 정보 및 점프 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: '120px'
      }}>
        {showPageJump ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              ref={jumpInputRef}
              type="number"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePageJump();
                if (e.key === 'Escape') {
                  setShowPageJump(false);
                  setJumpPageInput('');
                }
              }}
              placeholder={currentPage.toString()}
              style={{
                width: '60px',
                padding: '0.25rem 0.5rem',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '0.875rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            <button
              onClick={handlePageJump}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              이동
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPageJump(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1e3a8a',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            title="페이지로 이동 (Ctrl+G)"
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            {currentPage} / {totalPages}
          </button>
        )}
      </div>

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          padding: '0.5rem',
          borderRadius: '8px',
          border: 'none',
          background: currentPage >= totalPages 
            ? 'rgba(156, 163, 175, 0.3)' 
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: currentPage >= totalPages ? '#9ca3af' : 'white',
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: currentPage >= totalPages ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)'
        }}
        title="다음 페이지 (Ctrl+→)"
        onMouseEnter={(e) => {
          if (currentPage < totalPages) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage < totalPages) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>

      {/* 썸네일 버튼 */}
      <button
        onClick={() => setShowThumbnails(!showThumbnails)}
        style={{
          padding: '0.5rem',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: showThumbnails 
            ? 'rgba(59, 130, 246, 0.2)' 
            : 'rgba(255, 255, 255, 0.8)',
          color: showThumbnails ? '#1e3a8a' : '#64748b',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="썸네일 보기 (Ctrl+T)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
        </svg>
      </button>

      {/* 썸네일 패널 */}
      {showThumbnails && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '0.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          maxWidth: '400px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '0.5rem'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handleThumbnailClick(pageNum)}
                onMouseEnter={() => generateThumbnail(pageNum)}
                style={{
                  aspectRatio: '3/4',
                  border: currentPage === pageNum ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: currentPage === pageNum ? 'rgba(59, 130, 246, 0.1)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: currentPage === pageNum ? '#1e3a8a' : '#64748b',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={`페이지 ${pageNum}로 이동`}
              >
                {thumbnails[pageNum] ? (
                  <img
                    src={thumbnails[pageNum]}
                    alt={`페이지 ${pageNum}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span>{pageNum}</span>
                )}
                {currentPage === pageNum && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    background: '#3b82f6',
                    borderRadius: '50%'
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 도움말 툴팁 */}
      <div style={{
        fontSize: '0.75rem',
        color: '#64748b',
        fontFamily: 'var(--font-ui)',
        whiteSpace: 'nowrap'
      }}>
        <div>Ctrl+←/→: 페이지 이동</div>
        <div>Ctrl+G: 페이지 점프</div>
        <div>Ctrl+T: 썸네일</div>
      </div>
    </div>
  );
};

export default EnhancedPageSelector;
