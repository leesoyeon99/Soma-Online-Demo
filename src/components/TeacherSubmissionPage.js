import React, { useState, useEffect } from 'react';

const TeacherSubmissionPage = ({ onBackToBookList, onViewSubmission }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'graded'
  const [searchTerm, setSearchTerm] = useState('');

  // 샘플 제출 데이터 (실제로는 서버에서 가져옴)
  useEffect(() => {
    const sampleSubmissions = [
      {
        id: 1,
        studentId: 'student1',
        studentName: '김학생',
        bookTitle: '소마 프리미어 교재 1',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-15T14:30:00Z',
        status: 'pending', // 'pending', 'graded'
        hasAudio: true,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#ef4444',
            brushSize: 3,
            points: [
              { x: 100, y: 100 },
              { x: 150, y: 120 },
              { x: 200, y: 140 }
            ]
          }
        ],
        audioUrl: '/sample-audio.wav',
        feedback: null
      },
      {
        id: 2,
        studentId: 'student2',
        studentName: '이학생',
        bookTitle: '소마 프리미어 교재 2(첨삭)',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-15T10:15:00Z',
        status: 'graded',
        hasAudio: true,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#3b82f6',
            brushSize: 3,
            points: [
              { x: 200, y: 200 },
              { x: 250, y: 220 },
              { x: 300, y: 240 }
            ]
          }
        ],
        audioUrl: '/sample-audio2.wav',
        feedback: {
          id: 1,
          teacherId: 'teacher1',
          teacherName: '선생님',
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#10b981',
              brushSize: 2,
              points: [
                { x: 200, y: 200 },
                { x: 250, y: 220 },
                { x: 300, y: 240 }
              ]
            }
          ],
          gradedAt: '2024-01-15T16:45:00Z'
        }
      },
      {
        id: 3,
        studentId: 'student3',
        studentName: '박학생',
        bookTitle: '소마 프리미어 교재 1',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-14T16:20:00Z',
        status: 'pending',
        hasAudio: false,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#8b5cf6',
            brushSize: 4,
            points: [
              { x: 300, y: 300 },
              { x: 350, y: 320 },
              { x: 400, y: 340 }
            ]
          }
        ],
        audioUrl: null,
        feedback: null
      }
    ];
    
    setSubmissions(sampleSubmissions);
  }, []);

  // 필터링된 제출물 목록
  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 시간 포맷팅
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'graded':
        return { bg: '#d1fae5', text: '#059669', border: '#10b981' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
  };

  // 제출물 상세 보기
  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    if (onViewSubmission) {
      onViewSubmission(submission);
    }
  };

  return (
    <div style={{
      fontFamily: 'var(--font-body)'
    }}>
      {/* 메인 콘텐츠 */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0'
      }}>
        {/* 필터 및 검색 */}
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
            {/* 검색 */}
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
                  placeholder="학생명 또는 교재명으로 검색..."
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
            
            {/* 상태 필터 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '0.25rem'
            }}>
              {[
                { value: 'all', label: '전체', count: submissions.length },
                { value: 'pending', label: '미채점', count: submissions.filter(s => s.status === 'pending').length },
                { value: 'graded', label: '채점완료', count: submissions.filter(s => s.status === 'graded').length }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  style={{
                    background: filterStatus === filter.value ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                    color: filterStatus === filter.value ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {filter.label}
                  <span style={{
                    background: filterStatus === filter.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: filterStatus === filter.value ? 'white' : '#3b82f6',
                    borderRadius: '12px',
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 제출물 목록 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredSubmissions.map((submission) => {
            const statusColor = getStatusColor(submission.status);
            
            return (
              <div
                key={submission.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `2px solid ${statusColor.border}`,
                  boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(30, 58, 138, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.2)';
                }}
                onClick={() => handleViewSubmission(submission)}
              >
                {/* 상태 배지 */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: statusColor.bg,
                  color: statusColor.text,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  fontFamily: 'var(--font-ui)',
                  border: `1px solid ${statusColor.border}`
                }}>
                  {submission.status === 'pending' ? '미채점' : '채점완료'}
                </div>

                {/* 학생 정보 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-title)'
                  }}>
                    {submission.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: '#1e3a8a',
                      margin: '0 0 0.25rem 0',
                      fontFamily: 'var(--font-title)'
                    }}>
                      {submission.studentName}
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#64748b',
                      margin: '0',
                      fontFamily: 'var(--font-body)'
                    }}>
                      {submission.bookTitle}
                    </p>
                  </div>
                </div>

                {/* 제출 정보 */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#64748b',
                    fontFamily: 'var(--font-ui)'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>제출일: {formatDateTime(submission.submittedAt)}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: submission.hasDrawing ? '#10b981' : '#6b7280',
                      fontFamily: 'var(--font-ui)'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      <span>필기 {submission.hasDrawing ? '있음' : '없음'}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: submission.hasAudio ? '#10b981' : '#6b7280',
                      fontFamily: 'var(--font-ui)'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                      <span>녹음 {submission.hasAudio ? '있음' : '없음'}</span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSubmission(submission);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      fontFamily: 'var(--font-ui)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    {submission.status === 'pending' ? '첨삭하기' : '첨삭보기'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 빈 상태 */}
        {filteredSubmissions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
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
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-title)'
            }}>
              {searchTerm || filterStatus !== 'all' ? '검색 결과가 없습니다' : '아직 제출된 과제가 없습니다'}
            </h3>
            <p style={{
              fontSize: '1rem',
              margin: '0',
              fontFamily: 'var(--font-body)'
            }}>
              {searchTerm || filterStatus !== 'all' ? '다른 검색어를 시도해보세요' : '학생들이 과제를 제출하면 여기에 표시됩니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSubmissionPage;
