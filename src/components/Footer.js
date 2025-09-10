import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 소마 온라인 데모. Made with React 
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px', verticalAlign: 'middle' }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </p>
        <p>GitHub Pages로 배포된 데모 애플리케이션</p>
      </div>
    </footer>
  );
};

export default Footer;
