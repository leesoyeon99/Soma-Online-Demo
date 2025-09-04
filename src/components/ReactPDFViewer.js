import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// PDF.js worker 설정 - 로컬 파일 사용 (react-pdf 10.1.0 호환)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const ReactPDFViewer = ({ 
  pdfUrl, 
  zoom = 1.0, 
  onPageChange, 
  currentPage = 1,
  onZoomChange 
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(currentPage);
  const [scale, setScale] = useState(zoom);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log('PDF 로드 성공:', numPages, '페이지');
    console.log('PDF URL:', pdfUrl);
    setNumPages(numPages);
    setPageNumber(1);
  }, [pdfUrl]);

  const onDocumentLoadError = useCallback((error) => {
    console.error('PDF 로드 실패:', error);
    console.error('PDF URL:', pdfUrl);
    console.error('에러 상세:', error.message);
    alert(`PDF 파일을 불러올 수 없습니다.\n파일 경로: ${pdfUrl}\n에러: ${error.message}`);
  }, [pdfUrl]);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange && onPageChange(newPage);
    }
  }, [pageNumber, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange && onPageChange(newPage);
    }
  }, [pageNumber, numPages, onPageChange]);

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.25, 3.0);
    setScale(newScale);
    onZoomChange && onZoomChange(newScale);
  }, [scale, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.25, 0.5);
    setScale(newScale);
    onZoomChange && onZoomChange(newScale);
  }, [scale, onZoomChange]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* PDF 컨트롤 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: pageNumber <= 1 ? '#e5e7eb' : '#3b82f6',
            color: pageNumber <= 1 ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          ← 이전
        </button>
        
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500',
          color: '#374151'
        }}>
          {pageNumber} / {numPages || '?'}
        </span>
        
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: pageNumber >= numPages ? '#e5e7eb' : '#3b82f6',
            color: pageNumber >= numPages ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          다음 →
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        <button
          onClick={handleZoomOut}
          style={{
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          🔍-
        </button>
        
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500',
          color: '#374151',
          minWidth: '60px',
          textAlign: 'center'
        }}>
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          style={{
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          🔍+
        </button>
      </div>

      {/* PDF 문서 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'auto',
        maxWidth: '100%'
      }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              PDF 로딩 중...
            </div>
          }
          error={
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#ef4444'
            }}>
              ⚠️ PDF 파일을 불러올 수 없습니다
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default ReactPDFViewer;
