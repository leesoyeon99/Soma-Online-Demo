import React, { useState } from 'react';

const BookListPage = ({ files, onBookSelect, onBackToLogin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  // 검색 필터링
  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 즐겨찾기 토글
  const toggleFavorite = (fileId, e) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(fileId)) {
      newFavorites.delete(fileId);
    } else {
      newFavorites.add(fileId);
    }
    setFavorites(newFavorites);
  };

  // 즐겨찾기 파일 우선 정렬
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aIsFavorite = favorites.has(a.id);
    const bIsFavorite = favorites.has(b.id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)',
      fontFamily: "'SEBANG Gothic', sans-serif"
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
        padding: '1.5rem 2rem',
        borderBottom: '3px solid #f97316',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBackToLogin}
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: "'SEBANG Gothic', sans-serif",
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ← 로그아웃
            </button>
            <h1 style={{
              fontFamily: "'SEBANG Gothic', sans-serif",
              fontWeight: '700',
              fontSize: '1.75rem',
              color: '#1e293b',
              margin: '0',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📚 교재 목록
            </h1>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* 검색 및 필터 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="교재명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: "'SEBANG Gothic', sans-serif",
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f97316'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#64748b"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontFamily: "'SEBANG Gothic', sans-serif",
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              총 {filteredFiles.length}개 교재
            </span>
          </div>
        </div>

        {/* 교재 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {sortedFiles.map((file, index) => (
            <div
              key={file.id}
              onClick={() => onBookSelect(file.url, index)}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                border: '2px solid #f1f5f9',
                borderRadius: '20px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                e.target.style.borderColor = '#f97316';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                e.target.style.borderColor = '#f1f5f9';
              }}
            >
              {/* 즐겨찾기 버튼 */}
              <button
                onClick={(e) => toggleFavorite(file.id, e)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={favorites.has(file.id) ? '#f97316' : 'none'}
                  stroke={favorites.has(file.id) ? '#f97316' : '#64748b'}
                  strokeWidth="2"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              {/* 교재 아이콘 */}
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
              }}>
                {file.type === 'image' ? (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                )}
              </div>

              {/* 교재 정보 */}
              <div>
                <h3 style={{
                  fontFamily: "'SEBANG Gothic', sans-serif",
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  color: '#1e293b',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4'
                }}>
                  {file.title.replace(' (NEW)', '')}
                </h3>
                
                {file.title.includes('(NEW)') && (
                  <span style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '0.5rem'
                  }}>
                    NEW
                  </span>
                )}

                <p style={{
                  fontFamily: "'SEBANG Gothic', sans-serif",
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: '0',
                  lineHeight: '1.5'
                }}>
                  {file.type === 'image' ? '이미지 교재' : 'PDF 교재'}
                </p>
              </div>

              {/* 학습 기능 표시 */}
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontFamily: "'SEBANG Gothic', sans-serif",
                  fontWeight: '500'
                }}>
                  필기
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontFamily: "'SEBANG Gothic', sans-serif",
                  fontWeight: '500'
                }}>
                  녹음
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontFamily: "'SEBANG Gothic', sans-serif",
                  fontWeight: '500'
                }}>
                  AI
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#cbd5e1" style={{ marginBottom: '1rem' }}>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <p style={{
              fontFamily: "'SEBANG Gothic', sans-serif",
              fontSize: '1.125rem',
              margin: '0'
            }}>
              검색 결과가 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookListPage;
