import React, { useState, useCallback, useMemo, useRef } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import BookListPage from './components/BookListPage';
import ImageViewer from './components/ImageViewer';
import StaticPDFViewer from './components/StaticPDFViewer';
import AIChatbot from './components/AIChatbot';
import TeacherLoginPage from './components/TeacherLoginPage';
import TeacherBookListPage from './components/TeacherBookListPage';
import TeacherAnnotationViewer from './components/TeacherAnnotationViewer';
import TeacherSubmissionViewer from './components/TeacherSubmissionViewer';
import TeacherFeedbackCards from './components/TeacherFeedbackCards';
import AdminPage from './components/AdminPage';

import { Base64 } from 'js-base64';
import * as commonJs from './component/CommonJs';
import { API_RES_CODE,  } from './component/AppConstants';
import CommonUtils from './utils/CommonUtils';

function App() {
  console.log('App 컴포넌트 렌더링 시작');

  // 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'bookList', 'detail', 'teacherAnnotation', 'teacherFeedbackCards', 'teacherSubmission'
  // const [userType, setUserType] = useState(null); // 'admin', 'teacher', 'student' - 현재 사용하지 않음
  const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false);

  // PDF Viewer ref (AIChatbot에서 캔버스 접근용)
  const pdfViewerRef = useRef(null);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // 현재 사용하지 않음
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // AI 채점 관련 상태
  const [isAIGrading, setIsAIGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  const [gradingProgress, setGradingProgress] = useState(0);

  // 기존 선생님 첨삭 데이터 로드
  React.useEffect(() => {
    const savedFeedback = localStorage.getItem('teacherFeedback');
    const savedFeedbacks = localStorage.getItem('teacherFeedbacks');
    const savedTeacherFeedbackData = localStorage.getItem('teacherFeedbackData');

    if (savedFeedback) {
      try {
        const feedbackData = JSON.parse(savedFeedback);
        setTeacherFeedback(feedbackData);
      } catch (error) {
        console.error('선생님 첨삭 데이터 로드 실패:', error);
      }
    }

    // 강사 첨삭 데이터 로드 (페이지별 필기 포함)
    if (savedTeacherFeedbackData) {
      try {
        const teacherData = JSON.parse(savedTeacherFeedbackData);
        console.log('저장된 강사 첨삭 데이터 로드됨:', teacherData);
        // 필요시 추가 처리
      } catch (error) {
        console.error('강사 첨삭 데이터 로드 실패:', error);
      }
    }

    if (savedFeedbacks) {
      try {
        const feedbacksData = JSON.parse(savedFeedbacks);
        setTeacherFeedbacks(feedbacksData);
      } catch (error) {
        console.error('선생님 첨삭 목록 로드 실패:', error);
      }
    } else {
      // 데모용 샘플 첨삭 데이터 생성
      const demoFeedbacks = [
        {
          id: Date.now() - 86400000, // 1일 전
          teacherId: 'teacher1',
          teacherName: '김선생님',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#ef4444',
              brushSize: 3,
              points: [
                { x: 100, y: 200 },
                { x: 150, y: 200 },
                { x: 200, y: 200 }
              ],
              timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
              type: 'text',
              content: '아주 잘했어요!',
              color: '#ef4444',
              x: 100,
              y: 220,
              fontSize: 16,
              timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
              type: 'text',
              content: '눈금을 그리면 더 좋을 것 같아요',
              color: '#ef4444',
              x: 100,
              y: 250,
              fontSize: 14,
              timestamp: new Date(Date.now() - 86400000).toISOString()
            },
          ],
          studentSubmissionId: 'demo1',
          bookTitle: '2023 프리미어 초급2',
          bookUrl: '/somapremier.pdf'
        },
        {
          id: Date.now() - 172800000, // 2일 전
          teacherId: 'teacher2',
          teacherName: '이선생님',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#3b82f6',
              brushSize: 2,
              points: [
                { x: 80, y: 180 },
                { x: 120, y: 180 },
                { x: 160, y: 180 },
                { x: 200, y: 180 }
              ],
              timestamp: new Date(Date.now() - 172800000).toISOString()
            },
            {
              type: 'text',
              content: '정답입니다!',
              color: '#3b82f6',
              x: 80,
              y: 200,
              fontSize: 16,
              timestamp: new Date(Date.now() - 172800000).toISOString()
            },
            {
              type: 'text',
              content: '계속 열심히 해주세요',
              color: '#3b82f6',
              x: 80,
              y: 230,
              fontSize: 14,
              timestamp: new Date(Date.now() - 172800000).toISOString()
            }
          ],
          studentSubmissionId: 'demo2',
          bookTitle: '2023 프리미어 초급2',
          bookUrl: '/somapremier.pdf'
        },
        {
          id: Date.now() - 3600000, // 1시간 전 (신규)
          teacherId: 'teacher1',
          teacherName: '김선생님',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          feedbackStrokeData: [
            {
              type: 'stroke',
              tool: 'pen',
              color: '#10b981',
              brushSize: 4,
              points: [
                { x: 90, y: 220 },
                { x: 140, y: 220 },
                { x: 190, y: 220 }
              ],
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              type: 'stroke',
              tool: 'pen',
              color: '#8b5cf6',
              brushSize: 3,
              points: [
                { x: 110, y: 320 },
                { x: 160, y: 320 },
                { x: 210, y: 320 }
              ],
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              type: 'text',
              content: '훌륭해요!',
              color: '#10b981',
              x: 90,
              y: 240,
              fontSize: 16,
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              type: 'text',
              content: '이 부분을 더 자세히 설명해보세요',
              color: '#10b981',
              x: 90,
              y: 270,
              fontSize: 14,
              timestamp: new Date(Date.now() - 3600000).toISOString()
            }
          ],
          studentSubmissionId: 'demo3',
          bookTitle: '2023 프리미어 초급2',
          bookUrl: '/somapremier.pdf'
        }
      ];

      setTeacherFeedbacks(demoFeedbacks);
      localStorage.setItem('teacherFeedbacks', JSON.stringify(demoFeedbacks));

      // 가장 최신 첨삭을 단일 첨삭으로도 설정
      setTeacherFeedback(demoFeedbacks[0]);
      localStorage.setItem('teacherFeedback', JSON.stringify(demoFeedbacks[0]));
    }
  }, []);

  // 파일 목록 - 소마 프리미어 교재들
<<<<<<< Updated upstream
  const baseFiles = [
    { 
=======
  const files = [
    {
>>>>>>> Stashed changes
      id: 1,
      title: '2023 소마 프리미어 초급2',
      url: '/assets/pdf/2023-프리미어 초급2-내지_DEMO_compressed.pdf',
      type: 'pdf'
    },
    {
      id: 2,
      title: '2023 소마 프리미어',
      url: '/assets/pdf/mvp_2023_소마_프리미어.pdf',
      type: 'pdf'
    },
    {
      id: 3,
      title: '2023 미래탐구 수학중3-1응용심화 셀프북 교사용',
      url: '/assets/pdf/mvp_2022_미래탐구_수학중3-1응용심화_셀프북_교사용.pdf',
      type: 'pdf'
    }
  ];
  
  // 업로드된 교재 목록 로드 (localStorage에서)
  const uploadedBooks = (() => {
    try {
      const saved = localStorage.getItem('uploadedBooks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('업로드된 교재 로드 오류:', error);
      return [];
    }
  })();
  
  // 기본 교재 + 업로드된 교재 합치기
  const files = [
    ...baseFiles,
    ...uploadedBooks.map((book, index) => ({
      id: baseFiles.length + index + 1,
      title: book.title,
      url: book.url,
      type: 'pdf'
    }))
  ];

  // 상태 관리
  const [currentPdfUrl, setCurrentPdfUrl] = useState(files[0].url); // 첫 번째 파일을 기본으로
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // 현재 선택된 파일 정보 (메모이제이션)
  const currentFile = useMemo(() => files[activeFileIndex], [files, activeFileIndex]);
  const isCurrentFilePDF = useMemo(() => currentFile && currentFile.type === 'pdf', [currentFile]);
  const [pageCount, setPageCount] = useState(1);
  const [currentPageNum, setCurrentPageNum] = useState(1);
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
  const [enableStrokeAnimation, setEnableStrokeAnimation] = useState(true); // 스트로크 애니메이션 활성화
  // const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // 학생-선생님 소통 관련 상태
  const [studentSubmission, setStudentSubmission] = useState(null); // 학생 제출 데이터
  const [teacherFeedback, setTeacherFeedback] = useState(null); // 선생님 첨삭 데이터 (단일)
  const [teacherFeedbacks, setTeacherFeedbacks] = useState([]); // 선생님 첨삭 목록 (다중)
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

  // 강사용 제출물 보기 핸들러
  const handleGoToSubmissions = (submission) => {
    console.log('제출물 보기:', submission);
    setSelectedSubmission(submission);
    setCurrentPage('teacherSubmission');
  };

  const handlePrevPage = useCallback(() => {
    if (currentPageNum > 1) {
      setCurrentPageNum(currentPageNum - 1);
    }
  }, [currentPageNum]);

  const handleNextPage = useCallback(() => {
    if (currentPageNum < pageCount) {
      setCurrentPageNum(currentPageNum + 1);
    }
  }, [currentPageNum, pageCount]);

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

  // 도구 및 설정 핸들러 (메모이제이션)
  const handleToolChange = useCallback((tool) => setSelectedTool(tool), []);
  const handleColorChange = useCallback((color) => setSelectedColor(color), []);
  const handleBrushSizeChange = useCallback((size) => setBrushSize(size), []);

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
        setRecordingStartTime(Date.now()); // 녹음 시작 시간 기록

        // 기존 스트로크에서 녹음 스트로크만 제거 (녹음 전 펜 그림은 유지, 지우개는 제거)
        setStrokeData(prev => {
          const nonRecordingStrokes = prev.filter(stroke => {
            // isRecording: true 스트로크는 제거 (이전 녹음)
            // 지우개 스트로크도 제거 (지우개는 항상 일회성 작업)
            return !stroke.isRecording && stroke.tool !== 'eraser';
          });
          console.log('🔄 녹음 재시작: 이전 녹음 & 지우개 제거, 유지할 스트로크 수:', nonRecordingStrokes.length);
          return nonRecordingStrokes;
        });

        setIsPlaying(false); // 녹음 시작 시 재생 중지
        setIsReplaying(false);
        setReplayProgress(0);
        console.log('🎙️ 녹음 시작');
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

    // 오디오를 Base64로 변환하여 저장
    const convertAudioToBase64 = async () => {
      if (!audioUrl) return null;

      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('오디오 변환 오류:', error);
        return null;
      }
    };

    // 비동기 처리
    convertAudioToBase64().then(audioBase64 => {
      const submission = {
        id: Date.now(),
        studentId: Base64.decode(window.sessionStorage.getItem("noma@login_id")),
        studentName: Base64.decode(window.sessionStorage.getItem("noma@mem_name")),
        timestamp: new Date().toISOString(),
        strokeData: [...strokeData], // 모든 스트로크 데이터 (타임스탬프 포함)
        audioUrl: audioUrl, // Blob URL (임시)
        audioBase64: audioBase64, // Base64 인코딩된 오디오 (영구 저장)
        recordingStartTime: recordingStartTime, // 녹음 시작 시간 (타임스탬프 계산용)
        currentPage: currentPageNum, // 제출 시 현재 PDF 페이지 번호 (수정!)
        bookTitle: files[activeFileIndex]?.title || '교재',
        bookUrl: currentPdfUrl,
        pdfFileName: currentPdfUrl // PDF 파일 경로
      };

      console.log('📤 학생 제출 데이터:', {
        strokeCount: submission.strokeData.length,
        hasAudio: !!submission.audioBase64,
        recordingStartTime: submission.recordingStartTime,
        currentPage: submission.currentPage,
        pdfFileName: submission.pdfFileName
      });

      // 기존 제출 목록 가져오기
      const existingSubmissions = JSON.parse(localStorage.getItem('studentSubmissions') || '[]');

      // 새 제출 추가
      const newSubmissions = [submission, ...existingSubmissions];

      // 로컬 스토리지에 저장 (여러 제출 관리)
      localStorage.setItem('studentSubmissions', JSON.stringify(newSubmissions));
      localStorage.setItem('studentSubmission', JSON.stringify(submission)); // 최신 제출 (하위 호환)

      // 저장 확인 (디버깅)
      const savedCheck = localStorage.getItem('studentSubmissions');
      console.log('💾 localStorage 저장 확인:', savedCheck ? `${JSON.parse(savedCheck).length}개 저장됨` : '저장 실패!');
      console.log('저장된 전체 데이터:', JSON.parse(savedCheck || '[]'));

      // 알림 추가
      const newNotification = {
        id: Date.now(),
        type: 'submission',
        title: '과제 제출 완료',
        message: `"${submission.bookTitle}" 페이지 ${submission.currentPage} 과제가 선생님에게 전송되었습니다`,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      handleAPISave(newNotification, JSON.stringify([submission]));

//      setNotifications(prev => [newNotification, ...prev]);

      // 선생님에게 알림 표시
      setSubmissionAlert(true);

      alert(`제출 완료!\n페이지: ${submission.currentPage}\n스트로크: ${submission.strokeData.length}개\n오디오: ${submission.audioBase64 ? '포함' : '없음'}`);

      // 데모용: 자동으로 선생님 첨삭 생성 (3초 후)
    setTimeout(() => {
      const mockTeacherFeedback = {
        id: Date.now(),
        teacherId: 'teacher1',
        teacherName: '선생님',
        timestamp: new Date().toISOString(),
        feedbackStrokeData: [
          {
            type: 'stroke',
            tool: 'pen',
            color: '#ef4444',
            brushSize: 3,
            points: [
              { x: 100, y: 200 },
              { x: 150, y: 200 },
              { x: 200, y: 200 }
            ],
            timestamp: new Date().toISOString()
          },
        ],
        studentSubmissionId: submission.id,
        bookTitle: submission.bookTitle,
        bookUrl: submission.bookUrl
      };

      // 단일 첨삭 상태 업데이트 (기존 호환성)
      setTeacherFeedback(mockTeacherFeedback);
      localStorage.setItem('teacherFeedback', JSON.stringify(mockTeacherFeedback));

      // 다중 첨삭 목록에 추가
      setTeacherFeedbacks(prev => {
        const newFeedbacks = [mockTeacherFeedback, ...prev];
        localStorage.setItem('teacherFeedbacks', JSON.stringify(newFeedbacks));
        return newFeedbacks;
      });

      // 학생에게 첨삭 알림 표시
      setFeedbackAlert(true);

      // 알림 추가
      const feedbackNotification = {
        id: Date.now(),
        type: 'feedback',
        title: '선생님 첨삭 도착',
        message: `"${submission.bookTitle}" 과제에 선생님 첨삭이 도착했습니다`,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      setNotifications(prev => [feedbackNotification, ...prev]);
    }, 3000);
    });
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

    // 강사 첨삭 데이터도 별도로 저장 (페이지별 필기 포함)
    const teacherFeedbackData = {
      id: Date.now(),
      teacherId: 'teacher1',
      teacherName: '선생님',
      timestamp: new Date().toISOString(),
      feedbackStrokeData: [...strokeData],
      studentSubmissionId: studentSubmission?.id,
      bookTitle: studentSubmission?.bookTitle || '교재',
      bookUrl: studentSubmission?.bookUrl || currentPdfUrl,
      savedDrawings: strokeData // 페이지별 필기 데이터도 포함
    };

    localStorage.setItem('teacherFeedbackData', JSON.stringify(teacherFeedbackData));

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

    // API 저장 테스트
    const handleAPISave = async(newNotification, submission)=> {
        const mem_seq = Base64.decode(window.sessionStorage.getItem("noma@mem_seq"));
        const studentId = Base64.decode(window.sessionStorage.getItem("noma@login_id"));
        const studentName = Base64.decode(window.sessionStorage.getItem("noma@mem_name"));

        const studentSubmission = JSON.parse( window.localStorage.getItem("studentSubmission") );
        const audioBase64 = studentSubmission.audioBase64;
        const currentPage = studentSubmission.currentPage;
//        const strokeData = studentSubmission.strokeData;
        const strokeData = submission;
        const recordingStartTime = studentSubmission.recordingStartTime;
        const audioUrl = studentSubmission.audioUrl;
        const bookTitle = studentSubmission.bookTitle;
        const bookUrl = studentSubmission.bookUrl;
        const id = studentSubmission.id;
        const pdfFileName = studentSubmission.pdfFileName;
        const time_stamp = studentSubmission.timestamp;

        const book_id = files[activeFileIndex].id;



console.log("submission =============== ", submission);

        let bodyData = {
            mem_seq:mem_seq,
            studentSubmission:studentSubmission,
            audioBase64:audioBase64,
            currentPage:currentPage,
            strokeData:strokeData,
            recordingStartTime:recordingStartTime,
            book_id:book_id,
            audioUrl:audioUrl,
            bookTitle:bookTitle,
            bookUrl:bookUrl,
            id:id,
            pdfFileName:pdfFileName,
            studentId:studentId,
            studentName:studentName,
            time_stamp:time_stamp
        };
        commonJs.fetchApiCall("S", "studentSubmissionSave", bodyData)
        .then(responseJson => {
            if (responseJson.result_code === API_RES_CODE.SUCCESS) {
                setNotifications(prev => [newNotification, ...prev]);
            } else {
                CommonUtils.showServerErr(responseJson.result_code, responseJson.result_message);
            }
        });

    }

    // API 리스트 테스트
    const handleAPIList = async()=> {
        const mem_seq = Base64.decode(window.sessionStorage.getItem("noma@mem_seq"));

        const studentSubmission = JSON.parse( window.localStorage.getItem("studentSubmission") );
        const currentPage = studentSubmission.currentPage;
        const book_id = files[activeFileIndex].id;

        let bodyData = {
            mem_seq:mem_seq,
            currentPage:currentPage,
            book_id:book_id,
        };
        commonJs.fetchApiCall("S", "studentSubmissionList", bodyData)
        .then(responseJson => {
            if (responseJson.result_code === API_RES_CODE.SUCCESS) {
                let subList = responseJson.studentSubmissionList[0];
                let strokeDataStr = subList.strokeData;
                const strokeData = JSON.parse(strokeDataStr);
                console.log("strokeData =============== ", strokeData);
            } else {
                CommonUtils.showServerErr(responseJson.result_code, responseJson.result_message);
            }
        });

    }



  // AI 채점 함수
  const handleAIGrading = async () => {
    if (strokeData.length === 0) {
      alert('채점할 필기 내용이 없습니다. 먼저 문제를 풀어보세요!');
      return;
    }

    setIsAIGrading(true);
    setGradingProgress(0);
    setGradingResult(null);

    // 채점 진행 시뮬레이션
    const progressInterval = setInterval(() => {
      setGradingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // 3초 후 채점 완료
    setTimeout(() => {
      clearInterval(progressInterval);
      setGradingProgress(100);

      // 가상의 채점 결과 생성
      const mockGradingResult = {
        totalScore: Math.floor(Math.random() * 30) + 70, // 70-100점
        maxScore: 100,
        details: [
          {
            question: "문제 1: 기본 개념 이해",
            score: Math.floor(Math.random() * 15) + 15, // 15-30점
            maxScore: 30,
            feedback: "개념을 잘 이해하고 있습니다. 더 정확한 표현을 사용하면 좋겠습니다.",
            isCorrect: true
          },
          {
            question: "문제 2: 계산 과정",
            score: Math.floor(Math.random() * 20) + 20, // 20-40점
            maxScore: 40,
            feedback: "계산 과정이 명확합니다. 단위를 꼭 표시해주세요.",
            isCorrect: true
          },
          {
            question: "문제 3: 응용 문제",
            score: Math.floor(Math.random() * 15) + 15, // 15-30점
            maxScore: 30,
            feedback: "문제 해결 과정이 체계적입니다. 더 다양한 접근 방법을 시도해보세요.",
            isCorrect: true
          }
        ],
        overallFeedback: "전반적으로 잘 풀었습니다! 특히 기본 개념 이해가 뛰어납니다. 응용 문제에서 더 다양한 해결 방법을 시도해보면 좋겠습니다.",
        timestamp: new Date().toISOString()
      };

      setGradingResult(mockGradingResult);
      setIsAIGrading(false);
    }, 3000);
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
//    if (canvas) {
//      const context = canvas.getContext('2d');
//      context.clearRect(0, 0, canvas.width, canvas.height);
//    }
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

    // 마크업 캔버스만 초기화 (PDF 배경은 유지)
    const markupCanvas = pdfViewerRef?.current?.markupCanvasRef?.current;
    if (markupCanvas) {
      const context = markupCanvas.getContext('2d');
      context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);

      // 현재 캔버스 크기 (상대 좌표 → 절대 좌표 변환용)
      const currentCanvasWidth = markupCanvas.width;
      const currentCanvasHeight = markupCanvas.height;

      // 상대 좌표를 절대 좌표로 변환하는 헬퍼 함수
      const denormalizePoints = (points) => {
        return points.map(point => {
          if (point.x <= 1 && point.y <= 1) {
            // 상대 좌표 → 절대 좌표
            return { x: point.x * currentCanvasWidth, y: point.y * currentCanvasHeight };
          } else {
            // 이미 절대 좌표 (기존 데이터 호환)
            return point;
          }
        });
      };

      // 기존 그림들(녹음 전)을 먼저 그리기 - 즉시 표시 (배경)
      const allStrokes = strokeData || [];
      // 녹음 전 펨 스트로크만 필터링 (지우개는 제외 - 지우개는 녹음 재생 시에만 적용)
      const backgroundStrokes = allStrokes.filter(stroke => !stroke.isRecording && stroke.tool !== 'eraser');

      console.log('배경 스트로크 수:', backgroundStrokes.length);
      console.log('전체 스트로크:', allStrokes.map(s => ({ id: s.id, tool: s.tool, isRecording: s.isRecording, timestamp: s.timestamp })));

      // 펜 스트로크만 배경으로 그리기
      backgroundStrokes.forEach(stroke => {
        if (stroke.points && stroke.points.length > 1) {
          // 상대 좌표 → 절대 좌표 변환
          const absolutePoints = denormalizePoints(stroke.points);

          // 펜 스트로크 처리
          context.save();
          context.beginPath();
          context.lineWidth = stroke.brushSize || 3;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.strokeStyle = stroke.color || '#ef4444';
          context.globalAlpha = 1;

          context.moveTo(absolutePoints[0].x, absolutePoints[0].y);
          for (let i = 1; i < absolutePoints.length; i++) {
            context.lineTo(absolutePoints[i].x, absolutePoints[i].y);
          }
          context.stroke();
          context.restore();
        }
      });
    }

    // 필기 스트로크 재생 준비 (지우개 포함, 펜과 지우개 모두)
    const recordingStrokes = strokeData.filter(stroke => stroke.isRecording && stroke.timestamp !== null && stroke.timestamp !== undefined);
    console.log('🎬 재생할 녹음 스트로크들:', recordingStrokes.map(s => ({
      id: s.id,
      tool: s.tool,
      timestamp: typeof s.timestamp === 'number' ? s.timestamp.toFixed(2) + 's' : s.timestamp,
      hasPoints: !!s.points,
      pointsLength: s.points?.length
    })));

    if (recordingStrokes.length === 0) {
      console.warn('⚠️ 녹음 스트로크가 없습니다! 전체 스트로크 확인:',
        strokeData.map(s => ({
          id: s.id,
          tool: s.tool,
          isRecording: s.isRecording,
          timestamp: s.timestamp,
          timestampType: typeof s.timestamp,
          student_mem_seq:Base64.decode(window.sessionStorage.getItem("noma@mem_seq")),
        }))
      );
    }

    // 음성 재생 시작
    let audioInstance = null;
    let syncIntervalId = null;

    if (audioUrl) {
      try {
        audioInstance = new Audio(audioUrl);
        setCurrentAudio(audioInstance);

        audioInstance.onloadedmetadata = () => {
          setAudioDuration(audioInstance.duration);
          console.log('오디오 길이:', audioInstance.duration);
        };

        audioInstance.ontimeupdate = () => {
          setCurrentTime(audioInstance.currentTime);
        };

        audioInstance.onended = () => {
          console.log('오디오 재생 종료');
          setIsPlaying(false);
          setIsReplaying(false);
          setCurrentTime(0);
          setReplayProgress(100);

          // 인터벌 정리
          if (syncIntervalId) {
            clearInterval(syncIntervalId);
          }

          // drawn 플래그 초기화
          recordingStrokes.forEach(stroke => delete stroke.drawn);
        };

        audioInstance.onerror = (error) => {
          console.error('오디오 재생 오류:', error);
          setIsPlaying(false);
          setIsReplaying(false);

          if (syncIntervalId) {
            clearInterval(syncIntervalId);
          }
        };

        setIsPlaying(true);
        await audioInstance.play();
        console.log('오디오 재생 시작');
      } catch (error) {
        console.error('오디오 재생 오류:', error);
        setIsPlaying(false);
        setIsReplaying(false);
        return;
      }
    }

    // 필기 스트로크 재생 (음성과 동시에 동기화, 또는 오디오 없이 스트로크만 재생)
    if (recordingStrokes.length > 0) {
      // 오디오가 있으면 오디오와 동기화, 없으면 스트로크만 재생
      const hasAudio = audioInstance !== null;
      let startTime = Date.now();

      syncIntervalId = setInterval(() => {
        // 오디오가 있는 경우: 오디오 시간에 맞춰 재생
        // 오디오가 없는 경우: 실제 경과 시간으로 재생
        let currentPlaybackTime = 0;

        if (hasAudio && audioInstance && !audioInstance.paused && !audioInstance.ended) {
          currentPlaybackTime = audioInstance.currentTime;
        } else if (!hasAudio) {
          // 오디오 없이 스트로크만 재생 (실시간 경과 시간)
          currentPlaybackTime = (Date.now() - startTime) / 1000;
        } else {
          // 오디오가 일시정지되었거나 끝난 경우
          clearInterval(syncIntervalId);
          return;
        }

        // 현재 재생 시간에 맞는 스트로크들을 찾아서 그리기
        recordingStrokes.forEach((stroke) => {
          if (stroke.timestamp && stroke.timestamp <= currentPlaybackTime && !stroke.drawn) {
              console.log(`스트로크 그리기: 타입=${stroke.tool}, 타임스탬프 ${stroke.timestamp.toFixed(2)}s, 재생 시간 ${currentPlaybackTime.toFixed(2)}s`);
              if (markupCanvas) {
                const context = markupCanvas.getContext('2d');

                // 현재 캔버스 크기 (상대 좌표 → 절대 좌표 변환용)
                const currentCanvasWidth = markupCanvas.width;
                const currentCanvasHeight = markupCanvas.height;

                // 상대 좌표를 절대 좌표로 변환
                const denormalizePoints = (points) => {
                  return points.map(point => {
                    if (point.x <= 1 && point.y <= 1) {
                      return { x: point.x * currentCanvasWidth, y: point.y * currentCanvasHeight };
                    } else {
                      return point;
                    }
                  });
                };

                // 스트로크 포인트를 절대 좌표로 변환
                const absolutePoints = stroke.points ? denormalizePoints(stroke.points) : [];

                context.save();

                if (enableStrokeAnimation && absolutePoints.length > 5) {
                  // 애니메이션 모드: 점진적으로 그리기
                  if (!stroke.animationIndex) {
                    stroke.animationIndex = 0;
                  }

                  // 프레임당 그릴 포인트 수 (빠르게)
                  const pointsPerFrame = Math.max(3, Math.floor(absolutePoints.length / 10));
                  const endIndex = Math.min(stroke.animationIndex + pointsPerFrame, absolutePoints.length);

                  if (stroke.tool === 'eraser') {
                    // 지우개 애니메이션
                    context.globalCompositeOperation = 'destination-out';
                    const eraserSize = stroke.brushSize * 10 || 30;

                    for (let i = stroke.animationIndex; i < endIndex; i++) {
                      context.beginPath();
                      context.arc(absolutePoints[i].x, absolutePoints[i].y, eraserSize, 0, 2 * Math.PI);
                      context.fill();
                    }
                  } else {
                    // 펜 애니메이션
                    context.beginPath();
                    context.lineWidth = stroke.brushSize || 3;
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = stroke.color || '#ef4444';

                    if (stroke.animationIndex === 0) {
                      context.moveTo(absolutePoints[0].x, absolutePoints[0].y);
                    } else {
                      context.moveTo(absolutePoints[stroke.animationIndex - 1].x, absolutePoints[stroke.animationIndex - 1].y);
                    }

                    for (let i = stroke.animationIndex; i < endIndex; i++) {
                      context.lineTo(absolutePoints[i].x, absolutePoints[i].y);
                    }
                    context.stroke();
                  }

                  stroke.animationIndex = endIndex;

                  // 애니메이션 완료 확인
                  if (stroke.animationIndex >= absolutePoints.length) {
                    stroke.drawn = true;
                    delete stroke.animationIndex;
                  }
                } else {
                  // 애니메이션 없음: 한번에 그리기 (기존 방식)
                  if (stroke.tool === 'eraser') {
                    // 지우개 스트로크 재생
                    context.globalCompositeOperation = 'destination-out';
                    const eraserSize = stroke.brushSize * 10 || 30;

                    if (absolutePoints.length > 0) {
                      for (let i = 0; i < absolutePoints.length; i++) {
                        context.beginPath();
                        context.arc(absolutePoints[i].x, absolutePoints[i].y, eraserSize, 0, 2 * Math.PI);
                        context.fill();
                      }
                    }
                  } else {
                    // 펜 스트로크 그리기
                    context.beginPath();
                    context.lineWidth = stroke.brushSize || 3;
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = stroke.color || '#ef4444';

                    if (absolutePoints.length > 1) {
                      context.moveTo(absolutePoints[0].x, absolutePoints[0].y);
                      for (let i = 1; i < absolutePoints.length; i++) {
                        context.lineTo(absolutePoints[i].x, absolutePoints[i].y);
                      }
                      context.stroke();
                    }
                  }

                  // 그려진 것으로 표시
                  stroke.drawn = true;
                }

                context.restore();
              }
            }
          });

          // 진행률 업데이트
          const drawnStrokes = recordingStrokes.filter(stroke => stroke.drawn).length;
          const progress = recordingStrokes.length > 0 ? (drawnStrokes / recordingStrokes.length) * 100 : 100;
          setReplayProgress(progress);

          // 오디오 없이 스트로크만 재생하는 경우: 모든 스트로크가 그려졌으면 종료
          if (!hasAudio && drawnStrokes === recordingStrokes.length) {
            console.log('✅ 모든 스트로크 재생 완료 (오디오 없음)');
            clearInterval(syncIntervalId);
            setIsReplaying(false);
            setIsPlaying(false);
            setReplayProgress(100);
          }
      }, 50); // 50ms 간격으로 체크
    } else if (recordingStrokes.length === 0 && audioInstance) {
      // 녹음 중 필기가 없으면 음성만 재생
      console.log('녹음 중 필기 없음, 음성만 재생');
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

  // 스트로크 데이터 변경 핸들러 (메모이제이션)
  const handleStrokeDataChange = useCallback((newStrokeData) => {
    console.log('📝 handleStrokeDataChange 호출됨, 스트로크 수:', newStrokeData.length, 'isRecording:', isRecording);

    // recordingStartTime이 있으면 타임스탬프 변환 (녹음 중이든 아니든)
    if (recordingStartTime) {
      const updatedStrokeData = newStrokeData.map((stroke) => {
        // isRecording 플래그가 있고 타임스탬프가 밀리초(숫자)인 경우
        if (stroke.isRecording && typeof stroke.timestamp === 'number' && stroke.timestamp > 1000000) {
          // 밀리초를 녹음 시작 이후의 초 단위로 변환
          const timestamp = (stroke.timestamp - recordingStartTime) / 1000;
          console.log('⏱️ 타임스탬프 변환:', {
            id: stroke.id,
            tool: stroke.tool,
            원본밀리초: stroke.timestamp,
            녹음시작: recordingStartTime,
            변환된초: timestamp.toFixed(3) + 's'
          });
          return {
            ...stroke,
            timestamp: timestamp // 녹음 시작 후 경과 시간 (초)
          };
        }
        return stroke;
      });

      console.log('✅ 타임스탬프 변환 완료. 녹음 스트로크:',
        updatedStrokeData.filter(s => s.isRecording).map(s => ({
          id: s.id,
          tool: s.tool,
          timestamp: typeof s.timestamp === 'number' ? s.timestamp.toFixed(3) + 's' : s.timestamp
        }))
      );

      setStrokeData(updatedStrokeData);
    } else {
      setStrokeData(newStrokeData);
    }
  }, [recordingStartTime]);

  // 페이지 카운트 변경 핸들러 (메모이제이션)
  const handlePageCountChange = useCallback((count) => {
    setPageCount(count);
  }, []);


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
      teacherFeedback={teacherFeedback}
      teacherFeedbacks={teacherFeedbacks}
      strokeData={strokeData}
      audioUrl={audioUrl}
      currentPdfUrl={currentPdfUrl}
      activeFileIndex={activeFileIndex}
      setSelectedSubmission={setSelectedSubmission}
      setCurrentPage={setCurrentPage}
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

  if (currentPage === 'admin') {
    return <AdminPage />;
  }

  // 선생님 첨삭 카드 목록 페이지
  if (currentPage === 'teacherFeedbackCards') {
    return (
      <TeacherFeedbackCards
        feedbacks={teacherFeedbacks}
        onSelectFeedback={(feedback) => {
          // 선택된 첨삭을 단일 첨삭으로 설정하고 상세 페이지로 이동
          setTeacherFeedback(feedback);
          const mockSubmission = {
            id: Date.now(),
            studentId: 'student1',
            studentName: '학생',
            timestamp: new Date().toISOString(),
            strokeData: [],
            audioUrl: null,
            bookTitle: feedback.bookTitle,
            bookUrl: feedback.bookUrl,
            submittedAt: new Date().toISOString()
          };
          setSelectedSubmission(mockSubmission);
          setCurrentPage('teacherAnnotation');
        }}
        onBackToBookList={() => setCurrentPage('bookList')}
      />
    );
  }

  // 강사용 첨삭 페이지
  if (currentPage === 'teacherAnnotation') {
    return (
      <TeacherAnnotationViewer
        submission={selectedSubmission}
        onBackToSubmissions={() => setCurrentPage('teacherFeedbackCards')}
        onSaveFeedback={(feedback) => {
          setTeacherFeedback(feedback);
          setCurrentPage('bookList');
        }}
      />
    );
  }

  // 강사용 제출물 첨삭 페이지
  if (currentPage === 'teacherSubmission') {
    return (
      <TeacherSubmissionViewer
        submission={selectedSubmission}
        onBackToSubmissions={() => setCurrentPage('teacherBookList')}
        onSaveFeedback={(feedback) => {
          // 강사 데모에서는 첨삭 저장 후 제출물 목록으로 돌아감
          setCurrentPage('teacherFeedbackCards');
        }}
      />
    );
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
                교재목록
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
                ref={pdfViewerRef}
                pdfFileName={currentFile.url}
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
                onPageCountChange={handlePageCountChange}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                성적 관리
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
          pdfCanvasRef={pdfViewerRef?.current?.canvasRef}
          markupCanvasRef={pdfViewerRef?.current?.markupCanvasRef}
          currentPageNum={currentPageNum}
          pdfFileName={currentFile?.url || 'unknown.pdf'}
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
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
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
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              교재목록
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
            border: '1px solid rgba(249, 115, 22, 0.2)',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
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

            {/* AI 채점 버튼 */}
            <button
              onClick={handleAIGrading}
              disabled={isAIGrading}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #10b981',
                background: isAIGrading
                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                cursor: isAIGrading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isAIGrading ? 0.7 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              title={isAIGrading ? "AI 채점 중..." : "AI 채점"}
            >
              {isAIGrading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                  </svg>
                  채점 중... ({Math.round(gradingProgress)}%)
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  AI 채점
                </>
              )}
            </button>


            {/*<button
              onClick={handleAPISave}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #10b981',
                background: isAIGrading
                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                cursor: isAIGrading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isAIGrading ? 0.7 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              title={"API저장"}
            >
            API저장 테스트
            </button>

            <button
              onClick={handleAPIList}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #10b981',
                background: isAIGrading
                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                cursor: isAIGrading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isAIGrading ? 0.7 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              title={"API리스트"}
            >
            API저장 리스트
            </button>*/}
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
              ref={pdfViewerRef}
              pdfFileName={currentFile.url}
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
              onPageCountChange={handlePageCountChange}
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

      {/* AI 채점 결과 모달 */}
      {gradingResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setGradingResult(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#6b7280';
              }}
            >
              ×
            </button>

            {/* 채점 결과 헤더 */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              paddingRight: '2rem'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                AI 채점 완료
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '0.5rem'
              }}>
                {gradingResult.totalScore}점
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#6b7280'
              }}>
                총 {gradingResult.maxScore}점 만점
              </div>
            </div>

            {/* 상세 채점 결과 */}
            <div style={{
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                상세 채점 결과
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {gradingResult.details.map((detail, index) => (
                  <div key={index} style={{
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {detail.question}
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: detail.isCorrect ? '#10b981' : '#ef4444'
                      }}>
                        {detail.score}/{detail.maxScore}점
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {detail.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 전체 피드백 */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #0ea5e9',
              marginBottom: '2rem'
            }}>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: '#0c4a6e',
                marginBottom: '0.75rem'
              }}>
                전체 피드백
              </h4>
              <p style={{
                fontSize: '1rem',
                color: '#0c4a6e',
                lineHeight: '1.6',
                margin: 0
              }}>
                {gradingResult.overallFeedback}
              </p>
            </div>

            {/* 버튼들 */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              <button
                onClick={() => {
                  // 채점 결과를 기반으로 O, X 표시 생성
                  const marks = gradingResult.details.map((detail, index) => ({
                    type: detail.isCorrect ? 'correct' : 'incorrect',
                    x: 200 + (index * 50), // 문제별로 좌우로 배치
                    y: 150 + (index * 100), // 문제별로 위아래로 배치
                    question: detail.question,
                    score: detail.score,
                    maxScore: detail.maxScore
                  }));

                  const event = new CustomEvent('addGradingMarks', {
                    detail: { marks }
                  });
                  window.dispatchEvent(event);
                  setGradingResult(null);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                PDF에 표시하기
              </button>

              <button
                onClick={() => setGradingResult(null)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
              녹음 & 재생
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
              <>
                {/*<button
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
                </button>*/}

                {/* 애니메이션 토글 버튼 */}
                <button
                  onClick={() => setEnableStrokeAnimation(!enableStrokeAnimation)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#1f2937',
                    border: enableStrokeAnimation ? '2px solid #8b5cf6' : '2px solid #4b5563',
                    color: enableStrokeAnimation ? '#8b5cf6' : '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    fontSize: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#111827';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1f2937';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-ui)' }}>
                    {enableStrokeAnimation ? '애니메이션 ON' : '애니메이션 OFF'}
                  </span>
                </button>
              </>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M7 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12-8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-8 4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
              액션
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
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
        pdfCanvasRef={pdfViewerRef?.current?.canvasRef}
        markupCanvasRef={pdfViewerRef?.current?.markupCanvasRef}
        currentPageNum={currentPageNum}
        pdfFileName={currentFile?.url || 'unknown.pdf'}
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
      
      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .grading-modal {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
