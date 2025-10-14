import React, { useState } from 'react';

const TeacherFeedbackCards = ({ 
  feedbacks, 
  onSelectFeedback, 
  onBackToBookList 
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // 첨삭을 날짜순으로 정렬 (최신순)
  const sortedFeedbacks = [...feedbacks].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // 신규 첨삭인지 확인 (24시간 이내)
  const isNewFeedback = (timestamp) => {
    const now = new Date();
    const feedbackTime = new Date(timestamp);
    const diffHours = (now - feedbackTime) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  // 첨삭 날짜 포맷팅
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 첨삭 개수 계산
  const getFeedbackCount = (feedback) => {
    return feedback.feedbackStrokeData ? feedback.feedbackStrokeData.length : 0;
  };

  // 다양한 한글 첨삭 내용 샘플
  const sampleFeedbackTexts = [
    "계산 과정이 정확하고 체계적이에요! 다음번엔 단위도 꼭 써주세요.",
    "문제 해결 방법이 훌륭해요. 답 검산을 한 번 더 해보면 완벽할 거예요.",
    "그림을 이용해 문제를 푸는 방법이 참 좋았어요. 계산 실수만 조심하세요.",
    "순서대로 차근차근 풀어가는 모습이 보기 좋아요. 정말 잘했어요!",
    "개념 이해가 정확해요! 다만 공식 적용에서 부호 실수가 있었네요.",
    "창의적인 접근 방법이네요! 답도 정확하고 과정도 깔끔해요.",
    "기본기가 탄탄해요. 조금 더 꼼꼼히 계산하면 완벽할 거예요.",
    "열심히 푼 흔적이 보여요. 다음엔 더 간단한 방법도 생각해보세요."
  ];

  // 첨삭 내용 가져오기 (인덱스 기반으로 다른 내용 반환)
  const getFeedbackText = (feedback, index) => {
    if (feedback.feedbackText) {
      return feedback.feedbackText;
    }
    return sampleFeedbackTexts[index % sampleFeedbackTexts.length];
  };

  // 첨삭 상태에 따른 색상 (기존 포인트 컬러 사용)
  const getStatusColor = (feedback) => {
    if (isNewFeedback(feedback.timestamp)) {
      return {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // 주황색 (기존 포인트 컬러)
        border: '2px solid #f59e0b',
        badge: '#f59e0b'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // 초록색 (기존 포인트 컬러)
        border: '2px solid #10b981',
        badge: '#10b981'
      };
    }
  };

  if (selectedFeedback) {
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
            maxWidth: '1400px',
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
                onClick={() => setSelectedFeedback(null)}
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                ← 첨삭 목록으로
              </button>
              
              <div>
                <h1 style={{
                  color: '#1e3a8a',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-title)',
                  margin: '0 0 0.25rem 0'
                }}>
                  {selectedFeedback.bookTitle} - 첨삭 상세
                </h1>
                <p style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  margin: '0',
                  fontFamily: 'var(--font-body)'
                }}>
                  {formatDate(selectedFeedback.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 첨삭 상세 내용 */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* 첨삭 정보 */}
              <div>
                <h3 style={{
                  color: '#1e3a8a',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-title)'
                }}>
                  첨삭 정보
                </h3>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>선생님</span>
                    <span style={{ color: '#1e3a8a', fontWeight: '600' }}>
                      {selectedFeedback.teacherName}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>첨삭 개수</span>
                    <span style={{ color: '#1e3a8a', fontWeight: '600' }}>
                      {getFeedbackCount(selectedFeedback)}개
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>첨삭 일시</span>
                    <span style={{ color: '#1e3a8a', fontWeight: '600' }}>
                      {formatDate(selectedFeedback.timestamp)}
                    </span>
                  </div>
                  {isNewFeedback(selectedFeedback.timestamp) && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: '1rem'
                    }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        fontFamily: 'var(--font-ui)'
                      }}>
                        🆕 신규 첨삭
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 첨삭 내용 */}
              <div>
                <h3 style={{
                  color: '#1e3a8a',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-title)'
                }}>
                  선생님 첨삭 내용
                </h3>
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  minHeight: '200px'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(139, 92, 246, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#8b5cf6">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      <span style={{
                        color: '#8b5cf6',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        fontFamily: 'var(--font-ui)'
                      }}>
                        {selectedFeedback.teacherName} 선생님의 첨삭
                      </span>
                    </div>
                    
                    <p style={{
                      color: '#374151',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      margin: '0',
                      fontFamily: 'var(--font-body)',
                      fontWeight: '500'
                    }}>
                      "{getFeedbackText(selectedFeedback, sortedFeedbacks.findIndex(f => f.id === selectedFeedback.id))}"
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      margin: '0 0 1rem 0',
                      fontFamily: 'var(--font-body)'
                    }}>
                      총 {getFeedbackCount(selectedFeedback)}개의 첨삭이 있습니다
                    </p>
                    <button
                      onClick={() => onSelectFeedback(selectedFeedback)}
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      첨삭 자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          maxWidth: '1400px',
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
              onClick={onBackToBookList}
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              ← 교재목록으로
            </button>
            
            <div>
              <h1 style={{
                color: '#1e3a8a',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)',
                margin: '0 0 0.25rem 0'
              }}>
                선생님 첨삭 목록
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '0.9rem',
                margin: '0',
                fontFamily: 'var(--font-body)'
              }}>
                총 {feedbacks.length}개의 첨삭이 있습니다
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* 신규 첨삭 알림 */}
        {sortedFeedbacks.some(feedback => isNewFeedback(feedback.timestamp)) && (
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                새로운 첨삭이 도착했습니다!
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {sortedFeedbacks.filter(feedback => isNewFeedback(feedback.timestamp)).length}개의 신규 첨삭을 확인해보세요
              </div>
            </div>
          </div>
        )}

        {/* 첨삭 카드 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {sortedFeedbacks.map((feedback, index) => {
            const statusColor = getStatusColor(feedback);
            const isNew = isNewFeedback(feedback.timestamp);
            
            return (
              <div
                key={feedback.id}
                onClick={() => setSelectedFeedback(feedback)}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: statusColor.border,
                  position: 'relative',
                  overflow: 'hidden',
                  willChange: 'transform, box-shadow'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* 신규 배지 */}
                {isNew && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: statusColor.badge,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    fontFamily: 'var(--font-ui)',
                    zIndex: 1
                  }}>
                    🆕 NEW
                  </div>
                )}

                {/* 교재 아이콘 */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: statusColor.background,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: `0 4px 6px -1px ${statusColor.badge}30`
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>

                {/* 첨삭 정보 */}
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-title)',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    color: '#1e293b',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {feedback.bookTitle}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-body)'
                    }}>
                      {feedback.teacherName} 선생님
                    </span>
                    <span style={{
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}>
                      •
                    </span>
                    <span style={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-body)'
                    }}>
                      {formatDate(feedback.timestamp)}
                    </span>
                  </div>

                  {/* 첨삭 통계 */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: '500'
                    }}>
                      첨삭 {getFeedbackCount(feedback)}개
                    </span>
                    {isNew && (
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-ui)',
                        fontWeight: '500'
                      }}>
                        신규
                      </span>
                    )}
                  </div>

                  {/* 첨삭 내용 미리보기 */}
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: '#374151',
                      margin: '0',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontWeight: '500'
                    }}>
                      "{getFeedbackText(feedback, index)}"
                    </p>
                  </div>
                  
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    {getFeedbackCount(feedback)}개의 첨삭 • 자세한 내용을 확인해보세요
                  </p>
                </div>

                {/* 하단 액션 버튼 */}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeedback(feedback);
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      fontFamily: 'var(--font-ui)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                    }}
                  >
                    상세보기
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFeedback(feedback);
                    }}
                    style={{
                      flex: 1,
                      background: statusColor.background,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      fontFamily: 'var(--font-ui)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = `0 4px 12px ${statusColor.badge}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    첨삭 보기
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 빈 상태 */}
        {feedbacks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#64748b'
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="#cbd5e1" style={{ marginBottom: '1.5rem' }}>
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            <h3 style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              아직 첨삭이 없습니다
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              margin: '0',
              color: '#64748b'
            }}>
              선생님의 첨삭이 도착하면 여기에 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherFeedbackCards;
