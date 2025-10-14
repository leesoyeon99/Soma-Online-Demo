import React, { useState, useRef, useEffect } from 'react';

// API 설정 - 환경변수로 분리 가능
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://aiapi-fastapi-dev.t-ime.com';
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const AIChatbot = ({ 
  isOpen, 
  onClose, 
  bookTitle,
  // 캔버스 캡처를 위한 추가 props
  pdfCanvasRef,
  markupCanvasRef,
  currentPageNum,
  pdfFileName
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `안녕하세요! ${bookTitle}에 대해 궁금한 것이 있으시면 언제든 물어보세요. 문제 해결이나 개념 설명을 도와드릴게요! 🤖`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 페이지별 챗 히스토리 키 생성
  const getChatHistoryKey = () => `chatHistory_${pdfFileName}_page${currentPageNum}`;

  // 현재 페이지의 대화를 localStorage에 저장하는 함수
  const saveCurrentConversation = () => {
    if (!pdfFileName || !currentPageNum) return;
    
    const historyKey = getChatHistoryKey();
    const messagesForSave = messages
      .filter(msg => msg.type !== 'ai' || !msg.content.includes('안녕하세요!')) // 초기 인사 메시지 제외
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));
    
    if (messagesForSave.length > 0) {
      const limitedHistory = messagesForSave.slice(-20); // 최대 20개만 저장
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
    }
  };

  // 페이지별 챗 히스토리 로드
  useEffect(() => {
    if (isOpen && pdfFileName && currentPageNum) {
      console.log('📂 히스토리 로드:', `페이지 ${currentPageNum}`, getChatHistoryKey());
      
      const historyKey = getChatHistoryKey();
      const savedHistory = localStorage.getItem(historyKey);
      
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          console.log('✅ 저장된 히스토리 발견:', parsedHistory.length, '개 메시지');
          
          // localStorage의 히스토리를 메시지 형식으로 변환
          const loadedMessages = [
            {
              id: 1,
              type: 'ai',
              content: `안녕하세요! 페이지 ${currentPageNum}에 대해 궁금한 것이 있으시면 언제든 물어보세요! 🤖`,
              timestamp: new Date()
            },
            ...parsedHistory.map((msg, index) => ({
              id: index + 2,
              type: msg.role === 'user' ? 'user' : 'ai',
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            }))
          ];
          setMessages(loadedMessages);
        } catch (error) {
          console.error('❌ 히스토리 로드 실패:', error);
          // 에러 시 초기 메시지만 표시
          setMessages([{
            id: 1,
            type: 'ai',
            content: `안녕하세요! 페이지 ${currentPageNum}에 대해 궁금한 것이 있으시면 언제든 물어보세요! 🤖`,
            timestamp: new Date()
          }]);
        }
      } else {
        console.log('ℹ️ 저장된 히스토리 없음 - 초기 메시지 표시');
        // 히스토리 없으면 초기 메시지
        setMessages([{
          id: 1,
          type: 'ai',
          content: `안녕하세요! 페이지 ${currentPageNum}에 대해 궁금한 것이 있으시면 언제든 물어보세요! 🤖`,
          timestamp: new Date()
        }]);
      }
    }
  }, [currentPageNum, pdfFileName, isOpen]); // isOpen 다시 추가!

  // 이전 페이지 번호 추적
  const prevPageNumRef = useRef(currentPageNum);
  
  // 페이지가 바뀔 때 이전 페이지의 대화 저장
  useEffect(() => {
    if (prevPageNumRef.current !== currentPageNum) {
      console.log(`📝 페이지 변경 감지: ${prevPageNumRef.current} → ${currentPageNum}`);
      
      // 이전 페이지의 대화 저장
      if (messages.length > 1) { // 초기 메시지 외에 대화가 있으면
        const prevHistoryKey = `chatHistory_${pdfFileName}_page${prevPageNumRef.current}`;
        const messagesForSave = messages
          .filter(msg => msg.type !== 'ai' || !msg.content.includes('안녕하세요!'))
          .map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }));
        
        if (messagesForSave.length > 0) {
          localStorage.setItem(prevHistoryKey, JSON.stringify(messagesForSave.slice(-20)));
          console.log(`✅ 페이지 ${prevPageNumRef.current} 대화 저장 완료`);
        }
      }
      
      // 현재 페이지 번호 업데이트
      prevPageNumRef.current = currentPageNum;
    }
  }, [currentPageNum, pdfFileName, messages]);

  // 챗봇이 닫힐 때 현재 대화 저장
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      console.log('💾 챗봇 닫힘 - 현재 대화 저장');
      saveCurrentConversation();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 캔버스를 이미지로 캡처하는 함수
  const captureCanvas = () => {
    if (!pdfCanvasRef?.current || !markupCanvasRef?.current) {
      console.warn('캔버스를 찾을 수 없습니다. 텍스트만 전송합니다.');
      return null;
    }

    try {
      const pdfCanvas = pdfCanvasRef.current;
      const markupCanvas = markupCanvasRef.current;
      
      // 임시 캔버스 생성 (두 캔버스 합치기)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = pdfCanvas.width;
      tempCanvas.height = pdfCanvas.height;
      const ctx = tempCanvas.getContext('2d');
      
      // 백그라운드 흰색으로 설정 (AI 분석에 유리)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // PDF 원본 그리기
      ctx.drawImage(pdfCanvas, 0, 0);
      
      // 필기 레이어 그리기
      ctx.drawImage(markupCanvas, 0, 0);
      
      // Base64로 변환 (JPEG, 품질 0.8) - 파일 크기 최적화
      const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);
      
      // 메모리 정리
      tempCanvas.width = 0;
      tempCanvas.height = 0;
      
      return imageData;
    } catch (error) {
      console.error('캔버스 캡처 오류:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // AI 메시지 생성 (빈 내용으로 시작)
    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      // 스트리밍 모드로 API 호출 (기본값)
      await generateAIResponseStreaming(currentInput, (chunk) => {
        // 실시간으로 메시지 업데이트
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: chunk }
              : msg
          )
        );
      });
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      
      // 에러 메시지로 교체
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.' }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // AI 응답 생성 함수 (스트리밍 모드 - 기본값)
  const generateAIResponseStreaming = async (userInput, onChunk) => {
    try {
      // 현재 페이지 캡처
      const pageImage = captureCanvas();
      
      // 현재 페이지의 챗 히스토리 로드 (최근 5개만)
      const currentHistoryKey = getChatHistoryKey();
      const currentSavedHistory = localStorage.getItem(currentHistoryKey) || '[]';
      const currentParsedHistory = JSON.parse(currentSavedHistory);
      const recentHistory = currentParsedHistory.slice(-5); // 최근 5개 대화만
      
      // API 호출
      const requestBody = {
        question: userInput,
        pageNumber: currentPageNum || 1,
        bookTitle: bookTitle,
        pdfFileName: pdfFileName || 'unknown.pdf',
        streaming: true, // 스트리밍 모드 활성화
        chatHistory: recentHistory, // 최근 5개 대화 히스토리 추가
        ...(pageImage && { imageData: pageImage })
      };

      console.log('AI API 호출 (스트리밍):', {
        question: userInput,
        pageNumber: currentPageNum,
        hasImage: !!pageImage,
        historyCount: recentHistory.length
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/soma-online/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API 에러: ${response.status} ${response.statusText}`);
      }

      // SSE 스트림 읽기
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = ''; // 불완전한 청크를 위한 버퍼

      console.log('🔄 스트리밍 시작...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ 스트림 읽기 완료');
          break;
        }

        // 청크 디코딩
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        console.log('📦 받은 청크:', chunk);

        // 완전한 라인들만 처리
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 마지막 불완전한 라인은 버퍼에 보관

        for (const line of lines) {
          console.log('📝 처리 중인 라인:', line);
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim(); // 'data: ' 제거 및 공백 제거
            
            if (data === '[DONE]') {
              console.log('🏁 스트리밍 완료 신호 받음');
              return fullResponse;
            }

            if (!data) continue; // 빈 데이터 스킵

            // JSON인지 순수 텍스트인지 판별
            if (data.startsWith('{')) {
              // JSON 형식
              try {
                const parsed = JSON.parse(data);
                console.log('✨ JSON 파싱 성공:', parsed);
                
                if (parsed.content) {
                  fullResponse += parsed.content;
                  console.log('💬 누적 응답 길이:', fullResponse.length);
                  
                  // 실시간으로 UI 업데이트
                  if (onChunk) {
                    onChunk(fullResponse);
                  }
                }
                if (parsed.error) {
                  console.error('❌ 에러 수신:', parsed.error);
                  throw new Error(parsed.error);
                }
              } catch (e) {
                console.warn('⚠️ JSON 파싱 실패:', data, e.message);
              }
            } else {
              // 순수 텍스트 형식 (현재 백엔드 방식)
              console.log('💬 텍스트 수신:', data.substring(0, 50) + '...');
              fullResponse += data;
              
              // 실시간으로 UI 업데이트
              if (onChunk) {
                onChunk(fullResponse);
              }
            }
          }
        }
      }

      console.log('📊 최종 응답 길이:', fullResponse.length);
      
      // 히스토리 저장은 saveCurrentConversation()에서 일괄 처리
      return fullResponse;
      
    } catch (error) {
      console.error('AI 응답 생성 오류 (스트리밍):', error);
      throw error;
    }
  };

  // 논스트리밍 모드 (테스트용)
  const generateAIResponseNonStreaming = async (userInput) => {
    try {
      const pageImage = captureCanvas();
      
      // 현재 페이지의 챗 히스토리 로드 (최근 5개만)
      const currentHistoryKey2 = getChatHistoryKey();
      const currentSavedHistory2 = localStorage.getItem(currentHistoryKey2) || '[]';
      const currentParsedHistory2 = JSON.parse(currentSavedHistory2);
      const recentHistory = currentParsedHistory2.slice(-5);
      
      const requestBody = {
        question: userInput,
        pageNumber: currentPageNum || 1,
        bookTitle: bookTitle,
        pdfFileName: pdfFileName || 'unknown.pdf',
        streaming: false,
        chatHistory: recentHistory, // 최근 5개 대화 히스토리 추가
        ...(pageImage && { imageData: pageImage })
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/soma-online/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(300000)
      });

      if (!response.ok) {
        throw new Error(`API 에러: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.data?.result?.content || data.answer || data.response || data.message || '응답을 받지 못했습니다.';
      
      console.log('백엔드 응답 (논스트리밍):', data);

      // 히스토리 저장은 saveCurrentConversation()에서 일괄 처리
      return aiResponse;
      
    } catch (error) {
      console.error('AI 응답 생성 오류 (논스트리밍):', error);
      throw error;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                AI 학습 도우미
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.8rem',
                opacity: 0.9
              }}>
                {bookTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              {message.type === 'ai' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
              )}
              
              <div style={{
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: message.type === 'user' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : '#f1f5f9',
                color: message.type === 'user' ? 'white' : '#1e293b',
                fontSize: '0.9rem',
                lineHeight: 1.4,
                wordWrap: 'break-word'
              }}>
                {message.content}
              </div>

              {message.type === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '18px 18px 18px 4px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#64748b',
                  animation: 'typing 1.4s infinite ease-in-out'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#64748b',
                  animation: 'typing 1.4s infinite ease-in-out 0.2s'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#64748b',
                  animation: 'typing 1.4s infinite ease-in-out 0.4s'
                }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end'
          }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="궁금한 것을 물어보세요..."
              style={{
                flex: 1,
                minHeight: '40px',
                maxHeight: '120px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: inputMessage.trim() 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : '#d1d5db',
                border: 'none',
                color: 'white',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;
