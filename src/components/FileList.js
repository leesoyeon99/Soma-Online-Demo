import React from 'react';

const FileList = ({ files, activeFileIndex, onFileSelect }) => {
  return (
    <aside style={{
      width: '320px',
      background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
      borderRight: '3px solid #f97316',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }}>
      <h1 style={{
        fontFamily: "'SEBANG Gothic', sans-serif",
        fontSize: '1.75rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        textAlign: 'center',
        color: '#1e293b',
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        교재 목록
      </h1>
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '0.5rem 0'
      }}>
        {files.map((file, index) => (
          <div
            key={file.id}
            style={{
              padding: '1rem',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: index === activeFileIndex 
                ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
              border: index === activeFileIndex 
                ? '3px solid #ea580c' 
                : '2px solid #f1f5f9',
              fontWeight: index === activeFileIndex ? '700' : '500',
              color: index === activeFileIndex ? 'white' : '#334155',
              boxShadow: index === activeFileIndex 
                ? '0 10px 15px -3px rgba(249, 115, 22, 0.3)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transform: index === activeFileIndex ? 'scale(1.02)' : 'scale(1)',
              margin: '0.25rem 0',
              overflow: 'hidden'
            }}
            onClick={() => onFileSelect(file.url, index)}
            onMouseEnter={(e) => {
              if (index !== activeFileIndex) {
                e.target.style.background = 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)';
                e.target.style.borderColor = '#f97316';
                e.target.style.transform = 'translateY(-1px) scale(1.01)';
                e.target.style.boxShadow = '0 6px 12px -3px rgba(0, 0, 0, 0.1)';
                e.target.style.zIndex = '10';
              }
            }}
            onMouseLeave={(e) => {
              if (index !== activeFileIndex) {
                e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)';
                e.target.style.borderColor = '#f1f5f9';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                e.target.style.zIndex = '1';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: index === activeFileIndex 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
                  : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {file.type === 'image' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{
                  fontFamily: "'SEBANG Gothic', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: index === activeFileIndex ? '700' : '500',
                  color: index === activeFileIndex ? 'white' : '#334155',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1
                }}>{file.title.replace(' (NEW)', '')}</span>
                {file.title.includes('(NEW)') && (
                  <span style={{
                    background: index === activeFileIndex 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    border: index === activeFileIndex ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>NEW</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default FileList;
