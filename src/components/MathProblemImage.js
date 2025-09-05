import React from 'react';

const MathProblemImage = ({ problem, width = 400, height = 300 }) => {
  const problemTypes = {
    '다항식': {
      title: '개념유형 1) 다항식의 연산',
      content: `다음 다항식을 계산하시오.
      
      (1) (3x² + 2x - 1) + (2x² - 3x + 4)
      (2) (x + 2)(x - 3)
      (3) (2x + 1)²`,
      answer: '(1) 5x² - x + 3  (2) x² - x - 6  (3) 4x² + 4x + 1'
    },
    '이차방정식': {
      title: '개념유형 2) 이차방정식의 해',
      content: `다음 이차방정식을 풀어라.
      
      (1) x² - 5x + 6 = 0
      (2) 2x² + 7x + 3 = 0
      (3) x² - 4 = 0`,
      answer: '(1) x = 2, 3  (2) x = -3, -1/2  (3) x = ±2'
    },
    '함수': {
      title: '개념유형 3) 일차함수와 이차함수',
      content: `다음 함수의 그래프를 그리고 성질을 설명하시오.
      
      (1) f(x) = 2x + 3
      (2) g(x) = x² - 4x + 3
      (3) h(x) = -x² + 2x + 1`,
      answer: '(1) 기울기 2, y절편 3  (2) 꼭짓점 (2, -1)  (3) 꼭짓점 (1, 2)'
    },
    '기하': {
      title: '개념유형 4) 평면도형의 성질',
      content: `다음 도형의 넓이를 구하시오.
      
      (1) 반지름이 5cm인 원의 넓이
      (2) 밑변이 8cm, 높이가 6cm인 삼각형의 넓이
      (3) 가로 10cm, 세로 7cm인 직사각형의 넓이`,
      answer: '(1) 25π cm²  (2) 24 cm²  (3) 70 cm²'
    },
    '확률': {
      title: '개념유형 5) 확률과 통계',
      content: `다음 확률을 구하시오.
      
      (1) 주사위를 한 번 던져서 3이 나올 확률
      (2) 동전을 두 번 던져서 모두 앞면이 나올 확률
      (3) 1부터 10까지의 수 중에서 3의 배수를 뽑을 확률`,
      answer: '(1) 1/6  (2) 1/4  (3) 3/10'
    }
  };

  const problemData = problemTypes[problem.type] || problemTypes['다항식'];

  return (
    <div style={{
      width: width,
      height: height,
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      fontFamily: 'AppleMyungjo, serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#374151',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 교재 정보 */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '12px',
        fontSize: '10px',
        color: '#9ca3af',
        fontWeight: '500'
      }}>
        중학교 수학 2-1
      </div>

      {/* 문제 유형 제목 */}
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #3b82f6'
      }}>
        {problemData.title}
      </div>

      {/* 문제 번호 */}
      <div style={{
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '12px',
        fontWeight: '500'
      }}>
        {problem.page}쪽 {problem.number}번
      </div>

      {/* 문제 내용 */}
      <div style={{
        fontSize: '13px',
        lineHeight: '1.8',
        marginBottom: '16px',
        whiteSpace: 'pre-line'
      }}>
        {problemData.content}
      </div>

      {/* 수식 예시 */}
      <div style={{
        background: '#f8fafc',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '12px',
        fontFamily: 'monospace',
        marginBottom: '12px'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
          예시 수식:
        </div>
        <div style={{ color: '#1e40af' }}>
          x² + 2x + 1 = (x + 1)²
        </div>
        <div style={{ color: '#dc2626', marginTop: '4px' }}>
          f(x) = ax² + bx + c
        </div>
      </div>

      {/* 정답 힌트 */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '12px',
        fontSize: '10px',
        color: '#9ca3af',
        fontStyle: 'italic'
      }}>
        정답: {problemData.answer}
      </div>

      {/* 페이지 번호 */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '12px',
        fontSize: '10px',
        color: '#9ca3af'
      }}>
        {problem.page}
      </div>
    </div>
  );
};

export default MathProblemImage;
