import React, { useState } from 'react';

const DemoSection = ({ currentDemo, setCurrentDemo }) => {
  const [counter, setCounter] = useState(0);
  const [todoList, setTodoList] = useState(['React 학습하기', '프로젝트 완성하기']);
  const [newTodo, setNewTodo] = useState('');

  const demos = {
    home: {
      title: '환영합니다!',
      content: (
        <div className="fade-in">
          <h3>소마 온라인 데모에 오신 것을 환영합니다!</h3>
          <p>이 애플리케이션은 React로 만들어진 인터랙티브 데모입니다.</p>
          <div className="interactive-demo">
            <div className="demo-box" onClick={() => setCurrentDemo('counter')}>
              <h4>카운터</h4>
              <p>클릭하여 시작</p>
            </div>
            <div className="demo-box" onClick={() => setCurrentDemo('todo')}>
              <h4>할일 목록</h4>
              <p>클릭하여 시작</p>
            </div>
            <div className="demo-box" onClick={() => setCurrentDemo('animation')}>
              <h4>애니메이션</h4>
              <p>클릭하여 시작</p>
            </div>
          </div>
        </div>
      )
    },
    counter: {
      title: '카운터 데모',
      content: (
        <div className="counter-demo fade-in">
          <h3>인터랙티브 카운터</h3>
          <p>버튼을 클릭하여 숫자를 변경해보세요!</p>
          <div className="counter-display">{counter}</div>
          <div className="counter-buttons">
            <button className="counter-btn" onClick={() => setCounter(counter - 1)}>
              -1
            </button>
            <button className="counter-btn" onClick={() => setCounter(0)}>
              리셋
            </button>
            <button className="counter-btn" onClick={() => setCounter(counter + 1)}>
              +1
            </button>
          </div>
        </div>
      )
    },
    todo: {
      title: '할일 목록 데모',
      content: (
        <div className="fade-in">
          <h3>할일 목록 관리</h3>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="새로운 할일을 입력하세요"
              style={{
                padding: '0.5rem',
                marginRight: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                width: '250px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTodo.trim()) {
                  setTodoList([...todoList, newTodo]);
                  setNewTodo('');
                }
              }}
            />
            <button
              className="counter-btn"
              onClick={() => {
                if (newTodo.trim()) {
                  setTodoList([...todoList, newTodo]);
                  setNewTodo('');
                }
              }}
            >
              추가
            </button>
          </div>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            {todoList.map((todo, index) => (
              <li
                key={index}
                style={{
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {todo}
                <button
                  onClick={() => setTodoList(todoList.filter((_, i) => i !== index))}
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    animation: {
      title: '애니메이션 데모',
      content: (
        <div className="fade-in">
          <h3>CSS 애니메이션 효과</h3>
          <p>아래 박스들은 호버 효과와 애니메이션을 가지고 있습니다.</p>
          <div className="interactive-demo">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="demo-box">
                <h4>박스 {num}</h4>
                <p>호버해보세요!</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  };

  return (
    <section className="demo-section">
      <div className="container">
        <div className="demo-navigation">
          <button
            className={`demo-button ${currentDemo === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentDemo('home')}
          >
            홈
          </button>
          <button
            className={`demo-button ${currentDemo === 'counter' ? 'active' : ''}`}
            onClick={() => setCurrentDemo('counter')}
          >
            카운터
          </button>
          <button
            className={`demo-button ${currentDemo === 'todo' ? 'active' : ''}`}
            onClick={() => setCurrentDemo('todo')}
          >
            할일 목록
          </button>
          <button
            className={`demo-button ${currentDemo === 'animation' ? 'active' : ''}`}
            onClick={() => setCurrentDemo('animation')}
          >
            애니메이션
          </button>
        </div>
        <div className="demo-content">
          <h2>{demos[currentDemo].title}</h2>
          {demos[currentDemo].content}
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
