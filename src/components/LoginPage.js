import React, { useState } from 'react';

import * as commonJs from '../component/CommonJs';
//import GlobalStore from '../store/GlobalStore';
import { API_RES_CODE,  } from '../component/AppConstants';
import { Base64 } from 'js-base64';
//import $ from 'jquery';



const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('20251023');
  const [password, setPassword] = useState('abcde12345');


    if(window.sessionStorage.getItem("noma@secure_token") !== null && window.sessionStorage.getItem("noma@secure_token") !== "") {
        onLogin();
    }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      //onLogin();

        const login_id = username;
        const login_pwd = password;
        const site = "MS";
        //const memberGradeCode = this.state.memberGradeCode;

        let bodyData = {login_id:login_id, login_pwd:login_pwd, login_type:'E'};
        commonJs.fetchApiCall(site, "answer1000", bodyData)
        .then(responseJson => {

            if(responseJson.result_code === API_RES_CODE.SUCCESS) {
                const member = responseJson.member;
                if(member.MEM_GRADE_CODE !== "600"){
                    alert("학생 계정으로 로그인 가능 합니다.");
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

    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'SEBANG Gothic', sans-serif"
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '2px solid #f1f5f9',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        {/* 로고/제목 */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '20px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'SEBANG Gothic', sans-serif",
            fontWeight: '700',
            fontSize: '2rem',
            color: '#1e293b',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            소마 온라인 학습
          </h1>
          <p style={{
            fontFamily: "'SEBANG Gothic', sans-serif",
            fontWeight: '400',
            fontSize: '1rem',
            color: '#64748b'
          }}>
            교재를 보고 그리며 배우는 즐거운 학습 공간
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: "'SEBANG Gothic', sans-serif",
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: "'SEBANG Gothic', sans-serif",
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontFamily: "'SEBANG Gothic', sans-serif",
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 15px -3px rgba(249, 115, 22, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.3)';
            }}
          >
            로그인
          </button>

            <div style={{height:'30px'}} />
          <button
              onClick={onLogin}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontFamily: "'SEBANG Gothic', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 15px -3px rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.3)';
              }}
            >
              로그인 취소
            </button>

        </form>

        {/* 데모 안내
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <p style={{
            fontFamily: "'SEBANG Gothic', sans-serif",
            fontSize: '0.875rem',
            color: '#0369a1',
            margin: '0'
          }}>
            💡 데모용 로그인: 아무 아이디/비밀번호 입력 후 로그인 버튼 클릭
          </p>
        </div>*/}
      </div>
    </div>
  );
};

export default LoginPage;
