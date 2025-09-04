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
            <div className="feature-icon">⚛️</div>
            <h3>React 기반</h3>
            <p>최신 React 18 기술을 사용하여 구축된 모던 웹 애플리케이션입니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>반응형 디자인</h3>
            <p>모바일부터 데스크톱까지 모든 기기에서 완벽하게 작동합니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>인터랙티브 UI</h3>
            <p>사용자 친화적인 인터페이스와 부드러운 애니메이션을 제공합니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
