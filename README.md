# 소마 온라인 데모

React 기반의 디지털 학습 플랫폼 데모입니다. 학생과 선생님 간의 실시간 필기 소통 기능을 제공합니다.

## 🚀 라이브 데모

[여기서 라이브 데모를 확인하세요](https://yourusername.github.io/Soma-Online-Demo)

## 📋 주요 기능

### 🎓 학생 기능
- **디지털 필기**: 펜, 지우개, 하이라이터 도구로 자유로운 필기
- **음성 녹음**: 마이크를 통한 실시간 음성 녹음
- **통합 재생**: 필기와 음성을 동시에 재생하여 학습 과정 복원
- **선생님 제출**: 필기와 녹음을 선생님에게 제출
- **첨삭 확인**: 선생님의 첨삭을 on/off 토글로 확인

### 👨‍🏫 선생님 기능
- **학생 제출물 확인**: 학생의 필기와 녹음을 실시간으로 확인
- **레이어 시스템**: 학생 필기(파란색)와 선생님 첨삭(빨간색)을 구분하여 표시
- **첨삭 작성**: 학생 제출물 위에 첨삭 작성
- **첨삭 전송**: 완성된 첨삭을 학생에게 전송

### 🔔 알림 시스템
- **실시간 알림**: 학생-선생님 간 소통 알림
- **알림 센터**: 모든 소통 내역을 시간순으로 정리
- **알림 배지**: 읽지 않은 알림 개수 표시

## 🛠️ 기술 스택

- React 18
- CSS3 (Flexbox, Grid, Animations)
- GitHub Pages (배포)
- GitHub Actions (자동 배포)

## 🏃‍♂️ 로컬 실행

### 필수 요구사항

- Node.js (14.0.0 이상)
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/yourusername/soma-online-demo.git
   cd soma-online-demo
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 시작**
   ```bash
   npm start
   ```

   브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📦 빌드

프로덕션용 빌드를 생성하려면:

```bash
npm run build
```

## 🚀 배포

### GitHub Pages 배포 (docs 폴더 사용)

1. **package.json의 homepage 수정**
   ```json
   "homepage": "https://yourusername.github.io/soma-online-demo"
   ```

2. **자동 배포 스크립트 실행**
   ```bash
   ./deploy-docs.sh
   ```

3. **Git에 커밋하고 푸시**
   ```bash
   git add docs/
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **GitHub 저장소 설정**
   - Settings → Pages → Source: "Deploy from a branch"
   - Branch: "main" / "docs" 폴더 선택

### 수동 배포

```bash
# 빌드
npm run build

# docs 폴더에 복사
cp -r build/* docs/

# Git에 추가
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🔧 프로젝트 구조

```
soma-online-demo/
├── docs/                    # GitHub Pages 배포용 빌드 파일
│   ├── index.html
│   ├── static/
│   └── assets/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── assets/
├── src/
│   ├── components/
│   │   ├── LandingPage.js
│   │   ├── LoginPage.js
│   │   ├── BookListPage.js
│   │   ├── TeacherBookListPage.js
│   │   ├── ImageViewer.js
│   │   ├── AIChatbot.js
│   │   └── ...
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .github/workflows/       # GitHub Actions 자동 배포
├── deploy-docs.sh          # 배포 스크립트
├── .nojekyll              # GitHub Pages 설정
├── package.json
└── README.md
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 연락처

프로젝트 링크: [https://github.com/yourusername/soma-online-demo](https://github.com/yourusername/soma-online-demo)
