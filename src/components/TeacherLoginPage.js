import React, { useState } from 'react';


import * as commonJs from '../component/CommonJs';
//import GlobalStore from '../store/GlobalStore';
import { API_RES_CODE,  } from '../component/AppConstants';
import { Base64 } from 'js-base64';

const TeacherLoginPage = ({ onLogin }) => {
    if(window.sessionStorage.getItem("noma@secure_token") !== null && window.sessionStorage.getItem("noma@secure_token") !== "") {
        onLogin();
    }

  const [formData, setFormData] = useState({
    id: 'ams001',
    password: 'abcde12345'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id && formData.password) {
      //onLogin();
      const login_id = formData.id;
      const login_pwd = formData.password;
      const site = "MS";
      //const memberGradeCode = this.state.memberGradeCode;

      let bodyData = {login_id:login_id, login_pwd:login_pwd, login_type:'E'};
      commonJs.fetchApiCall(site, "answer1000", bodyData)
      .then(responseJson => {

          if(responseJson.result_code === API_RES_CODE.SUCCESS) {
              const member = responseJson.member;

              if(member.MEM_GRADE_CODE === "600" || member.MEM_GRADE_CODE === "700" || member.MEM_GRADE_CODE === "9900" ){
                  alert("강사 계정으로 로그인 가능 합니다.");
                  return;
              }
              window.sessionStorage.setItem("noma@mem_seq", Base64.encode(member.MEM_SEQ));
              window.sessionStorage.setItem("noma@center_seq", Base64.encode(member.CENTER_SEQ));
              window.sessionStorage.setItem("noma@group_code", Base64.encode(member.GROUP_CODE));
              window.sessionStorage.setItem("noma@login_id", Base64.encode(member.LOGIN_ID));
              window.sessionStorage.setItem("noma@mem_name", Base64.encode(member.MEM_NAME));
              window.sessionStorage.setItem("noma@login_token", Base64.encode(member.LOGIN_TOKEN));
              window.sessionStorage.setItem("noma@secure_token", Base64.encode(responseJson.secure_token));

              onLogin();
          }
          else
          {
              alert('로그인 정보가 올바르지 않습니다. 다시 확인해주세요.');
          }

      });
    } else {
      alert('아이디와 비밀번호를 입력해주세요.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 40px rgba(30, 58, 138, 0.3)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        maxWidth: '400px',
        width: '100%',
        margin: '1rem'
      }}>
        {/* 로고 및 제목 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-title)'
          }}>
            강사 로그인
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            fontFamily: 'var(--font-body)'
          }}>
            채점 및 피드백 시스템에 접속하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)'
            }}>
              강사 ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="강사 ID를 입력하세요"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
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

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-ui)'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
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

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-ui)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            강사 로그인
          </button>


          <button
              onClick={onLogin}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-ui)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              로그인 취소
            </button>
        </form>

        {/* 데모 안내 */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#1e40af',
            textAlign: 'center',
            margin: 0,
            fontFamily: 'var(--font-body)'
          }}>
            💡 데모용 로그인: 아무 ID/비밀번호나 입력하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
