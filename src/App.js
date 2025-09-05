import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import BookListPage from './components/BookListPage';
import ImageViewer from './components/ImageViewer';
import StaticPDFViewer from './components/StaticPDFViewer';
import AIChatbot from './components/AIChatbot';
import TeacherLoginPage from './components/TeacherLoginPage';
import TeacherBookListPage from './components/TeacherBookListPage';
import TeacherSubmissionPage from './components/TeacherSubmissionPage';
import TeacherAnnotationViewer from './components/TeacherAnnotationViewer';
import StudentFeedbackViewer from './components/StudentFeedbackViewer';
import AdminPage from './components/AdminPage';

function App() {
  console.log('App 컴포넌트 렌더링 시작');
  
  // 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'bookList', 'detail', 'teacherSubmission', 'teacherAnnotation', 'studentFeedback'
  // const [userType, setUserType] = useState(null); // 'admin', 'teacher', 'student' - 현재 사용하지 않음
  const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // 현재 사용하지 않음
  
  // 강사 첨삭 관련 상태
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // 학생 첨삭 확인 관련 상태
  const [studentFeedback, setStudentFeedback] = useState(null);
  
  // 파일 목록 - 소마 프리미어 교재들
  const files = [
    { 
      id: 1, 
      title: '소마 프리미어 교재 1', 
      url: '/somapremier.pdf',
      type: 'pdf'
    },
    { 
      id: 2, 
      title: '소마 프리미어 교재 2(첨삭)', 
      url: '/somapremier.pdf',
      type: 'pdf'
    }
  ];

  // 상태 관리
  const [currentPdfUrl, setCurrentPdfUrl] = useState(files[0].url); // 첫 번째 파일을 기본으로
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  // 현재 선택된 파일 정보
  const currentFile = files[activeFileIndex];
  const isCurrentFilePDF = currentFile && currentFile.type === 'pdf';
  const [pageCount, setPageCount] = useState(1);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [zoomScale, setZoomScale] = useState(2.0);
  const [selectedTool, setSelectedTool] = useState('hand');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  
  // 녹음 및 스트로크 데이터 상태
  const [isRecording, setIsRecording] = useState(false);
  const [strokeData, setStrokeData] = useState([]);
  
  // 재생 관련 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  // const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  // 학생-선생님 소통 관련 상태
  const [studentSubmission, setStudentSubmission] = useState(null); // 학생 제출 데이터
  const [teacherFeedback, setTeacherFeedback] = useState(null); // 선생님 첨삭 데이터
  const [showTeacherFeedback, setShowTeacherFeedback] = useState(false); // 학생이 선생님 첨삭 보기/숨기기
  const [submissionAlert, setSubmissionAlert] = useState(false); // 선생님에게 제출 알림
  const [feedbackAlert, setFeedbackAlert] = useState(false); // 학생에게 첨삭 알림
  
  // 모달창 상태
  const [isFloatingPanelOpen, setIsFloatingPanelOpen] = useState(false); // 플로팅 패널 열기/닫기
  const [notifications, setNotifications] = useState([]); // 알림 목록
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // const [audioChunks, setAudioChunks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // 사용자 유형 선택 핸들러
  const handleUserTypeSelect = (type) => {
    if (type === 'student') {
      setCurrentPage('login');
    } else if (type === 'teacher') {
      setCurrentPage('teacherLogin');
    } else {
      // Admin 페이지로 이동
      setCurrentPage('admin');
    }
  };

  // 로그인 핸들러
  const handleLogin = () => {
    setCurrentPage('bookList');
  };

  // 강사 로그인 핸들러
  const handleTeacherLogin = () => {
    setCurrentPage('teacherBookList');
  };

  // 교재 선택 핸들러 (교재 목록에서) - 학생 버전
  const handleBookSelect = (url, index) => {
    console.log('학생 교재 선택:', { url, index, file: files[index] }); // 디버깅용
    
    setCurrentPdfUrl(url);
    setActiveFileIndex(index);
    setZoomScale(2.0);
    setCurrentPage('detail');
    setCurrentPageNum(1); // 페이지를 1로 리셋
    
    // 학생 버전에서는 첨삭 모달창을 표시하지 않음
    console.log('학생 버전 - 첨삭 모달창 표시 안함');
  };

  // 강사용 교재 선택 핸들러
  const handleTeacherBookSelect = (url, index) => {
    setCurrentPdfUrl(url);
    setActiveFileIndex(index);
    setZoomScale(2.0);
    setCurrentPageNum(1);
    
    // 교재 선택 시 상세 페이지로 이동
    setCurrentPage('teacherDetail');
  };

  // 강사 제출물 목록으로 이동
  const handleGoToSubmissions = (submission = null) => {
    if (submission) {
      // 제출물이 전달되면 바로 첨삭 상세페이지로 이동
      setSelectedSubmission(submission);
      setCurrentPage('teacherAnnotation');
    } else {
      // 제출물이 없으면 제출물 목록 페이지로 이동
      setCurrentPage('teacherSubmission');
    }
  };


  // 제출물 목록으로 돌아가기 (교재 목록의 제출물 관리 탭으로)
  const handleBackToSubmissions = () => {
    setCurrentPage('teacherBookList');
    setSelectedSubmission(null);
  };

  // 첨삭 저장
  const handleSaveFeedback = (feedback) => {
    // 로컬 스토리지에 저장 (실제로는 서버로 전송)
    localStorage.setItem('teacherFeedback', JSON.stringify(feedback));
    
    // 학생용 피드백 데이터도 저장
    const studentFeedbackData = {
      ...feedback,
      studentName: selectedSubmission?.studentName || '김학생',
      studentId: selectedSubmission?.studentId || 'student1'
    };
    localStorage.setItem('studentFeedback', JSON.stringify(studentFeedbackData));
    
    // 알림 추가
    const newNotification = {
      id: Date.now(),
      type: 'feedback',
      title: '첨삭 완료',
      message: `"${feedback.bookTitle}" 과제 첨삭이 완료되었습니다`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // 제출물 목록으로 돌아가기
    handleBackToSubmissions();
  };

  // 학생 첨삭 확인
  const handleViewStudentFeedback = () => {
    // 로컬 스토리지에서 첨삭 데이터 로드
    const feedback = localStorage.getItem('studentFeedback');
    if (feedback) {
      const feedbackData = JSON.parse(feedback);
      setStudentFeedback(feedbackData);
      setCurrentPage('studentFeedback');
    } else {
      alert('아직 선생님의 첨삭이 없습니다.');
    }
  };

  // 학생 페이지로 돌아가기
  const handleBackToStudentPage = () => {
    setCurrentPage('detail');
    setStudentFeedback(null);
  };




  const handlePrevPage = () => {
    if (currentPageNum > 1) {
      setCurrentPageNum(currentPageNum - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageNum < pageCount) {
      setCurrentPageNum(currentPageNum + 1);
    }
  };

  // 줌 핸들러 (향후 툴바에 추가할 때 사용)
  // const handleZoomIn = () => {
  //   if (zoomScale < 3.0) {
  //     setZoomScale(Math.min(3.0, zoomScale + 0.2));
  //   }
  // };

  // const handleZoomOut = () => {
  //   if (zoomScale > 0.5) {
  //     setZoomScale(Math.max(0.5, zoomScale - 0.2));
  //   }
  // };

  // 도구 및 설정 핸들러
  const handleToolChange = (tool) => setSelectedTool(tool);
  const handleColorChange = (color) => setSelectedColor(color);
  const handleBrushSizeChange = (size) => setBrushSize(size);

  // 녹음 핸들러
  const handleRecordingToggle = async () => {
    if (isRecording) {
      // 녹음 중지
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setIsRecording(false);
        console.log('녹음 중지, 스트로크 데이터:', strokeData);
      }
    } else {
      try {
        // 마이크 권한 요청 및 녹음 시작
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          // setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
          // setAudioChunks([]);
          
          // 스트림 정리
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        // setAudioChunks(chunks);
        setIsRecording(true);
        setStrokeData([]); // 새로운 녹음 시작 시 스트로크 데이터 초기화
        setIsPlaying(false); // 녹음 시작 시 재생 중지
        setIsReplaying(false);
        setReplayProgress(0);
        console.log('녹음 시작');
      } catch (error) {
        console.error('녹음 권한이 거부되었거나 오류가 발생했습니다:', error);
        alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      }
    }
  };

    // 오디오 재생 핸들러 (통합 재생으로 대체됨)
  // const handleAudioPlay = async () => {
  //   // 통합 재생 기능으로 대체됨
  // };

  // 학생이 선생님에게 제출하는 함수
  // 모달창 표시 함수들



  const handleStudentSubmission = () => {
    if (strokeData.length === 0 && !audioUrl) {
      alert('제출할 필기나 녹음이 없습니다.');
      return;
    }
    
    const submission = {
      id: Date.now(),
      studentId: 'student1',
      studentName: '학생',
      timestamp: new Date().toISOString(),
      strokeData: [...strokeData],
      audioUrl: audioUrl,
      bookTitle: files[activeFileIndex]?.title || '교재',
      bookUrl: currentPdfUrl
    };
    
    // 로컬 스토리지에 저장 (실제로는 서버로 전송)
    localStorage.setItem('studentSubmission', JSON.stringify(submission));
    
    // 알림 추가
    const newNotification = {
      id: Date.now(),
      type: 'submission',
      title: '과제 제출 완료',
      message: `"${submission.bookTitle}" 과제가 선생님에게 전송되었습니다`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // 선생님에게 알림 표시
    setSubmissionAlert(true);
    
  };

  // 선생님이 학생에게 첨삭을 전송하는 함수
  const handleTeacherFeedback = () => {
    if (strokeData.length === 0) {
      alert('첨삭할 내용이 없습니다.');
      return;
    }
    
    const feedback = {
      id: Date.now(),
      teacherId: 'teacher1',
      teacherName: '선생님',
      timestamp: new Date().toISOString(),
      feedbackStrokeData: [...strokeData],
      studentSubmissionId: studentSubmission?.id,
      bookTitle: studentSubmission?.bookTitle || '교재',
      bookUrl: studentSubmission?.bookUrl || currentPdfUrl
    };
    
    // 로컬 스토리지에 저장 (실제로는 서버로 전송)
    localStorage.setItem('teacherFeedback', JSON.stringify(feedback));
    
    // 알림 추가
    const newNotification = {
      id: Date.now(),
      type: 'feedback',
      title: '첨삭 완료',
      message: `"${feedback.bookTitle}" 과제 첨삭이 완료되었습니다`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // 학생에게 알림 표시
    setFeedbackAlert(true);
    
    alert('학생에게 첨삭이 전송되었습니다!');
  };

  // 통합 중지 핸들러 (음성 + 필기 재생 중지)
  const handleCombinedStop = () => {
    // 음성 중지
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
    
    // 필기 재생 중지
    setIsReplaying(false);
    setReplayProgress(0);
    
    // 캔버스 초기화
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // 오디오 시간 변경 핸들러
  const handleTimeChange = (newTime) => {
    if (currentAudio && !isNaN(newTime) && isFinite(newTime) && newTime >= 0) {
      currentAudio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 통합 재생 핸들러 (필기 + 음성 동시 재생)
  const handleCombinedReplay = async () => {
    if (strokeData.length === 0 && !audioUrl) {
      alert('재생할 내용이 없습니다.');
      return;
    }

    setIsReplaying(true);
    setReplayProgress(0);
    
    // 캔버스 초기화
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 음성 재생 시작
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        
        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration);
        };
        
        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        
        audio.onerror = (error) => {
          console.error('오디오 재생 오류:', error);
          setIsPlaying(false);
        };
        
        setIsPlaying(true);
        await audio.play();
      } catch (error) {
        console.error('오디오 재생 오류:', error);
        setIsPlaying(false);
      }
    }

    // 필기 스트로크 재생 (음성과 동시에)
    if (strokeData.length > 0) {
      let currentStroke = 0;
      const replayInterval = setInterval(() => {
        if (currentStroke >= strokeData.length) {
          clearInterval(replayInterval);
          setIsReplaying(false);
          setReplayProgress(100);
          return;
        }

        const stroke = strokeData[currentStroke];
        if (canvas) {
          const context = canvas.getContext('2d');
          
          // 스트로크 그리기
          context.beginPath();
          context.lineWidth = stroke.brushSize;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.strokeStyle = stroke.color;
          
          if (stroke.points.length > 1) {
            context.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
              context.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            context.stroke();
          }
        }

        currentStroke++;
        setReplayProgress((currentStroke / strokeData.length) * 100);
      }, 100); // 100ms 간격으로 재생
    } else {
      // 필기가 없으면 음성만 재생
      setIsReplaying(false);
      setReplayProgress(100);
    }
  };

  // 다시 녹음 핸들러
  const handleRerecord = () => {
    if (window.confirm('정말로 다시 녹음하시겠습니까? 현재 녹음과 필기가 모두 삭제됩니다.')) {
      setStrokeData([]);
      // setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setIsPlaying(false);
      setIsReplaying(false);
      setReplayProgress(0);
      // setAudioChunks([]);
      setCurrentAudio(null);
      setAudioDuration(0);
      setCurrentTime(0);
      
      // 녹음 시작
      handleRecordingToggle();
    }
  };

  // 스트로크 데이터 변경 핸들러
  const handleStrokeDataChange = (newStrokeData) => {
    setStrokeData(newStrokeData);
  };

  
  // Undo/Redo 핸들러
  // 실행 취소/다시 실행 핸들러 (이미지 뷰어에서는 사용하지 않음)

  console.log('현재 페이지:', currentPage);
  console.log('현재 선택된 파일:', files[activeFileIndex]);
  console.log('현재 URL:', currentPdfUrl);
  console.log('파일 타입:', files[activeFileIndex]?.type);

  // 로그아웃 핸들러
  const handleLogout = () => {
    setCurrentPage('landing');
  };

  // 페이지별 렌더링
  if (currentPage === 'landing') {
    return <LandingPage onSelectUserType={handleUserTypeSelect} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentPage === 'bookList') {
    return <BookListPage 
      files={files} 
      onBookSelect={handleBookSelect} 
      onBackToLogin={handleLogout}
      feedbackAlert={feedbackAlert}
      setFeedbackAlert={setFeedbackAlert}
      setTeacherFeedback={setTeacherFeedback}
      notifications={notifications}
      setNotifications={setNotifications}
    />;
  }

  if (currentPage === 'teacherLogin') {
    return <TeacherLoginPage onLogin={handleTeacherLogin} />;
  }

  if (currentPage === 'teacherBookList') {
    return <TeacherBookListPage 
      files={files} 
      onBookSelect={handleTeacherBookSelect} 
      onBackToLogin={handleLogout}
      onGoToSubmissions={handleGoToSubmissions}
      notifications={notifications}
      setNotifications={setNotifications}
    />;
  }

  if (currentPage === 'teacherSubmission') {
    return <TeacherSubmissionPage 
      onBackToBookList={() => setCurrentPage('teacherBookList')}
      onViewSubmission={handleGoToSubmissions}
    />;
  }

  if (currentPage === 'teacherAnnotation') {
    return <TeacherAnnotationViewer 
      submission={selectedSubmission}
      onBackToSubmissions={handleBackToSubmissions}
      onSaveFeedback={handleSaveFeedback}
    />;
  }

  if (currentPage === 'studentFeedback') {
    return <StudentFeedbackViewer 
      feedback={studentFeedback}
      onBackToStudentPage={handleBackToStudentPage}
    />;
  }

  if (currentPage === 'admin') {
    return <AdminPage />;
  }

  // 강사용 상세 페이지
  if (currentPage === 'teacherDetail') {
    return (
      <div className="App" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
        {/* 학생 제출 알림창 */}
        {submissionAlert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
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
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>학생 제출 알림</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>새로운 과제가 제출되었습니다</div>
            </div>
            <button
              onClick={() => {
                setSubmissionAlert(false);
                // 학생 제출 데이터 로드
                const submission = localStorage.getItem('studentSubmission');
                if (submission) {
                  const submissionData = JSON.parse(submission);
                  setStudentSubmission(submissionData);
                  // 상세 페이지로 이동
                  setCurrentPage('teacherDetail');
                } else {
                  alert('아직 학생 제출물이 없습니다.');
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              확인
            </button>
          </div>
        )}

        {/* 강사용 통합 헤더 + 툴바 */}
        <div style={{
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
            alignItems: 'center',
            gap: '2rem'
          }}>
            {/* 왼쪽: 네비게이션 + 제목 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => { setCurrentPage('landing'); }}
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
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
                  e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ← 홈으로
              </button>
              <button 
                onClick={() => { setCurrentPage('teacherBookList'); }}
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
                📚 교재목록
              </button>
              <h1 style={{ 
                color: '#1e3a8a', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)'
              }}>
                {files[activeFileIndex]?.title || '교재 상세'} - 강사 모드
              </h1>
            </div>
            
            {/* 중앙: 툴바 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              {/* PDF 페이지 네비게이션 (PDF 파일일 때만 표시) */}
              {isCurrentFilePDF && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px'
                }}>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPageNum <= 1}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: currentPageNum <= 1 ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      color: currentPageNum <= 1 ? '#9ca3af' : '#3b82f6',
                      cursor: currentPageNum <= 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="이전 페이지"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
                  
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: '#1e3a8a',
                    fontFamily: 'var(--font-ui)',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {currentPageNum} / {pageCount}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPageNum >= pageCount}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: currentPageNum >= pageCount ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      color: currentPageNum >= pageCount ? '#9ca3af' : '#3b82f6',
                      cursor: currentPageNum >= pageCount ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="다음 페이지"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* 도구 버튼들 */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['hand', 'pen', 'eraser'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => handleToolChange(tool)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: selectedTool === tool ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
                      background: selectedTool === tool ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                      color: selectedTool === tool ? '#1e3a8a' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title={tool === 'hand' ? '이동' : tool === 'pen' ? '펜' : '지우개'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      {tool === 'hand' && <path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4z"/>}
                      {tool === 'pen' && <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>}
                      {tool === 'eraser' && <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.36z"/>}
                    </svg>
                  </button>
                ))}
              </div>

              {/* 색상 선택 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>색상:</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: selectedColor === color ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
                        background: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 브러시 크기 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>크기:</span>
                <select
                  value={brushSize}
                  onChange={(e) => handleBrushSizeChange(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#1e3a8a',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={1}>1px</option>
                  <option value={3}>3px</option>
                  <option value={5}>5px</option>
                  <option value={8}>8px</option>
                  <option value={12}>12px</option>
                </select>
              </div>
            </div>

            {/* 오른쪽: 강사 모드 표시 + PDF 링크 */}
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 80px)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
        }}>
          <main className="pdf-viewer-container" style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            overflow: 'auto'
          }}>
            {isCurrentFilePDF ? (
              <StaticPDFViewer
                pdfFileName={currentFile.url.replace('/', '')}
                pageNum={currentPageNum}
                zoomScale={zoomScale}
                selectedTool={selectedTool}
                selectedColor={selectedColor}
                brushSize={brushSize}
                onStrokeDataChange={handleStrokeDataChange}
                isRecording={isRecording}
                studentStrokeData={studentSubmission ? studentSubmission.strokeData : null}
                teacherFeedbackData={teacherFeedback ? teacherFeedback.feedbackStrokeData : null}
                showTeacherFeedback={showTeacherFeedback}
                isTeacherMode={true}
                isStudentMode={false}
                onPageCountChange={setPageCount}
              />
            ) : (
              <ImageViewer
                imageUrl={currentPdfUrl}
                zoomScale={zoomScale}
                selectedTool={selectedTool}
                selectedColor={selectedColor}
                brushSize={brushSize}
                onStrokeDataChange={handleStrokeDataChange}
                isRecording={isRecording}
                studentStrokeData={studentSubmission ? studentSubmission.strokeData : null}
                studentAudioUrl={studentSubmission ? studentSubmission.audioUrl : null}
                teacherFeedbackData={teacherFeedback ? teacherFeedback.feedbackStrokeData : null}
                showTeacherFeedback={showTeacherFeedback}
                isTeacherMode={true}
                isStudentMode={false}
              />
            )}
          </main>
        </div>

        {/* 강사용 플로팅 컨트롤 패널 */}
        <div className="floating-panel" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          {/* 플로팅 패널 열기/닫기 버튼 */}
          {!isFloatingPanelOpen && (
            <button
              onClick={() => setIsFloatingPanelOpen(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.95)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          )}

          {isFloatingPanelOpen && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 8px 32px rgba(30, 58, 138, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              minWidth: '220px'
            }}>
              {/* 닫기 버튼 */}
              <button
                onClick={() => setIsFloatingPanelOpen(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(59, 130, 246, 0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
              >
                ×
              </button>
            {/* 학생 제출물 확인 섹션 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e3a8a',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-ui)'
              }}>
                👥 학생 제출물
              </div>
              
              <button
                onClick={() => {
                  // 학생 제출 데이터 로드
                  const submission = localStorage.getItem('studentSubmission');
                  if (submission) {
                    const submissionData = JSON.parse(submission);
                    setStudentSubmission(submissionData);
                    // 상세 페이지로 이동
                    setCurrentPage('teacherDetail');
                  } else {
                    alert('아직 학생 제출물이 없습니다.');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  border: '2px solid #3b82f6',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.borderColor = '#60a5fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  e.target.style.borderColor = '#3b82f6';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  제출물 확인
                </span>
              </button>
            </div>

            {/* AI 첨삭 섹션 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e3a8a',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-ui)'
              }}>
                🤖 AI 첨삭
              </div>

              <button
                onClick={() => setIsAIChatbotOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '2px solid #8b5cf6',
                  color: '#a78bfa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
                  e.target.style.borderColor = '#a78bfa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                  e.target.style.borderColor = '#8b5cf6';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <g opacity="0.9">
                    <rect x="6" y="12" width="1.5" height="3" rx="0.75" fill="currentColor"/>
                    <rect x="8" y="10" width="1.5" height="7" rx="0.75" fill="currentColor"/>
                    <rect x="10" y="8" width="1.5" height="11" rx="0.75" fill="currentColor"/>
                    <rect x="12" y="6" width="1.5" height="15" rx="0.75" fill="currentColor"/>
                    <rect x="14" y="8" width="1.5" height="11" rx="0.75" fill="currentColor"/>
                    <rect x="16" y="10" width="1.5" height="7" rx="0.75" fill="currentColor"/>
                    <rect x="18" y="12" width="1.5" height="3" rx="0.75" fill="currentColor"/>
                  </g>
                  <g opacity="0.8">
                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" fill="currentColor"/>
                  </g>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  AI 첨삭
                </span>
              </button>
            </div>

            {/* 성적 관리 섹션 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e3a8a',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-ui)'
              }}>
                📊 성적 관리
              </div>

              <button
                onClick={() => alert('성적 관리 기능입니다.')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid #10b981',
                  color: '#34d399',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
                  e.target.style.borderColor = '#34d399';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                  e.target.style.borderColor = '#10b981';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12L11 14L15 10"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  성적 입력
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

        {/* AI 챗봇 모달 */}
        <AIChatbot
          isOpen={isAIChatbotOpen}
          onClose={() => setIsAIChatbotOpen(false)}
          bookTitle={files[activeFileIndex]?.title || '교재'}
        />
      </div>
    );
  }

  // 상세 페이지 (기존 뷰어)
  return (
    <div className="App">
      {/* 선생님 첨삭 알림창 */}
      {feedbackAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
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
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>선생님 첨삭 도착</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>새로운 첨삭이 도착했습니다</div>
          </div>
          <button
            onClick={() => {
              setFeedbackAlert(false);
              // 상세 페이지로 이동
              setCurrentPage('detail');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            확인
          </button>
        </div>
      )}

      {/* 통합 헤더 + 툴바 */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
        padding: '1rem 2rem',
        borderBottom: '3px solid #f97316',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto',
          gap: '2rem'
        }}>
          {/* 왼쪽: 네비게이션 + 제목 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => {
                setCurrentPage('landing');
              }}
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
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
              ← 홈으로
            </button>
            <button
              onClick={() => {
                setCurrentPage('bookList');
              }}
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
              📚 교재목록
            </button>
            <h1 style={{
              fontFamily: "'SEBANG Gothic', sans-serif",
              fontWeight: '700',
              fontSize: '1.5rem',
              color: '#1e293b',
              margin: '0',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {files[activeFileIndex]?.title || '교재 상세'}
            </h1>
          </div>
          
          {/* 중앙: 툴바 */}
          <div className="toolbar" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(249, 115, 22, 0.2)'
          }}>
            {/* PDF 페이지 네비게이션 (PDF 파일일 때만 표시) */}
            {isCurrentFilePDF && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginRight: '1rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderRadius: '8px'
              }}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageNum <= 1}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    background: currentPageNum <= 1 ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: currentPageNum <= 1 ? '#9ca3af' : '#f97316',
                    cursor: currentPageNum <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="이전 페이지"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#ea580c',
                  fontFamily: 'var(--font-ui)',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {currentPageNum} / {pageCount}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPageNum >= pageCount}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    background: currentPageNum >= pageCount ? 'rgba(156, 163, 175, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                    color: currentPageNum >= pageCount ? '#9ca3af' : '#f97316',
                    cursor: currentPageNum >= pageCount ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="다음 페이지"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            )}

            {/* 도구 버튼들 */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['hand', 'pen', 'eraser'].map((tool) => (
                <button
                  key={tool}
                  onClick={() => handleToolChange(tool)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: selectedTool === tool ? '2px solid #f97316' : '1px solid #e2e8f0',
                    background: selectedTool === tool ? '#fff7ed' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title={tool === 'hand' ? '손' : tool === 'pen' ? '펜' : '지우개'}
                >
                  {tool === 'hand' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#64748b' }}>
                      <path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4z"/>
                    </svg>
                  )}
                  {tool === 'pen' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#64748b' }}>
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  )}
                  {tool === 'eraser' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#64748b' }}>
                      <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.36z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            {/* 색상 선택 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-ui)' }}>색상:</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  width: '30px',
                  height: '30px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            {/* 브러시 크기 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-ui)' }}>크기:</span>
              <select
                value={brushSize}
                onChange={(e) => handleBrushSizeChange(Number(e.target.value))}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-ui)',
                  background: 'white'
                }}
              >
                <option value={1}>1px</option>
                <option value={3}>3px</option>
                <option value={5}>5px</option>
                <option value={8}>8px</option>
                <option value={12}>12px</option>
              </select>
            </div>
          </div>
          
          {/* 오른쪽: 학습 모드 표시 */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontFamily: "'SEBANG Gothic', sans-serif",
              fontSize: '0.875rem',
              color: '#64748b',
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px'
            }}>
              학습 모드
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)'
      }}>
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          overflow: 'hidden'
        }}>
          {isCurrentFilePDF ? (
            <StaticPDFViewer
              pdfFileName={currentFile.url.replace('/', '')}
              pageNum={currentPageNum}
              zoomScale={zoomScale}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              onStrokeDataChange={handleStrokeDataChange}
              isRecording={isRecording}
              teacherFeedbackData={teacherFeedback ? teacherFeedback.feedbackStrokeData : null}
              showTeacherFeedback={showTeacherFeedback}
              isTeacherMode={false}
              isStudentMode={true}
              onPageCountChange={setPageCount}
            />
          ) : (
            <ImageViewer 
              imageUrl={currentPdfUrl}
              zoomScale={zoomScale}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              onStrokeDataChange={handleStrokeDataChange}
              isRecording={isRecording}
              studentStrokeData={null}
              studentAudioUrl={null}
              teacherFeedbackData={teacherFeedback ? teacherFeedback.feedbackStrokeData : null}
              showTeacherFeedback={showTeacherFeedback}
              isTeacherMode={false}
              isStudentMode={true}
            />
          )}
        </main>
      </div>
      
      {/* 플로팅 컨트롤 패널 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        {/* 플로팅 패널 열기/닫기 버튼 */}
        {!isFloatingPanelOpen && (
          <button
            onClick={() => setIsFloatingPanelOpen(true)}
            style={{
              background: 'rgba(31, 41, 55, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = 'rgba(31, 41, 55, 1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.95)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        )}

        {isFloatingPanelOpen && (
          <div style={{
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            minWidth: '220px'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsFloatingPanelOpen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(75, 85, 99, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          {/* 녹음 컨트롤 섹션 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#f3f4f6',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)'
            }}>
              🎙️ 녹음 & 재생
            </div>
            
            {/* 녹음 버튼 */}
            <button
              onClick={handleRecordingToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: isRecording ? '#1f2937' : '#374151',
                border: isRecording ? '2px solid #fbbf24' : '2px solid #6b7280',
                color: isRecording ? '#fbbf24' : '#f3f4f6',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animation: isRecording ? 'pulse 2s infinite' : 'none',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isRecording) {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRecording) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.borderColor = '#6b7280';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                {isRecording ? '녹음 중지' : '녹음 시작'}
              </span>
            </button>

            {/* 오디오 컨트롤 */}
            {audioUrl && !isRecording && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                width: '100%'
              }}>
                {/* 재생/중지 버튼 */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={handleCombinedReplay}
                    disabled={isPlaying || isReplaying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1f2937',
                      border: '2px solid #8b5cf6',
                      color: (isPlaying || isReplaying) ? '#6b7280' : '#8b5cf6',
                      cursor: (isPlaying || isReplaying) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (isPlaying || isReplaying) ? 0.6 : 1,
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isPlaying && !isReplaying) {
                        e.target.style.backgroundColor = '#111827';
                        e.target.style.borderColor = '#a78bfa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPlaying && !isReplaying) {
                        e.target.style.backgroundColor = '#1f2937';
                        e.target.style.borderColor = '#8b5cf6';
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                      재생
                    </span>
                  </button>
                  
                  <button
                    onClick={handleCombinedStop}
                    disabled={!isPlaying && !isReplaying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1f2937',
                      border: '2px solid #ef4444',
                      color: (!isPlaying && !isReplaying) ? '#6b7280' : '#ef4444',
                      cursor: (!isPlaying && !isReplaying) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (!isPlaying && !isReplaying) ? 0.6 : 1,
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (isPlaying || isReplaying) {
                        e.target.style.backgroundColor = '#111827';
                        e.target.style.borderColor = '#f87171';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isPlaying || isReplaying) {
                        e.target.style.backgroundColor = '#1f2937';
                        e.target.style.borderColor = '#ef4444';
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                      중지
                    </span>
                  </button>
                </div>

                {/* 오디오 프로그레스 바 */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: '#9ca3af',
                    fontFamily: 'var(--font-ui)'
                  }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#374151',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={(e) => {
                    if (audioDuration > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                      const newTime = percentage * audioDuration;
                      handleTimeChange(newTime);
                    }
                  }}
                  >
                    <div style={{
                      width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                      transition: 'width 0.1s ease',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '12px',
                        height: '12px',
                        background: '#8b5cf6',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 통합 재생 버튼 (필기 + 음성) */}
            {(audioUrl || strokeData.length > 0) && !isRecording && (
              <button
                onClick={handleCombinedReplay}
                disabled={isReplaying || isPlaying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #f59e0b',
                  color: (isReplaying || isPlaying) ? '#6b7280' : '#f59e0b',
                  cursor: (isReplaying || isPlaying) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (isReplaying || isPlaying) ? 0.6 : 1,
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isReplaying && !isPlaying) {
                    e.target.style.backgroundColor = '#111827';
                    e.target.style.borderColor = '#fbbf24';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isReplaying && !isPlaying) {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.borderColor = '#f59e0b';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  {(isReplaying || isPlaying) ? '재생 중...' : '학습 재생'}
                </span>
              </button>
            )}
          </div>

          {/* 액션 섹션 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#f3f4f6',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)'
            }}>
              ⚡ 액션
            </div>

            {/* 다시 녹음 버튼 */}
            {(audioUrl || strokeData.length > 0) && !isRecording && (
              <button
                onClick={handleRerecord}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #ef4444',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#111827';
                  e.target.style.borderColor = '#f87171';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#ef4444';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  다시 녹음
                </span>
              </button>
            )}

            {/* 학생 제출 버튼 (학생 모드) */}
            {(strokeData.length > 0 || audioUrl) && !isRecording && !studentSubmission && (
              <button
                onClick={handleStudentSubmission}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #10b981',
                  color: '#34d399',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#111827';
                  e.target.style.borderColor = '#34d399';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#10b981';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  선생님에게 제출
                </span>
              </button>
            )}

            {/* 첨삭 확인 버튼 (선생님 모드) */}
            {currentPage === 'teacherDetail' && (
              <button
                onClick={() => {
                  // 상세 페이지로 이동
                  setCurrentPage('teacherDetail');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #ef4444',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#111827';
                  e.target.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#ef4444';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  첨삭 확인 및 작성
                </span>
              </button>
            )}

            {/* 첨삭 전송 버튼 (선생님 모드) */}
            {strokeData.length > 0 && !isRecording && studentSubmission && (
              <button
                onClick={handleTeacherFeedback}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #3b82f6',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#111827';
                  e.target.style.borderColor = '#60a5fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#3b82f6';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  학생에게 첨삭 전송
                </span>
              </button>
            )}
          </div>

                      {/* 선생님 첨삭 on/off 버튼 */}
            {teacherFeedback && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#f3f4f6',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-ui)'
                }}>
                  선생님 첨삭
                </div>

                <button
                  onClick={() => setShowTeacherFeedback(!showTeacherFeedback)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: '#1f2937',
                    border: showTeacherFeedback ? '2px solid #10b981' : '2px solid #6b7280',
                    color: showTeacherFeedback ? '#10b981' : '#f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#111827';
                    e.target.style.borderColor = showTeacherFeedback ? '#10b981' : '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.borderColor = showTeacherFeedback ? '#10b981' : '#6b7280';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                    {showTeacherFeedback ? '첨삭 숨기기' : '첨삭 보기'}
                  </span>
                </button>
              </div>
            )}

            {/* 첨삭 확인하기 버튼 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#f3f4f6',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-ui)'
              }}>
                첨삭 확인
              </div>

              <button
                onClick={handleViewStudentFeedback}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #8b5cf6',
                  color: '#8b5cf6',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#111827';
                  e.target.style.borderColor = '#a78bfa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#8b5cf6';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  첨삭 확인하기
                </span>
              </button>
            </div>

          {/* AI 섹션 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#f3f4f6',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)'
            }}>
              🤖 AI 도우미
            </div>

            <button
              onClick={() => {
                console.log('AI 버튼 클릭');
                setIsAIChatbotOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#1f2937',
                border: '2px solid #4b5563',
                color: '#f3f4f6',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#111827';
                e.target.style.borderColor = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1f2937';
                e.target.style.borderColor = '#4b5563';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <g opacity="0.9">
                  <rect x="6" y="12" width="1.5" height="3" rx="0.75" fill="currentColor"/>
                  <rect x="8" y="10" width="1.5" height="7" rx="0.75" fill="currentColor"/>
                  <rect x="10" y="8" width="1.5" height="11" rx="0.75" fill="currentColor"/>
                  <rect x="12" y="6" width="1.5" height="15" rx="0.75" fill="currentColor"/>
                  <rect x="14" y="8" width="1.5" height="11" rx="0.75" fill="currentColor"/>
                  <rect x="16" y="10" width="1.5" height="7" rx="0.75" fill="currentColor"/>
                  <rect x="18" y="12" width="1.5" height="3" rx="0.75" fill="currentColor"/>
                </g>
                <g opacity="0.8">
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" fill="currentColor"/>
                </g>
              </svg>
              <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                AI 챗봇
              </span>
            </button>
          </div>
          </div>
        )}
      </div>

      {/* 재생 진행률 인디케이터 */}
      {isReplaying && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          background: 'rgba(31, 41, 55, 0.9)',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          minWidth: '200px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#f59e0b',
              animation: 'pulse 1s infinite'
            }}></div>
            <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-ui)' }}>
              필기 재생 중...
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            background: '#374151',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${replayProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              transition: 'width 0.1s ease'
            }}></div>
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#9ca3af',
            marginTop: '0.25rem',
            textAlign: 'center',
            fontFamily: 'var(--font-ui)'
          }}>
            {Math.round(replayProgress)}% 완료
          </div>
        </div>
      )}

      {/* AI 챗봇 모달 */}
      <AIChatbot
        isOpen={isAIChatbotOpen}
        onClose={() => setIsAIChatbotOpen(false)}
        bookTitle={files[activeFileIndex]?.title || '교재'}
      />


      {/* CSS 애니메이션 및 반응형 스타일 */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.4), 0 0 0 4px rgba(251, 191, 36, 0.2);
          }
          50% {
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.6), 0 0 0 8px rgba(251, 191, 36, 0.1);
          }
          100% {
            box-shadow: 0 4px 12px rgba(31, 41, 55, 0.4), 0 0 0 4px rgba(251, 191, 36, 0.2);
          }
        }

        /* 아이패드용 반응형 스타일 */
        @media (max-width: 1024px) and (min-width: 768px) {
          .pdf-viewer-container {
            padding: 0.5rem !important;
          }
          
          .pdf-canvas {
            max-width: 100% !important;
            height: auto !important;
          }
          
          .floating-panel {
            position: fixed !important;
            bottom: 1rem !important;
            right: 1rem !important;
            left: 1rem !important;
            width: auto !important;
            max-width: none !important;
            padding: 1rem !important;
          }
          
          .toolbar {
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
            padding: 0.75rem !important;
          }
          
          .toolbar-button {
            min-width: 44px !important;
            min-height: 44px !important;
            padding: 0.5rem !important;
            font-size: 0.875rem !important;
          }
          
          .modal-content {
            max-width: 95% !important;
            max-height: 90% !important;
            padding: 1.5rem !important;
            margin: 1rem !important;
          }
          
          .modal-title {
            font-size: 1.5rem !important;
          }
          
          .modal-button {
            padding: 0.75rem 1.5rem !important;
            font-size: 1rem !important;
            min-height: 44px !important;
          }
        }

        /* 모바일용 반응형 스타일 */
        @media (max-width: 767px) {
          .pdf-viewer-container {
            padding: 0.25rem !important;
          }
          
          .floating-panel {
            position: fixed !important;
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            left: 0.5rem !important;
            width: auto !important;
            max-width: none !important;
            padding: 0.75rem !important;
          }
          
          .toolbar {
            flex-wrap: wrap !important;
            gap: 0.25rem !important;
            padding: 0.5rem !important;
          }
          
          .toolbar-button {
            min-width: 40px !important;
            min-height: 40px !important;
            padding: 0.375rem !important;
            font-size: 0.75rem !important;
          }
          
          .modal-content {
            max-width: 98% !important;
            max-height: 95% !important;
            padding: 1rem !important;
            margin: 0.5rem !important;
          }
          
          .modal-title {
            font-size: 1.25rem !important;
          }
          
          .modal-button {
            padding: 0.625rem 1rem !important;
            font-size: 0.875rem !important;
            min-height: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
