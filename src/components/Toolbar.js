import React from 'react';

const Toolbar = ({ 
  pageNum, 
  pageCount, 
  zoomScale, 
  drawingMode,
  onPrevPage, 
  onNextPage, 
  onPageChange, 
  onZoomIn, 
  onZoomOut,
  onPenMode,
  onEraseMode
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between space-x-4 flex-wrap">
      {/* 페이지 네비게이션 */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onPrevPage}
          disabled={pageNum <= 1}
          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-full transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <input 
          type="number" 
          value={pageNum}
          onChange={(e) => onPageChange(parseInt(e.target.value))}
          className="w-16 p-2 border border-slate-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max={pageCount}
        />
        
        <span className="text-slate-500 font-medium">/ {pageCount}</span>
        
        <button 
          onClick={onNextPage}
          disabled={pageNum >= pageCount}
          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-full transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 줌 컨트롤 */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onZoomOut}
          disabled={zoomScale <= 0.5}
          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-full transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <span className="w-16 text-center text-sm font-semibold text-slate-700">
          {Math.round(zoomScale * 100)}%
        </span>
        
        <button 
          onClick={onZoomIn}
          disabled={zoomScale >= 3.0}
          className="p-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-full transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 그리기 도구 */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onPenMode}
          className={`p-2 rounded-full transition ${
            drawingMode === 'pen' 
              ? 'bg-blue-200 text-blue-800' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        
        <button 
          onClick={onEraseMode}
          className={`p-2 rounded-full transition ${
            drawingMode === 'erase' 
              ? 'bg-red-200 text-red-800' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
