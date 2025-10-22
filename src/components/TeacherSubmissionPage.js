import React, { useState, useEffect } from 'react';

const TeacherSubmissionPage = ({ onBackToBookList, onViewSubmission }) => {
  const [submissions, setSubmissions] = useState([]);
  // const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'graded'
  const [searchTerm, setSearchTerm] = useState('');

  // 실제 학생 제출 데이터 로드
  useEffect(() => {
    console.log('🎓 TeacherSubmissionPage 마운트됨 - 제출물 로드 시작');
    
    // localStorage에서 실제 제출 데이터 가져오기
    const loadSubmissions = () => {
      const savedSubmissions = localStorage.getItem('studentSubmissions');
//      console.log('🔍 localStorage 확인:', savedSubmissions ? '데이터 있음' : '데이터 없음');
      
      if (savedSubmissions) {
        try {
          const parsedSubmissions = JSON.parse(savedSubmissions);
          console.log('📚 로드된 학생 제출물:', parsedSubmissions.length, '개');
//          console.log('제출 데이터 상세:', parsedSubmissions);
          
//          if (parsedSubmissions.length === 0) {
//            console.warn('⚠️ studentSubmissions는 있지만 빈 배열입니다!');
//            loadSampleSubmissions();
//            return;
//          }
          
          // 제출 데이터를 TeacherSubmissionPage 형식으로 변환
          const formattedSubmissions = parsedSubmissions.map(sub1 => {
          let sub = JSON.parse(sub1);
          sub = sub[0];
            const formatted = {
              ...sub,
              submittedAt: sub.timestamp || sub.submittedAt,
              status: sub.status || 'pending',
              hasAudio: !!(sub.audioBase64 || sub.audioUrl),
              hasDrawing: sub.strokeData && sub.strokeData.length > 0,
              studentName: sub.studentName || '학생',
              bookTitle: sub.bookTitle || '교재'
            };
            console.log('변환된 제출물:', formatted);
            return formatted;
          });
          
          setSubmissions(formattedSubmissions);
          return;
        } catch (error) {
          console.error('❌ 제출 데이터 로드 오류:', error);
        }
      }
      
      // 저장된 데이터가 없으면 샘플 데이터 표시
//      console.log('ℹ️ 저장된 제출물 없음 - 샘플 데이터 표시');
//      loadSampleSubmissions();
    };
    
    const loadSampleSubmissions = () => {
      const sampleSubmissions = [
      {
        id: 1,
        studentId: 'student1',
        studentName: '김민수',
        bookTitle: '중1 1학기 수학 개념 진도북 - 1단원',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-15T14:30:00Z',
        status: 'pending',
        hasAudio: true,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#2563eb',
            brushSize: 2,
            points: [
              { x: 120, y: 80 }, { x: 125, y: 85 }, { x: 130, y: 90 }, { x: 135, y: 95 },
              { x: 140, y: 100 }, { x: 145, y: 105 }, { x: 150, y: 110 }
            ]
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#2563eb',
            brushSize: 2,
            points: [
              { x: 100, y: 120 }, { x: 110, y: 130 }, { x: 120, y: 140 }, { x: 130, y: 150 }
            ]
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#fbbf24',
            brushSize: 4,
            points: [
              { x: 200, y: 150 }, { x: 250, y: 150 }, { x: 300, y: 150 }
            ]
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#fbbf24',
            brushSize: 4,
            points: [
              { x: 80, y: 200 }, { x: 120, y: 200 }, { x: 160, y: 200 }
            ]
          },
          {
            type: 'text',
            content: '이 부분이 이해가 안 돼요',
            x: 180,
            y: 200,
            color: '#dc2626',
            fontSize: 14
          },
          {
            type: 'text',
            content: '2x + 3 = 7',
            x: 100,
            y: 180,
            color: '#2563eb',
            fontSize: 16
          },
          {
            type: 'text',
            content: 'x = 2',
            x: 100,
            y: 220,
            color: '#059669',
            fontSize: 16
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#dc2626',
            brushSize: 1,
            points: [
              { x: 300, y: 100 }, { x: 320, y: 120 }, { x: 340, y: 140 }
            ]
          },
          {
            type: 'text',
            content: '???',
            x: 350,
            y: 160,
            color: '#dc2626',
            fontSize: 18
          }
        ],
        audioUrl: '/sample-audio.wav',
        feedback: null,
        pageNumber: 23,
        problemNumber: 5
      },
      {
        id: 2,
        studentId: 'student2',
        studentName: '이지은',
        bookTitle: '중1 1학기 수학 개념 진도북 - 2단원',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-15T10:15:00Z',
        status: 'graded',
        hasAudio: true,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#059669',
            brushSize: 3,
            points: [
              { x: 100, y: 120 }, { x: 120, y: 140 }, { x: 140, y: 160 },
              { x: 160, y: 180 }, { x: 180, y: 200 }
            ]
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#059669',
            brushSize: 2,
            points: [
              { x: 80, y: 100 }, { x: 90, y: 110 }, { x: 100, y: 120 }
            ]
          },
          {
            type: 'shape',
            shapeType: 'circle',
            color: '#7c3aed',
            brushSize: 2,
            startX: 250,
            startY: 100,
            endX: 300,
            endY: 150
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#fbbf24',
            brushSize: 5,
            points: [
              { x: 200, y: 80 }, { x: 250, y: 80 }, { x: 300, y: 80 }
            ]
          },
          {
            type: 'text',
            content: '정답: 15',
            x: 220,
            y: 250,
            color: '#059669',
            fontSize: 16
          },
          {
            type: 'text',
            content: '원의 넓이 = πr²',
            x: 80,
            y: 80,
            color: '#059669',
            fontSize: 14
          },
          {
            type: 'text',
            content: 'r = 3',
            x: 80,
            y: 100,
            color: '#059669',
            fontSize: 14
          },
          {
            type: 'text',
            content: '넓이 = π × 3² = 9π',
            x: 80,
            y: 120,
            color: '#059669',
            fontSize: 14
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#7c3aed',
            brushSize: 1,
            points: [
              { x: 320, y: 200 }, { x: 340, y: 220 }, { x: 360, y: 240 }
            ]
          },
          {
            type: 'text',
            content: '검산: 9π ≈ 28.27',
            x: 320,
            y: 260,
            color: '#7c3aed',
            fontSize: 12
          }
        ],
        audioUrl: '/sample-audio.wav',
        feedback: {
          id: 1,
          teacherId: 'teacher1',
          teacherName: '박선생님',
          score: 92,
          comment: '정답을 맞혔지만 풀이 과정을 더 자세히 써주세요. 원의 넓이 공식을 사용한 이유도 설명해보세요.',
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#10b981',
              brushSize: 2,
              points: [
                { x: 100, y: 120 }, { x: 120, y: 140 }, { x: 140, y: 160 }
              ]
            }
          ],
          gradedAt: '2024-01-15T16:45:00Z'
        },
        pageNumber: 45,
        problemNumber: 12
      },
      {
        id: 3,
        studentId: 'student3',
        studentName: '박서준',
        bookTitle: '중1 1학기 수학 개념 진도북 - 3단원',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-14T16:20:00Z',
        status: 'pending',
        hasAudio: false,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#dc2626',
            brushSize: 2,
            points: [
              { x: 80, y: 90 }, { x: 90, y: 100 }, { x: 100, y: 110 },
              { x: 110, y: 120 }, { x: 120, y: 130 }
            ]
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#dc2626',
            brushSize: 1,
            points: [
              { x: 50, y: 80 }, { x: 60, y: 90 }, { x: 70, y: 100 }
            ]
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#f59e0b',
            brushSize: 5,
            points: [
              { x: 150, y: 180 }, { x: 200, y: 180 }, { x: 250, y: 180 },
              { x: 300, y: 180 }, { x: 350, y: 180 }
            ]
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#f59e0b',
            brushSize: 4,
            points: [
              { x: 100, y: 60 }, { x: 150, y: 60 }, { x: 200, y: 60 }
            ]
          },
          {
            type: 'text',
            content: '???',
            x: 200,
            y: 220,
            color: '#dc2626',
            fontSize: 18
          },
          {
            type: 'text',
            content: '이 문제는 어떻게 풀어야 하나요?',
            x: 120,
            y: 280,
            color: '#374151',
            fontSize: 12
          },
          {
            type: 'text',
            content: '3x - 2 = 10',
            x: 50,
            y: 50,
            color: '#dc2626',
            fontSize: 16
          },
          {
            type: 'text',
            content: 'x = ?',
            x: 50,
            y: 70,
            color: '#dc2626',
            fontSize: 16
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#8b5cf6',
            brushSize: 1,
            points: [
              { x: 300, y: 100 }, { x: 320, y: 120 }, { x: 340, y: 140 }
            ]
          },
          {
            type: 'text',
            content: '모르겠어요...',
            x: 300,
            y: 160,
            color: '#8b5cf6',
            fontSize: 14
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#dc2626',
            brushSize: 2,
            points: [
              { x: 400, y: 200 }, { x: 420, y: 220 }, { x: 440, y: 240 }
            ]
          },
          {
            type: 'text',
            content: '도와주세요!',
            x: 400,
            y: 260,
            color: '#dc2626',
            fontSize: 14
          }
        ],
        audioUrl: null,
        feedback: null,
        pageNumber: 67,
        problemNumber: 8
      },
      {
        id: 4,
        studentId: 'student4',
        studentName: '최유진',
        bookTitle: '중1 1학기 수학 개념 진도북 - 4단원',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-14T13:45:00Z',
        status: 'graded',
        hasAudio: true,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#1d4ed8',
            brushSize: 2,
            points: [
              { x: 100, y: 100 }, { x: 150, y: 120 }, { x: 200, y: 140 },
              { x: 250, y: 160 }, { x: 300, y: 180 }
            ]
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#1d4ed8',
            brushSize: 1,
            points: [
              { x: 80, y: 80 }, { x: 90, y: 90 }, { x: 100, y: 100 }
            ]
          },
          {
            type: 'shape',
            shapeType: 'rectangle',
            color: '#059669',
            brushSize: 2,
            startX: 120,
            startY: 200,
            endX: 280,
            endY: 250
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#fbbf24',
            brushSize: 4,
            points: [
              { x: 100, y: 50 }, { x: 150, y: 50 }, { x: 200, y: 50 }
            ]
          },
          {
            type: 'text',
            content: '가로: 8cm, 세로: 5cm',
            x: 130,
            y: 230,
            color: '#059669',
            fontSize: 14
          },
          {
            type: 'text',
            content: '넓이 = 8 × 5 = 40cm²',
            x: 130,
            y: 260,
            color: '#1d4ed8',
            fontSize: 14
          },
          {
            type: 'text',
            content: '직사각형의 넓이',
            x: 80,
            y: 50,
            color: '#1d4ed8',
            fontSize: 14
          },
          {
            type: 'text',
            content: '넓이 = 가로 × 세로',
            x: 80,
            y: 70,
            color: '#059669',
            fontSize: 12
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#7c3aed',
            brushSize: 1,
            points: [
              { x: 320, y: 100 }, { x: 340, y: 120 }, { x: 360, y: 140 }
            ]
          },
          {
            type: 'text',
            content: '검산: 8×5=40',
            x: 320,
            y: 160,
            color: '#7c3aed',
            fontSize: 12
          },
          {
            type: 'stroke',
            tool: 'pen',
            color: '#059669',
            brushSize: 2,
            points: [
              { x: 400, y: 200 }, { x: 420, y: 220 }, { x: 440, y: 240 }
            ]
          },
          {
            type: 'text',
            content: '정답!',
            x: 400,
            y: 260,
            color: '#059669',
            fontSize: 16
          }
        ],
        audioUrl: '/sample-audio.wav',
        feedback: {
          id: 2,
          teacherId: 'teacher1',
          teacherName: '박선생님',
          score: 88,
          comment: '계산은 정확하지만 단위를 빼먹지 말고, 공식도 함께 써주세요. 직사각형의 넓이 = 가로 × 세로',
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#10b981',
              brushSize: 2,
              points: [
                { x: 100, y: 100 }, { x: 150, y: 120 }, { x: 200, y: 140 }
              ]
            }
          ],
          gradedAt: '2024-01-14T18:30:00Z'
        },
        pageNumber: 89,
        problemNumber: 15
      },
      {
        id: 5,
        studentId: 'student5',
        studentName: '정다은',
        bookTitle: '중1 1학기 수학 개념 진도북 - 5단원',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-13T15:10:00Z',
        status: 'graded',
        hasAudio: true,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#7c3aed',
            brushSize: 3,
            points: [
              { x: 90, y: 80 }, { x: 110, y: 100 }, { x: 130, y: 120 },
              { x: 150, y: 140 }, { x: 170, y: 160 }
            ]
          },
          {
            type: 'stroke',
            tool: 'highlighter',
            color: '#fbbf24',
            brushSize: 4,
            points: [
              { x: 200, y: 120 }, { x: 250, y: 120 }, { x: 300, y: 120 }
            ]
          },
          {
            type: 'text',
            content: 'x = 3',
            x: 180,
            y: 200,
            color: '#7c3aed',
            fontSize: 16
          },
          {
            type: 'text',
            content: '검산: 2×3 + 1 = 7 ✓',
            x: 180,
            y: 230,
            color: '#059669',
            fontSize: 12
          }
        ],
        audioUrl: '/sample-audio.wav',
        feedback: {
          id: 3,
          teacherId: 'teacher1',
          teacherName: '박선생님',
          score: 95,
          comment: '완벽합니다! 검산까지 해서 정말 좋아요. 이렇게 꼼꼼하게 푸는 습관을 계속 유지해주세요.',
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#10b981',
              brushSize: 2,
              points: [
                { x: 90, y: 80 }, { x: 110, y: 100 }, { x: 130, y: 120 }
              ]
            }
          ],
          gradedAt: '2024-01-13T17:20:00Z'
        },
        pageNumber: 112,
        problemNumber: 7
      },
      {
        id: 6,
        studentId: 'student6',
        studentName: '한지호',
        bookTitle: '중1 1학기 수학 개념 진도북 - 6단원',
        bookUrl: '/somapremier.pdf',
        submittedAt: '2024-01-12T11:30:00Z',
        status: 'pending',
        hasAudio: false,
        hasDrawing: true,
        strokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#dc2626',
            brushSize: 2,
            points: [
              { x: 100, y: 100 }, { x: 120, y: 120 }, { x: 140, y: 140 }
            ]
          },
          {
            type: 'text',
            content: '모르겠어요...',
            x: 160,
            y: 180,
            color: '#dc2626',
            fontSize: 14
          },
          {
            type: 'text',
            content: '선생님 도와주세요',
            x: 160,
            y: 210,
            color: '#6b7280',
            fontSize: 12
          }
        ],
        audioUrl: null,
        feedback: null,
        pageNumber: 134,
        problemNumber: 3
      }
    ];
    
      setSubmissions(sampleSubmissions);
    };
    
    loadSubmissions();
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
    // setSelectedSubmission(submission);
    if (onViewSubmission) {
        window.localStorage.setItem("studentSubmissionSelect", JSON.stringify(submission));
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
                  overflow: 'hidden',
                  willChange: 'transform, box-shadow'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(30, 58, 138, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(30, 58, 138, 0.2)';
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
                  {/* 페이지 정보 */}
                  {submission.currentPage && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#8b5cf6',
                      fontFamily: 'var(--font-body)'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      <span><strong>페이지:</strong> {submission.currentPage}</span>
                    </div>
                  )}
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
              margin: '0 0 1rem 0',
              fontFamily: 'var(--font-body)'
            }}>
              {searchTerm || filterStatus !== 'all' ? '다른 검색어를 시도해보세요' : '학생들이 과제를 제출하면 여기에 표시됩니다'}
            </p>
            <button
              onClick={() => {
                console.log('🔄 제출물 새로고침 버튼 클릭');
                const saved = localStorage.getItem('studentSubmissions');
                console.log('localStorage 내용:', saved);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  console.log('파싱된 제출물:', parsed);
                  alert(`저장된 제출물: ${parsed.length}개\n\n콘솔을 확인하세요.`);
                } else {
                  alert('저장된 제출물이 없습니다.\n학생 모드에서 먼저 제출해주세요.');
                }
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                fontFamily: 'var(--font-ui)'
              }}
            >
              🔄 제출물 새로고침
            </button>
            <p style={{
              fontSize: '0.8rem',
              margin: '1rem 0 0 0',
              opacity: 0.7,
              fontFamily: 'var(--font-body)'
            }}>
              전체 제출물 수: {submissions.length}개 | 필터링 후: {filteredSubmissions.length}개
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSubmissionPage;
