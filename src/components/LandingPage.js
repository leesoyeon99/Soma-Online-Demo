import React from 'react';

const LandingPage = ({ onSelectUserType }) => {
  const userTypes = [
    {
      id: 'admin',
      title: '교재등록 & AI 분석',
      subtitle: 'Admin 데모',
      description: '교재 업로드, AI 분석, 콘텐츠 관리',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#8B5CF6', // 보라색
      badge: 'Demo',
      isPrimary: false
    },
    {
      id: 'teacher',
      title: '채점 & 피드백',
      subtitle: '강사 데모',
      description: '학생 답안 채점, AI 첨삭, 성적 관리',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#10B981', // 초록색
      badge: 'Demo',
      isPrimary: false
    },
    {
      id: 'student',
      title: '학습 & 문제풀이',
      subtitle: '학생 체험',
      description: '교재 학습, 문제 풀이, 필기 연습',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 3L21 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 3L3 5L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: '#F59E0B', // 주황색
      badge: null,
      isPrimary: true
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* 상단 네비게이션 */}
      <nav style={{
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #10B981 50%, #8B5CF6 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>소마 온라인</span>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <a href="#" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }}>브랜드</a>
            <a href="#" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }}>교육프로그램</a>
            <a href="#" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }}>고객센터</a>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        {/* 히어로 섹션 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '1rem',
            lineHeight: 1.2,
            fontFamily: 'var(--font-title)'
          }}>
            교재를 보고 그리며<br />
            <span style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #10B981 50%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>배우는 즐거운 학습 공간</span>
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: 1.6,
            fontFamily: 'var(--font-body)'
          }}>
            AI 기반 개인화 학습과 실시간 채점으로<br />
            더욱 효과적인 교육 경험을 제공합니다
          </p>
        </div>

        {/* 사용자 유형 선택 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {userTypes.map((userType) => (
            <div
              key={userType.id}
              onClick={() => onSelectUserType(userType.id)}
              style={{
                background: userType.isPrimary 
                  ? `linear-gradient(135deg, ${userType.color}15 0%, ${userType.color}25 100%)`
                  : 'white',
                border: userType.isPrimary 
                  ? `2px solid ${userType.color}40`
                  : '2px solid #e2e8f0',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: userType.isPrimary 
                  ? `0 20px 40px ${userType.color}20`
                  : '0 10px 30px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(0)',
                ':hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 25px 50px ${userType.color}30`
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = `0 25px 50px ${userType.color}30`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = userType.isPrimary 
                  ? `0 20px 40px ${userType.color}20`
                  : '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* 배지 */}
              {userType.badge && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#64748b',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {userType.badge}
                </div>
              )}

              {/* 아이콘 */}
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${userType.color}20 0%, ${userType.color}40 100%)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: userType.color
              }}>
                {userType.icon}
              </div>

              {/* 제목 */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-title)'
              }}>
                {userType.title}
              </h3>

              {/* 부제목 */}
              <p style={{
                fontSize: '1rem',
                color: userType.color,
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                {userType.subtitle}
              </p>

              {/* 설명 */}
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)'
              }}>
                {userType.description}
              </p>

              {/* 버튼 스타일 */}
              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: userType.isPrimary 
                  ? `linear-gradient(135deg, ${userType.color} 0%, ${userType.color}dd 100%)`
                  : '#f8fafc',
                color: userType.isPrimary ? 'white' : '#64748b',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'inline-block',
                border: userType.isPrimary ? 'none' : '1px solid #e2e8f0'
              }}>
                {userType.isPrimary ? '체험 시작하기' : '데모 보기'}
              </div>
            </div>
          ))}
        </div>

        {/* 시연 가이드 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '2rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 3L21 5L19 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 3L3 5L5 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0
            }}>
              시연 가이드
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #F59E0Bdd 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                사용자 선택
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: 1.5
              }}>
                Admin, 강사, 학생 중<br />원하는 역할을 선택하세요
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10B981 0%, #10B981dd 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                기능 체험
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: 1.5
              }}>
                각 역할에 맞는<br />주요 기능들을 체험해보세요
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #8B5CF6dd 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                학습 완료
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: 1.5
              }}>
                다양한 학습 도구로<br />효과적인 교육을 경험하세요
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* 하단 푸터 */}
      <footer style={{
        background: '#f8fafc',
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        marginTop: '4rem'
      }}>
        <p style={{
          fontSize: '0.9rem',
          color: '#94a3b8'
        }}>
          © 2024 소마 온라인. 모든 권리 보유.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
