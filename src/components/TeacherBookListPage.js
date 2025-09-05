import React, { useState } from 'react';

const TeacherBookListPage = ({ files, onBookSelect, onBackToLogin, notifications, setNotifications }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [activeTab, setActiveTab] = useState('books'); // 'books' 또는 'notifications'

  const handleFavoriteToggle = (index) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    // 즐겨찾기 우선 정렬
    const aIsFavorite = favorites.has(files.indexOf(a));
    const bIsFavorite = favorites.has(files.indexOf(b));
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    
    // 그 다음은 제목순
    return a.title.localeCompare(b.title);
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* 헤더 */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
        padding: '1rem 2rem',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
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
            gap: '1rem'
          }}>
            <button
              onClick={onBackToLogin}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ← 로그인으로
            </button>
            
            
            <h1 style={{
              color: '#1e3a8a',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-title)'
            }}>
              📚 교재 목록 - 강사 모드
            </h1>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* 알림 탭 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              padding: '0.25rem',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <button
                onClick={() => setActiveTab('books')}
                style={{
                  background: activeTab === 'books' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                  color: activeTab === 'books' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                📚 교재
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  background: activeTab === 'notifications' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                  color: activeTab === 'notifications' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                🔔 알림
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {activeTab === 'books' ? (
          <>
            {/* 검색 및 필터 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        color: '#6b7280',
                        zIndex: 1
                      }}
                    >
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="교재명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#374151',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-ui)'
                }}>
                  <span>총 {filteredFiles.length}개 교재</span>
                </div>
              </div>
            </div>

            {/* 교재 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {sortedFiles.map((file, index) => {
                const originalIndex = files.indexOf(file);
                const isFavorite = favorites.has(originalIndex);
                
                return (
                  <div
                    key={originalIndex}
                    onClick={() => {
                      console.log('교재 카드 클릭됨:', { title: file.title, index: originalIndex });
                      onBookSelect(file.url, originalIndex);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px)';
                      e.target.style.boxShadow = '0 12px 40px rgba(30, 58, 138, 0.3)';
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.2)';
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    }}
                  >
                    {/* 즐겨찾기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(originalIndex);
                      }}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? '#3b82f6' : 'none'}
                        stroke={isFavorite ? '#3b82f6' : '#6b7280'}
                        strokeWidth="2"
                      >
                        <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"/>
                      </svg>
                    </button>

                    {/* 교재 아이콘 */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>

                    {/* 교재 정보 */}
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: '#1e3a8a',
                      marginBottom: '0.5rem',
                      fontFamily: 'var(--font-title)',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {file.title}
                    </h3>

                    <p style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      marginBottom: '1rem',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.4
                    }}>
                      {file.type === 'image' ? '이미지 교재' : 'PDF 교재'}
                    </p>

                    {/* 강사용 액션 버튼 */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        fontFamily: 'var(--font-ui)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        채점 가능
                      </div>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        fontFamily: 'var(--font-ui)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        AI 첨삭
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 빈 상태 */}
            {filteredFiles.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'white'
              }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ margin: '0 auto 1rem', opacity: 0.5 }}
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-title)'
                }}>
                  검색 결과가 없습니다
                </h3>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.8,
                  fontFamily: 'var(--font-body)'
                }}>
                  다른 검색어를 시도해보세요
                </p>
              </div>
            )}
          </>
        ) : (
          /* 알림 탭 */
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </div>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-title)',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  color: '#1e3a8a',
                  margin: '0 0 0.25rem 0'
                }}>
                  강사 알림 센터
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: '0'
                }}>
                  학생들의 과제 제출 및 소통 내역을 확인하세요
                </p>
              </div>
            </div>

            {/* 알림 목록 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* 샘플 알림들 */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-title)',
                      fontWeight: '600',
                      fontSize: '1rem',
                      margin: '0 0 0.25rem 0'
                    }}>
                      학생 과제 제출
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      margin: '0'
                    }}>
                      김학생이 "셋카드 놀이를 해 봅시다" 교재에 필기와 녹음을 제출했습니다
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    opacity: 0.8
                  }}>
                    2024.01.15 14:30
                  </span>
                  <button
                    onClick={() => {
                      // 과제 확인 로직
                      alert('학생 과제를 확인합니다!');
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: '500'
                    }}
                  >
                    확인하기
                  </button>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-title)',
                      fontWeight: '600',
                      fontSize: '1rem',
                      margin: '0 0 0.25rem 0'
                    }}>
                      첨삭 완료
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      margin: '0'
                    }}>
                      이학생의 "21년 1학기 과학 - 동물들의 생활" 과제 첨삭이 완료되었습니다
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    opacity: 0.8
                  }}>
                    2024.01.15 10:15
                  </span>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: '500'
                  }}>
                    첨삭 완료
                  </span>
                </div>
              </div>

              {/* 빈 상태 */}
              {notifications.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#64748b'
                }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#cbd5e1" style={{ marginBottom: '1rem' }}>
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  <h3 style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151'
                  }}>
                    새로운 알림이 없습니다
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    margin: '0',
                    color: '#64748b'
                  }}>
                    학생들의 과제 제출 및 소통 내역이 여기에 표시됩니다
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherBookListPage;
