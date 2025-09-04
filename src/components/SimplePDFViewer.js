import React from 'react';

const SimplePDFViewer = ({ pdfUrl }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <iframe
        src={pdfUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          minHeight: '600px'
        }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default SimplePDFViewer;
