import React from 'react';

const FeatureSection = () => {
  return (
    <section className="feature-section">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>
          주요 기능
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3>React 기반</h3>
            <p>최신 React 18 기술을 사용하여 구축된 모던 웹 애플리케이션입니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
              </svg>
            </div>
            <h3>반응형 디자인</h3>
            <p>모바일부터 데스크톱까지 모든 기기에서 완벽하게 작동합니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>인터랙티브 UI</h3>
            <p>사용자 친화적인 인터페이스와 부드러운 애니메이션을 제공합니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
