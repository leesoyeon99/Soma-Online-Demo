#!/bin/bash

# React 앱을 빌드하고 docs 폴더에 배포하는 스크립트

echo "🚀 React 앱 빌드 시작..."

# 의존성 설치
npm install

# React 앱 빌드
npm run build

echo "📁 빌드된 파일을 docs 폴더로 복사..."

# docs 폴더가 없으면 생성
mkdir -p docs

# 빌드된 파일들을 docs 폴더로 복사
cp -r build/* docs/

# .nojekyll 파일 추가 (GitHub Pages에서 필요)
touch docs/.nojekyll

echo "✅ 배포 준비 완료!"
echo "📝 다음 명령어로 Git에 커밋하고 푸시하세요:"
echo "   git add docs/"
echo "   git commit -m 'Deploy to GitHub Pages'"
echo "   git push origin main"
