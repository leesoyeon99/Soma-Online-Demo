import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import StaticPDFViewer from './StaticPDFViewer';

import * as commonJs from '../component/CommonJs';
//import GlobalStore from '../store/GlobalStore';
import { API_RES_CODE,  } from '../component/AppConstants';
import { Base64 } from 'js-base64';
import CommonUtils from '../utils/CommonUtils';

const TeacherSubmissionViewer = ({ 
  submission, 
  onBackToSubmissions, 
  onSaveFeedback 
}) => {
  const audioRef = useRef(null);
  const pdfViewerRef = useRef(null);
  const syncIntervalRef = useRef(null);
  
  const [zoomScale, setZoomScale] = useState(1.0);
  
  // 첨삭 도구 상태
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  
  // 첨삭 데이터
  const [teacherAnnotations, setTeacherAnnotations] = useState([]);
  
  // 강사 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [teacherAudioUrl, setTeacherAudioUrl] = useState(null);
  const [teacherAudioBase64, setTeacherAudioBase64] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  
  // 선생 첨삭 재생 관련 상태
  const [isTeacherReplaying, setIsTeacherReplaying] = useState(false);
  const [teacherReplayProgress, setTeacherReplayProgress] = useState(0);
  const [currentTeacherAudio, setCurrentTeacherAudio] = useState(null);
  const [enableStrokeAnimation] = useState(true); // 스트로크 애니메이션 활성화
  const [teacherAudioDuration, setTeacherAudioDuration] = useState(0); // 선생 오디오 길이
  
  // 오디오 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 제출물 데이터 디버깅
  useEffect(() => {
    console.log('🎓 TeacherSubmissionViewer 렌더링:', {
      hasSubmission: !!submission,
      studentName: submission?.studentName,
      currentPage: submission?.currentPage,
      bookUrl: submission?.bookUrl,
      pdfFileName: submission?.pdfFileName,
      hasAudioBase64: !!submission?.audioBase64,
      hasAudioUrl: !!submission?.audioUrl,
      strokeCount: submission?.strokeData?.length
    });
    console.log('📦 전체 submission 객체:', submission);
  }, [submission]);

  // localStorage에서 선생 피드백 불러오기 (컴포넌트 마운트 시)
  useEffect(() => {
    if (!submission?.id) return;
    
    const feedbackKey = `teacherFeedback_${submission.id}`;
    const savedFeedback = localStorage.getItem(feedbackKey);
    
    if (savedFeedback) {
      try {
        const feedback = JSON.parse(savedFeedback);
        console.log('💾 저장된 선생 피드백 불러오기:', feedback);
        
        // 저장된 피드백 복원
        if (feedback.feedbackStrokeData) {
          setTeacherAnnotations(feedback.feedbackStrokeData);
        }
        if (feedback.teacherAudioBase64) {
          setTeacherAudioBase64(feedback.teacherAudioBase64);
          // Base64를 Blob URL로 변환
          const byteCharacters = atob(feedback.teacherAudioBase64.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setTeacherAudioUrl(url);
        }
        if (feedback.recordingStartTime) {
          setRecordingStartTime(feedback.recordingStartTime);
        }
        
        console.log('✅ 선생 피드백 복원 완료');
      } catch (error) {
        console.error('❌ 선생 피드백 불러오기 오류:', error);
      }
    } else {
      console.log('ℹ️ 저장된 선생 피드백 없음');
    }
  }, [submission?.id]);

  // 선생 오디오 길이 업데이트
  useEffect(() => {
    if (teacherAudioUrl) {
      const audio = new Audio(teacherAudioUrl);
      audio.onloadedmetadata = () => {
        setTeacherAudioDuration(audio.duration);
        console.log('🎵 선생 오디오 길이:', audio.duration);
      };
      audio.load();
    } else {
      setTeacherAudioDuration(0);
    }
  }, [teacherAudioUrl]);

  // PDF 파일 경로 추출 (useMemo로 최적화)
  const pdfFilePath = useMemo(() => {
    // pdfFileName 또는 bookUrl에서 전체 경로 가져오기
    const pdfPath = submission?.pdfFileName || submission?.bookUrl;
    
    console.log('🔍 PDF 경로 계산 중:', {
      'submission?.pdfFileName': submission?.pdfFileName,
      'submission?.bookUrl': submission?.bookUrl,
      'pdfPath': pdfPath
    });
    
    if (!pdfPath) {
      console.warn('⚠️ PDF 경로를 찾을 수 없습니다. 기본값 사용');
      return '/assets/pdf/mvp_2023_소마_프리미어.pdf';
    }
    
    console.log('📄 원본 PDF 경로:', pdfPath);
    
    // 이미 전체 경로면 그대로 반환
    if (pdfPath.startsWith('/assets/pdf/') || pdfPath.startsWith('/')) {
      console.log('✅ 전체 경로 반환:', pdfPath);
      return pdfPath;
    }
    
    // 파일명만 있으면 경로 추가
    const fullPath = `/assets/pdf/${pdfPath}`;
    console.log('➕ 경로 추가 후 반환:', fullPath);
    return fullPath;
  }, [submission?.pdfFileName, submission?.bookUrl]);

  // 첨삭 그리기
  // const drawAnnotations = useCallback(() => {
  //   // 빈 함수 - 나중에 구현 예정
  // }, []);

  // 선생님 첨삭 그리기
  // const drawTeacherAnnotations = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
  //   
  //   const context = canvas.getContext('2d');
  //   
  //   teacherAnnotations.forEach(annotation => {
  //     if (annotation.type === 'stroke') {
  //       context.save();
  //       context.strokeStyle = annotation.color;
  //       context.lineWidth = annotation.brushSize;
  //       context.lineCap = 'round';
  //       context.lineJoin = 'round';
  //       
  //       if (annotation.tool === 'highlighter') {
  //         context.globalAlpha = 0.3;
  //         context.globalCompositeOperation = 'multiply';
  //       } else {
  //         context.globalAlpha = 1;
  //         context.globalCompositeOperation = 'source-over';
  //       }
  //       
  //       context.beginPath();
  //       context.moveTo(annotation.points[0].x, annotation.points[0].y);
  //       for (let i = 1; i < annotation.points.length; i++) {
  //         context.lineTo(annotation.points[i].x, annotation.points[i].y);
  //       }
  //       context.stroke();
  //       context.restore();
  //     }
  //   });
  // }, [teacherAnnotations]);


  // 전체 삭제
  const handleClearAll = () => {
    if (window.confirm('현재 페이지의 모든 첨삭을 삭제하시겠습니까?')) {
      setTeacherAnnotations([]);
      // StaticPDFViewer의 전체 삭제 이벤트 발생
      const event = new CustomEvent('clearAllDrawings');
      window.dispatchEvent(event);
    }
  };

  // Base64 변환 함수 (App.js와 동일)
  const convertAudioToBase64 = async (audioUrl) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('오디오 Base64 변환 오류:', error);
      return null;
    }
  };

  // 다시 녹음 핸들러
  const handleTeacherRerecord = () => {
    if (window.confirm('정말로 다시 녹음하시겠습니까? 현재 녹음과 첨삭이 모두 삭제됩니다.')) {
      // 기존 녹음 데이터 초기화
      setTeacherAnnotations([]);
      if (teacherAudioUrl) {
        URL.revokeObjectURL(teacherAudioUrl);
        setTeacherAudioUrl(null);
      }
      setTeacherAudioBase64(null);
      setRecordingStartTime(null);
      setIsTeacherReplaying(false);
      setTeacherReplayProgress(0);
      
      // localStorage에서도 삭제
      const feedbackKey = `teacherFeedback_${submission.id}`;
      localStorage.removeItem(feedbackKey);
      console.log('🗑️ 선생 피드백 초기화 완료');
      
      // 녹음 시작
      setTimeout(() => {
        handleTeacherRecordingToggle();
      }, 100);
    }
  };

  // 강사 녹음 핸들러
  const handleTeacherRecordingToggle = async () => {
    if (isRecording) {
      // 녹음 중지
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setIsRecording(false);
        console.log('강사 녹음 중지, 첨삭 스트로크 수:', teacherAnnotations.length);
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

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Base64 변환
          const audioBase64 = await convertAudioToBase64(audioUrl);
          
          setTeacherAudioUrl(audioUrl);
          setTeacherAudioBase64(audioBase64);
          
          // 스트림 정리
          stream.getTracks().forEach(track => track.stop());
          
          console.log('강사 녹음 완료, Base64 변환:', !!audioBase64);
          
          // localStorage에 저장 (녹음 완료 후)
          const feedbackKey = `teacherFeedback_${submission.id}`;
          const feedback = {
            id: Date.now(),
            teacherId: Base64.decode(window.sessionStorage.getItem("noma@login_id")),
            teacherName: Base64.decode(window.sessionStorage.getItem("noma@mem_name")),
            timestamp: new Date().toISOString(),
            feedbackStrokeData: teacherAnnotations,
            teacherAudioBase64: audioBase64,
            recordingStartTime: recordingStartTime,
            studentSubmissionId: submission.id,
            currentPage: submission.currentPage,
            bookTitle: submission.bookTitle,
            bookUrl: submission.bookUrl,
            pdfFileName: submission.pdfFileName
          };
          
          localStorage.setItem(feedbackKey, JSON.stringify(feedback));
          console.log('💾 선생 피드백 localStorage 저장 완료:', feedbackKey);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordingStartTime(Date.now()); // 녹음 시작 시간 기록
        
        // 기존 녹음 첨삭 스트로크 제거 (녹음 전 첨삭은 유지)
        setTeacherAnnotations(prev => prev.filter(stroke => !stroke.isRecording));
        
        console.log('강사 녹음 시작, recordingStartTime:', Date.now());
      } catch (error) {
        console.error('마이크 권한 오류:', error);
        alert('마이크 권한이 필요합니다.');
      }
    }
  };

  // 학생에게 첨삭 전송
  const handleSendToStudent = () => {
    if (!teacherAudioBase64 && teacherAnnotations.length === 0) {
      alert('전송할 첨삭 내용이 없습니다.');
      return;
    }
    
    const mem_seq = Base64.decode(window.sessionStorage.getItem("noma@mem_seq"));
    const teacherId = Base64.decode(window.sessionStorage.getItem("noma@login_id"));
    const teacherName = Base64.decode(window.sessionStorage.getItem("noma@mem_name"));
    
    const feedback = {
      id: Date.now(),
      studentSubmission_idx:submission.id,
      mem_seq: mem_seq,
      teacherId: teacherId,
      teacherName: teacherName,
      time_stamp: new Date().toISOString(),
      feedbackStrokeData: JSON.stringify(teacherAnnotations),  // 타임스탬프 포함된 스트로크
      teacherAudioUrl: teacherAudioUrl,
      teacherAudioBase64: teacherAudioBase64,  // ✅ 오디오 추가
      recordingStartTime: recordingStartTime,  // ✅ 타임스탬프 동기화
      studentSubmissionId: submission.studentId,
      currentPage: submission.currentPage,
      bookTitle: submission.bookTitle,
      bookUrl: submission.bookUrl,
      pdfFileName: submission.pdfFileName
    };
    
    console.log('📤 강사 첨삭 전송 데이터:', {
      strokeCount: feedback.feedbackStrokeData.length,
      hasAudio: !!feedback.teacherAudioBase64,
      recordingStartTime: feedback.recordingStartTime
    });
    
    // 백엔드 API 호출
    commonJs.fetchApiCall("S", "teacherSubmissionSave", feedback)
      .then(responseJson => {
        if (responseJson.result_code === API_RES_CODE.SUCCESS) {
          alert('학생에게 첨삭이 전송되었습니다!');
          // 전송 후 초기화
          setTeacherAnnotations([]);
          setTeacherAudioUrl(null);
          setTeacherAudioBase64(null);
          setRecordingStartTime(null);
        } else {
          CommonUtils.showServerErr(responseJson.result_code, responseJson.result_message);
        }
      });
  };

  // 선생 첨삭 재생 (학생 스트로크 + 선생 첨삭 스트로크)
  const handleTeacherReplay = async () => {
    console.log('🎬 선생 첨삭 재생 시작');
    console.log('📊 전체 teacherAnnotations:', teacherAnnotations.length, '개');
    console.log('📊 teacherAnnotations 상세:', teacherAnnotations.map(s => ({
      id: s.id,
      tool: s.tool,
      isRecording: s.isRecording,
      timestamp: s.timestamp,
      timestampType: typeof s.timestamp,
      hasPoints: !!s.points,
      pointsLength: s.points?.length
    })));
    
    const markupCanvas = pdfViewerRef?.current?.markupCanvasRef?.current;
    
    if (!markupCanvas) {
      console.error('❌ 마크업 캔버스를 찾을 수 없습니다');
      return;
    }
    
    // 재생 중이면 중지
    if (isTeacherReplaying) {
      console.log('⏸️ 재생 중지');
      if (currentTeacherAudio) {
        currentTeacherAudio.pause();
        currentTeacherAudio.currentTime = 0;
      }
      setIsTeacherReplaying(false);
      setTeacherReplayProgress(0);
      return;
    }
    
    // 재생 시작
    setIsTeacherReplaying(true);
    
    // 캔버스 초기화
    const context = markupCanvas.getContext('2d');
    context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
    
    // 1. 학생 스트로크 (배경으로 먼저 그리기)
    const studentStrokes = submission?.strokeData || [];
    const studentBackgroundStrokes = studentStrokes.filter(stroke => !stroke.isRecording && stroke.tool !== 'eraser');
    
    console.log('👨‍🎓 학생 배경 스트로크:', studentBackgroundStrokes.length, '개');
    
    // 현재 캔버스 크기
    const currentCanvasWidth = markupCanvas.width;
    const currentCanvasHeight = markupCanvas.height;
    
    // 상대 좌표 → 절대 좌표 변환 함수
    const denormalizePoints = (points) => {
      return points.map(point => {
        if (point.x <= 1 && point.y <= 1) {
          return { x: point.x * currentCanvasWidth, y: point.y * currentCanvasHeight };
        } else {
          return point;
        }
      });
    };
    
    // 학생 배경 스트로크 그리기
    studentBackgroundStrokes.forEach((stroke) => {
      const absolutePoints = stroke.points ? denormalizePoints(stroke.points) : [];
      
      context.save();
      
      if (stroke.tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        const eraserSize = stroke.brushSize * 10 || 30;
        
        for (let i = 0; i < absolutePoints.length; i++) {
          context.beginPath();
          context.arc(absolutePoints[i].x, absolutePoints[i].y, eraserSize, 0, 2 * Math.PI);
          context.fill();
        }
      } else {
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
      
      context.restore();
    });
    
    // 2. 선생 녹음 스트로크 (타임스탬프 기반 재생)
    const teacherRecordingStrokes = teacherAnnotations.filter(
      stroke => stroke.isRecording && typeof stroke.timestamp === 'number' && stroke.timestamp !== null && stroke.timestamp !== undefined
    );
    
    console.log('👨‍🏫 선생 녹음 스트로크:', teacherRecordingStrokes.length, '개');
    console.log('선생 스트로크 상세:', teacherRecordingStrokes.map(s => ({
      id: s.id,
      tool: s.tool,
      timestamp: s.timestamp,
      timestampType: typeof s.timestamp,
      hasPoints: !!s.points,
      pointsLength: s.points?.length
    })));
    
    if (teacherRecordingStrokes.length === 0) {
      console.warn('⚠️ 선생 녹음 스트로크가 없습니다!');
      setIsTeacherReplaying(false);
      return;
    }
    
    // 3. 오디오 재생 시작
    let audioInstance = null;
    let syncIntervalId = null;
    
    if (teacherAudioUrl) {
      try {
        audioInstance = new Audio(teacherAudioUrl);
        setCurrentTeacherAudio(audioInstance);
        
        audioInstance.onloadedmetadata = () => {
          console.log('🎵 선생 오디오 길이:', audioInstance.duration);
        };
        
        audioInstance.onended = () => {
          console.log('🎵 선생 오디오 재생 종료');
          setIsTeacherReplaying(false);
          setTeacherReplayProgress(100);
          
          if (syncIntervalId) {
            clearInterval(syncIntervalId);
          }
          
          // drawn 플래그 초기화
          teacherRecordingStrokes.forEach(stroke => delete stroke.drawn);
        };
        
        audioInstance.onerror = (error) => {
          console.error('❌ 선생 오디오 재생 오류:', error);
          setIsTeacherReplaying(false);
          
          if (syncIntervalId) {
            clearInterval(syncIntervalId);
          }
        };
        
        await audioInstance.play();
        console.log('🎵 선생 오디오 재생 시작');
      } catch (error) {
        console.error('❌ 선생 오디오 재생 오류:', error);
        setIsTeacherReplaying(false);
        return;
      }
    }
    
    // 4. 필기 스트로크 재생 (음성과 동시에 동기화, 또는 오디오 없이 스트로크만 재생)
    if (teacherRecordingStrokes.length > 0) {
      const hasAudio = audioInstance !== null;
      let startTime = Date.now();
      
      syncIntervalId = setInterval(() => {
        let currentPlaybackTime = 0;
        
        if (hasAudio && audioInstance && !audioInstance.paused && !audioInstance.ended) {
          currentPlaybackTime = audioInstance.currentTime;
        } else if (!hasAudio) {
          currentPlaybackTime = (Date.now() - startTime) / 1000;
        } else {
          clearInterval(syncIntervalId);
          return;
        }
        
        // 현재 재생 시간에 맞는 스트로크들을 찾아서 그리기
        teacherRecordingStrokes.forEach((stroke) => {
          if (stroke.timestamp && stroke.timestamp <= currentPlaybackTime && !stroke.drawn) {
            console.log(`✏️ 선생 스트로크 그리기: 타입=${stroke.tool}, 타임스탬프 ${stroke.timestamp.toFixed(2)}s, 재생 시간 ${currentPlaybackTime.toFixed(2)}s`);
            
            const absolutePoints = stroke.points ? denormalizePoints(stroke.points) : [];
            
            context.save();
            
            if (enableStrokeAnimation && absolutePoints.length > 5) {
              // 애니메이션 모드: 점진적으로 그리기
              if (!stroke.animationIndex) {
                stroke.animationIndex = 0;
              }
              
              const pointsPerFrame = Math.max(3, Math.floor(absolutePoints.length / 10));
              const endIndex = Math.min(stroke.animationIndex + pointsPerFrame, absolutePoints.length);
              
              if (stroke.tool === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
                const eraserSize = stroke.brushSize * 10 || 30;
                
                for (let i = stroke.animationIndex; i < endIndex; i++) {
                  context.beginPath();
                  context.arc(absolutePoints[i].x, absolutePoints[i].y, eraserSize, 0, 2 * Math.PI);
                  context.fill();
                }
              } else {
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
              
              if (stroke.animationIndex >= absolutePoints.length) {
                stroke.drawn = true;
                delete stroke.animationIndex;
              }
            } else {
              // 애니메이션 없음: 한번에 그리기
              if (stroke.tool === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
                const eraserSize = stroke.brushSize * 10 || 30;
                
                for (let i = 0; i < absolutePoints.length; i++) {
                  context.beginPath();
                  context.arc(absolutePoints[i].x, absolutePoints[i].y, eraserSize, 0, 2 * Math.PI);
                  context.fill();
                }
              } else {
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
              
              stroke.drawn = true;
            }
            
            context.restore();
          }
        });
        
        // 재생 진행률 업데이트
        const maxTimestamp = Math.max(...teacherRecordingStrokes.map(s => s.timestamp || 0));
        const progress = maxTimestamp > 0 ? (currentPlaybackTime / maxTimestamp) * 100 : 0;
        setTeacherReplayProgress(Math.min(progress, 100));
        
        // 오디오 없이 스트로크만 재생하는 경우, 모든 스트로크가 그려지면 종료
        if (!hasAudio && teacherRecordingStrokes.every(s => s.drawn)) {
          console.log('✅ 모든 선생 스트로크 재생 완료 (오디오 없음)');
          clearInterval(syncIntervalId);
          setIsTeacherReplaying(false);
          setTeacherReplayProgress(100);
          
          // drawn 플래그 초기화
          teacherRecordingStrokes.forEach(stroke => delete stroke.drawn);
        }
      }, 50);
    }
  };

  // 첨삭 저장 (기존 로직 유지)
  /*const handleSaveFeedback = () => {
    if (teacherAnnotations.length === 0) {
      //alert('첨삭할 내용이 없습니다.');
      //return;
    }

    const mem_seq = Base64.decode(window.sessionStorage.getItem("noma@mem_seq"));
    const teacherId = Base64.decode(window.sessionStorage.getItem("noma@login_id"));
    const teacherName = Base64.decode(window.sessionStorage.getItem("noma@mem_name"));
    const studentSubmissionSelect = window.localStorage.getItem("studentSubmissionSelect");

    let bodyData1 = {
          id: Date.now(),
          mem_seq: mem_seq,
          teacherId: teacherId,
          teacherName: teacherName,
          time_stamp: new Date().toISOString(),
          feedbackStrokeData: teacherAnnotations,
          studentSubmissionId: submission.id,
          bookTitle: submission.bookTitle,
          bookUrl: submission.bookUrl
    };

    commonJs.fetchApiCall("S", "teacherSubmissionSave", bodyData)
    .then(responseJson => {
        if (responseJson.result_code === API_RES_CODE.SUCCESS) {
            alert('첨삭이 저장되었습니다!');
        } else {
            CommonUtils.showServerErr(responseJson.result_code, responseJson.result_message);
        }
    });



  };*/

  // 줌 기능
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // 페이지 변경 핸들러 (메모이제이션으로 불필요한 리렌더링 방지)
  const handlePageChange = useCallback(() => {}, []);
  const handlePageCountChange = useCallback(() => {}, []);

  // 학생 학습 재생 (오디오 + 스트로크 동기화)
  const handleCombinedReplay = useCallback(() => {
    const audio = audioRef.current;
    const markupCanvas = pdfViewerRef?.current?.markupCanvasRef?.current;
    
    console.log('🎬 학생 학습 재생 시작:', {
      hasAudio: !!audio,
      hasCanvas: !!markupCanvas,
      strokeCount: submission?.strokeData?.length,
      recordingStartTime: submission?.recordingStartTime
    });
    
    if (!markupCanvas) {
      console.error('❌ 마크업 캔버스를 찾을 수 없습니다.');
      alert('PDF 뷰어가 준비되지 않았습니다.');
      return;
    }
    
    // 이미 재생 중이면 중지
    if (isReplaying) {
      if (audio) audio.pause();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      setIsReplaying(false);
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }
    
    // 마크업 캔버스 초기화
    const context = markupCanvas.getContext('2d');
    context.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
    
    // 녹음된 스트로크 필터링 (isRecording: true, timestamp 있음)
    const recordingStrokes = (submission?.strokeData || []).filter(
      stroke => stroke.isRecording && typeof stroke.timestamp === 'number' && 
                stroke.timestamp !== null && stroke.timestamp !== undefined
    );
    
    // 배경 스트로크 (isRecording: false, eraser 제외)
    const backgroundStrokes = (submission?.strokeData || []).filter(
      stroke => !stroke.isRecording && stroke.tool !== 'eraser'
    );
    
    console.log('📊 스트로크 분류:', {
      전체: submission?.strokeData?.length,
      녹음: recordingStrokes.length,
      배경: backgroundStrokes.length
    });
    
    const currentCanvasWidth = markupCanvas.width;
    const currentCanvasHeight = markupCanvas.height;
    
    // 상대 좌표를 절대 좌표로 변환하는 헬퍼 함수
    const denormalizePoints = (points) => {
      return points.map(point => {
        if (point.x <= 1 && point.y <= 1) {
          // 상대 좌표 → 절대 좌표
          return {
            x: point.x * currentCanvasWidth,
            y: point.y * currentCanvasHeight
          };
        } else {
          // 이미 절대 좌표 (기존 데이터 호환)
          return point;
        }
      });
    };
    
    // 배경 스트로크 먼저 그리기
    backgroundStrokes.forEach(stroke => {
      if (stroke.tool === 'pen' && stroke.points) {
        const denormalizedPoints = denormalizePoints(stroke.points);
        
        context.save();
        context.strokeStyle = stroke.color || '#000000';
        context.lineWidth = stroke.brushSize || 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        denormalizedPoints.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.stroke();
        context.restore();
      } else if (stroke.tool === 'eraser' && stroke.points) {
        const denormalizedPoints = denormalizePoints(stroke.points);
        
        context.save();
        context.globalCompositeOperation = 'destination-out';
        denormalizedPoints.forEach(point => {
          context.beginPath();
          context.arc(point.x, point.y, (stroke.brushSize || 20) / 2, 0, Math.PI * 2);
          context.fill();
        });
        context.restore();
      }
    });
    
    // drawn 플래그 초기화
    recordingStrokes.forEach(stroke => {
      stroke.drawn = false;
      stroke.animationIndex = 0;
    });
    
    setIsReplaying(true);
    
    // 오디오 재생
    if (audio && submission?.audioBase64) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('오디오 재생 오류:', err));
      setIsPlaying(true);
    }
    
    // 스트로크 동기화 인터벌
    const localSyncInterval = setInterval(() => {
      const currentAudioTime = audio?.currentTime || 0;
      
      recordingStrokes.forEach(stroke => {
        if (stroke.timestamp <= currentAudioTime && !stroke.drawn) {
          // 스트로크 그리기 (상대 좌표 변환 적용)
          if (stroke.tool === 'pen' && stroke.points) {
            const denormalizedPoints = denormalizePoints(stroke.points);
            
            context.save();
            context.strokeStyle = stroke.color || '#000000';
            context.lineWidth = stroke.brushSize || 3;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            context.beginPath();
            denormalizedPoints.forEach((point, index) => {
              if (index === 0) {
                context.moveTo(point.x, point.y);
              } else {
                context.lineTo(point.x, point.y);
              }
            });
            context.stroke();
            context.restore();
          } else if (stroke.tool === 'eraser' && stroke.points) {
            const denormalizedPoints = denormalizePoints(stroke.points);
            
            context.save();
            context.globalCompositeOperation = 'destination-out';
            denormalizedPoints.forEach(point => {
              context.beginPath();
              context.arc(point.x, point.y, (stroke.brushSize || 20) / 2, 0, Math.PI * 2);
              context.fill();
            });
            context.restore();
          }
          
          stroke.drawn = true;
        }
      });
      
      // 재생 완료 체크
      if (audio && audio.ended) {
        clearInterval(localSyncInterval);
        syncIntervalRef.current = null;
        setIsReplaying(false);
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('✅ 재생 완료');
      }
    }, 50);
    
    syncIntervalRef.current = localSyncInterval;
    
    // 오디오 종료 이벤트 핸들러
    if (audio) {
      audio.onended = () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
        setIsReplaying(false);
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('✅ 오디오 종료, 재생 완료');
      };
    }
  }, [submission, isReplaying]);
  
  // 오디오만 재생
  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // 오디오 메타데이터 로드
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      console.log('🎵 오디오 로드 완료:', {
        duration: audioRef.current.duration,
        src: audioRef.current.src ? '데이터 있음' : '데이터 없음'
      });
    }
  };

  // 오디오 시간 업데이트
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // 오디오 종료
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!submission) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <h2>제출물을 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      padding: '2rem'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* 헤더 - 뒤로가기 + 제목 + 전송 버튼 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* 뒤로가기 버튼 */}
            <button
              onClick={onBackToSubmissions}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              ← 제출물 목록으로
            </button>
            
            {/* 제목과 학생 정보 */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                color: '#1e3a8a',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)',
                margin: '0 0 0.25rem 0'
              }}>
                {submission.bookTitle} - 강사 첨삭
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                margin: '0'
              }}>
                학생: {submission.studentName} | 페이지: {submission.currentPage || '정보 없음'} | 제출: {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            
            {/* 학생에게 첨삭 전송하기 버튼 */}
            <button
              onClick={handleSendToStudent}
              disabled={!teacherAudioBase64 && teacherAnnotations.length === 0}
              style={{
                background: (!teacherAudioBase64 && teacherAnnotations.length === 0)
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: (!teacherAudioBase64 && teacherAnnotations.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                opacity: (!teacherAudioBase64 && teacherAnnotations.length === 0) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: (!teacherAudioBase64 && teacherAnnotations.length === 0)
                  ? 'none'
                  : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (teacherAudioBase64 || teacherAnnotations.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (teacherAudioBase64 || teacherAnnotations.length > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              학생에게 첨삭 전송하기
            </button>
          </div>
        </div>

        {/* 도구 모음 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              도구:
            </span>
            {['pen', 'eraser'].map(tool => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                style={{
                  background: selectedTool === tool ? '#3b82f6' : 'white',
                  color: selectedTool === tool ? 'white' : '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tool === 'pen' ? '펜' : '지우개'}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              색상:
            </span>
            {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: selectedColor === color ? '3px solid #1f2937' : '2px solid #e5e7eb',
                  background: color,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              크기:
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              style={{
                width: '100px'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {brushSize}px
            </span>
          </div>

        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        height: 'calc(100vh - 200px)'
      }}>
        {/* PDF 뷰어 영역 */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <StaticPDFViewer
            ref={pdfViewerRef}
            pdfFileName={pdfFilePath}
            pageNum={submission?.currentPage || 1}
            zoomScale={zoomScale}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            brushSize={brushSize}
            isReplaying={isReplaying || isTeacherReplaying}
            isRecording={isRecording}
            recordingStartTime={recordingStartTime}
            onStrokeDataChange={(newStrokeData) => {
              console.log('📝 선생 onStrokeDataChange 호출됨, 스트로크 수:', newStrokeData.length, 'isRecording:', isRecording);
              
              // recordingStartTime이 있으면 타임스탬프 변환 (App.js와 동일한 로직)
              if (recordingStartTime) {
                const updatedStrokeData = newStrokeData.map((stroke) => {
                  // isRecording 플래그가 있고 타임스탬프가 밀리초(숫자)인 경우
                  if (stroke.isRecording && typeof stroke.timestamp === 'number' && stroke.timestamp > 1000000) {
                    // 밀리초를 녹음 시작 이후의 초 단위로 변환
                    const timestamp = (stroke.timestamp - recordingStartTime) / 1000;
                    console.log('⏱️ 선생 타임스탬프 변환:', {
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
                
                console.log('✅ 선생 타임스탬프 변환 완료. 녹음 스트로크:',
                  updatedStrokeData.filter(s => s.isRecording).map(s => ({
                    id: s.id,
                    tool: s.tool,
                    timestamp: typeof s.timestamp === 'number' ? s.timestamp.toFixed(3) + 's' : s.timestamp
                  }))
                );
                
                setTeacherAnnotations(updatedStrokeData);
              } else {
                setTeacherAnnotations(newStrokeData);
              }
            }}
            isTeacherMode={true}
            studentStrokeData={null}
            onPageCountChange={handlePageCountChange}
            onPageChange={handlePageChange}
            feedbackTexts={[]}
          />
          
          {/* 줌 컨트롤 */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 10
          }}>
            <button
              onClick={handleZoomOut}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              -
            </button>
            <span style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* 사이드바 */}
        <div style={{
          width: '300px',
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem',
            fontFamily: 'var(--font-title)'
          }}>
            첨삭 정보
          </h3>

          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                학생:
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {submission.studentName}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                제출 시간:
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                첨삭 개수:
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {teacherAnnotations.length}개
              </span>
            </div>
            {teacherAudioUrl && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  선생 녹음 시간:
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#10b981',
                  fontWeight: '600'
                }}>
                  {Math.floor(teacherAudioDuration / 60)}:{Math.floor(teacherAudioDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* 학습 재생 버튼 (오디오 + 스트로크 동기화) */}
          {submission.audioUrl && (
            <div style={{
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                학생 학습 재생
              </h4>
              <button
                onClick={handleCombinedReplay}
                style={{
                  width: '100%',
                  background: isReplaying 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem'
                }}
              >
                {isReplaying ? '⏸️' : '▶️'}
              </button>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
              </div>
              <audio
                ref={audioRef}
                src={submission?.audioBase64 || submission?.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* 녹음 시작/중지/다시녹음 버튼 */}
          <button
            onClick={() => {
              if (!isRecording && teacherAudioUrl) {
                handleTeacherRerecord();
              } else {
                handleTeacherRecordingToggle();
              }
            }}
            style={{
              width: '100%',
              background: isRecording ? '#1f2937' : (!isRecording && teacherAudioUrl ? '#dc2626' : '#374151'),
              border: isRecording ? '2px solid #fbbf24' : (!isRecording && teacherAudioUrl ? '2px solid #ef4444' : '2px solid #6b7280'),
              color: isRecording ? '#fbbf24' : (!isRecording && teacherAudioUrl ? '#fef2f2' : '#f3f4f6'),
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              animation: isRecording ? 'pulse 2s infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              if (isRecording) return;
              if (teacherAudioUrl) {
                e.currentTarget.style.backgroundColor = '#b91c1c';
                e.currentTarget.style.borderColor = '#dc2626';
              } else {
                e.currentTarget.style.backgroundColor = '#1f2937';
                e.currentTarget.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (isRecording) return;
              if (teacherAudioUrl) {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.borderColor = '#ef4444';
              } else {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.borderColor = '#6b7280';
              }
            }}
          >
            {!isRecording && teacherAudioUrl ? (
              // 다시 녹음 아이콘
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            ) : (
              // 마이크 아이콘
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
            {isRecording ? '녹음 중지' : (!isRecording && teacherAudioUrl ? '다시 녹음' : '녹음 시작')}
          </button>

          {/* 선생 첨삭 재생 버튼 */}
          <button
            onClick={handleTeacherReplay}
            disabled={!teacherAudioUrl && teacherAnnotations.filter(s => s.isRecording).length === 0}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: isTeacherReplaying ? '2px solid #fbbf24' : '2px solid #10b981',
              background: isTeacherReplaying ? 'rgba(251, 191, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: isTeacherReplaying ? '#f59e0b' : '#059669',
              cursor: (!teacherAudioUrl && teacherAnnotations.filter(s => s.isRecording).length === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: (!teacherAudioUrl && teacherAnnotations.filter(s => s.isRecording).length === 0) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = isTeacherReplaying 
                  ? '0 4px 12px rgba(251, 191, 36, 0.4)' 
                  : '0 4px 12px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={isTeacherReplaying ? '재생 중지' : '재생'}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              {isTeacherReplaying ? (
                // 일시정지 아이콘
                <>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </>
              ) : (
                // 재생 아이콘
                <polygon points="5 3 19 12 5 21 5 3" />
              )}
            </svg>
            {isTeacherReplaying ? '재생 중지' : '재생'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubmissionViewer;
