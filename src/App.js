import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import BookListPage from './components/BookListPage';
import EnhancedPDFViewer from './components/EnhancedPDFViewer';
import ImageViewer from './components/ImageViewer';
import AIChatbot from './components/AIChatbot';

function App() {
  console.log('App 컴포넌트 렌더링 시작');
  
  // 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'bookList', 'detail'
  // const [userType, setUserType] = useState(null); // 'admin', 'teacher', 'student' - 현재 사용하지 않음
  const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // 현재 사용하지 않음
  
  // 이미지 파일 목록 - 모든 파일을 이미지로 설정
  const files = [
    { 
      id: 1, 
      title: '21년 1학기 과학 - 동물들의 생활', 
      url: 'https://picsum.photos/600/800?random=2',
      type: 'image'
    },
    { 
      id: 2, 
      title: '사고력 도형특강 3과정 (NEW)', 
      url: 'https://picsum.photos/600/800?random=1',
      type: 'image'
    },
    { 
      id: 3, 
      title: '22년 1학기 수학 - 개념 셀프북', 
      url: 'https://picsum.photos/600/800?random=3',
      type: 'image'
    },
    { 
      id: 4, 
      title: '21년 2학기 과학 - 물의 여행', 
      url: 'https://picsum.photos/600/800?random=4',
      type: 'image'
    },
  ];

  // 상태 관리
  const [currentPdfUrl, setCurrentPdfUrl] = useState(files[0].url);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  // const [pageCount, setPageCount] = useState(1); // 현재 사용하지 않음
  const [zoomScale, setZoomScale] = useState(2.0);
  const [selectedTool, setSelectedTool] = useState('hand');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  
  // 녹음 및 스트로크 데이터 상태
  const [isRecording, setIsRecording] = useState(false);
  const [strokeData, setStrokeData] = useState([]);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  
  // 재생 관련 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // 사용자 유형 선택 핸들러
  const handleUserTypeSelect = (type) => {
    if (type === 'student') {
      setCurrentPage('login');
    } else {
      // Admin과 Teacher는 데모 페이지로 (향후 구현)
      alert(`${type === 'admin' ? 'Admin' : '강사'} 데모는 준비 중입니다!`);
    }
  };

  // 로그인 핸들러
  const handleLogin = () => {
    setCurrentPage('bookList');
  };

  // 교재 선택 핸들러 (교재 목록에서)
  const handleBookSelect = (url, index) => {
    setCurrentPdfUrl(url);
    setActiveFileIndex(index);
    setPageNum(1);
    setZoomScale(2.0);
    setCurrentPage('detail');
    
    // 이미지 파일인 경우 페이지 수를 1로 설정
    // if (files[index]?.type === 'image') {
    //   setPageCount(1);
    // }
  };


  // 페이지 네비게이션 핸들러 (이미지 뷰어에서는 사용하지 않음)

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
        setRecordingStartTime(null);
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
          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
          setAudioChunks([]);
          
          // 스트림 정리
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setAudioChunks(chunks);
        setIsRecording(true);
        setRecordingStartTime(new Date());
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

  // 오디오 재생 핸들러
  const handleAudioPlay = async () => {
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
          alert('오디오 재생에 실패했습니다.');
        };
        
        setIsPlaying(true);
        await audio.play();
      } catch (error) {
        console.error('오디오 재생 오류:', error);
        setIsPlaying(false);
        alert('오디오 재생에 실패했습니다.');
      }
    }
  };

  // 오디오 중지 핸들러
  const handleAudioStop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
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

  // 필기 스트로크 재생 핸들러 (노타빌리티 스타일)
  const handleStrokeReplay = () => {
    if (strokeData.length === 0) {
      alert('재생할 필기가 없습니다.');
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

    // 스트로크를 순서대로 재생
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
  };

  // 다시 녹음 핸들러
  const handleRerecord = () => {
    if (window.confirm('정말로 다시 녹음하시겠습니까? 현재 녹음과 필기가 모두 삭제됩니다.')) {
      setStrokeData([]);
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setIsPlaying(false);
      setIsReplaying(false);
      setReplayProgress(0);
      setAudioChunks([]);
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

  // 선생님에게 제출 핸들러
  const handleSubmitToTeacher = () => {
    if (strokeData.length === 0) {
      alert('제출할 필기 내용이 없습니다. 먼저 문제를 풀어보세요!');
      return;
    }

    const submissionData = {
      studentId: 'student_001', // 실제로는 로그인한 학생 ID
      bookTitle: files[activeFileIndex]?.title || '교재',
      bookUrl: currentPdfUrl,
      strokeData: strokeData,
      recordingStartTime: recordingStartTime,
      recordingEndTime: new Date(),
      submissionTime: new Date().toISOString(),
      totalStrokes: strokeData.length,
      recordingDuration: recordingStartTime ? 
        Math.round((new Date() - recordingStartTime) / 1000) : 0
    };

    // 실제로는 서버에 제출
    console.log('선생님에게 제출:', submissionData);
    
    // 로컬 스토리지에 저장 (데모용)
    const existingSubmissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');
    existingSubmissions.push(submissionData);
    localStorage.setItem('studentSubmissions', JSON.stringify(existingSubmissions));

    alert(`✅ 제출 완료!\n\n📚 교재: ${submissionData.bookTitle}\n✏️ 필기 횟수: ${submissionData.totalStrokes}회\n🎤 녹음 시간: ${submissionData.recordingDuration}초\n\n선생님이 확인 후 피드백을 드릴게요!`);
    
    // 제출 후 데이터 초기화
    setStrokeData([]);
    setIsRecording(false);
    setRecordingStartTime(null);
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
    return <BookListPage files={files} onBookSelect={handleBookSelect} onBackToLogin={handleLogout} />;
  }

  // 상세 페이지 (기존 뷰어)
  return (
    <div className="App">
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
              ← 홈으로
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(249, 115, 22, 0.2)'
          }}>
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
          {files[activeFileIndex]?.type === 'image' ? (
            <ImageViewer 
              imageUrl={currentPdfUrl}
              zoomScale={zoomScale}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              onStrokeDataChange={handleStrokeDataChange}
              isRecording={isRecording}
            />
          ) : (
            <EnhancedPDFViewer 
              pdfUrl={currentPdfUrl}
              pageNum={pageNum}
              zoomScale={zoomScale}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
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
        <div style={{
          background: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          minWidth: '220px'
        }}>
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
                    onClick={handleAudioPlay}
                    disabled={isPlaying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1f2937',
                      border: '2px solid #8b5cf6',
                      color: isPlaying ? '#6b7280' : '#8b5cf6',
                      cursor: isPlaying ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isPlaying ? 0.6 : 1,
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isPlaying) {
                        e.target.style.backgroundColor = '#111827';
                        e.target.style.borderColor = '#a78bfa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPlaying) {
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
                    onClick={handleAudioStop}
                    disabled={!isPlaying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1f2937',
                      border: '2px solid #ef4444',
                      color: !isPlaying ? '#6b7280' : '#ef4444',
                      cursor: !isPlaying ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: !isPlaying ? 0.6 : 1,
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (isPlaying) {
                        e.target.style.backgroundColor = '#111827';
                        e.target.style.borderColor = '#f87171';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isPlaying) {
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

            {strokeData.length > 0 && !isRecording && (
              <button
                onClick={handleStrokeReplay}
                disabled={isReplaying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #f59e0b',
                  color: isReplaying ? '#6b7280' : '#f59e0b',
                  cursor: isReplaying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isReplaying ? 0.6 : 1,
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isReplaying) {
                    e.target.style.backgroundColor = '#111827';
                    e.target.style.borderColor = '#fbbf24';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isReplaying) {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.borderColor = '#f59e0b';
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-ui)' }}>
                  {isReplaying ? '재생 중...' : '필기 재생'}
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

            {/* 제출 버튼 */}
            {strokeData.length > 0 && !isRecording && (
              <button
                onClick={handleSubmitToTeacher}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #059669',
                  color: '#10b981',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#111827';
                  e.target.style.borderColor = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.borderColor = '#059669';
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

      {/* CSS 애니메이션 */}
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
      `}</style>
    </div>
  );
}

export default App;
