# 동혁 . 포트폴리오

김동혁의 React + Vite 포트폴리오입니다. 화면 문구는 한국어로 구성되어 있으며, 작품이 없을 때는 빈 3D 카드와 “아직 업로드된 작품이 없습니다” 안내를 표시합니다.

## 실행

Node.js 22.12 이상이 필요합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드와 미리보기:

```bash
npm run build
npm run preview
```

## 사이트에서 작품 올리기

1. 사이트 오른쪽 위의 **작품 관리 ＋**를 누릅니다. 작품이 하나도 없을 때는 첫 화면의 **작품 업로드 ＋** 버튼도 사용할 수 있습니다.
2. 대표 이미지와 작품 이름, 한 줄 소개를 입력합니다. 분야, 연도, 역할, 기간, 도구와 상세 내용은 선택 사항입니다.
3. 필요하면 추가 이미지를 최대 6장 선택합니다.
4. **작품 저장하기**를 누릅니다.

저장하면 다음 위치에 동시에 반영됩니다.

- 첫 화면 3D 캐러셀
- 02 작품 목록
- 작품 상세 페이지
- 다음 작품 연결

이미지는 브라우저에서 긴 쪽을 최대 1800px로 줄이고 WebP로 변환합니다. SVG와 GIF는 원본 형식을 유지합니다. 한 장당 최대 크기는 12MB입니다.

### 모든 기기에 작품 게시하기

사이트에서 올린 작품은 작성 중 내용이 사라지지 않도록 현재 브라우저의 IndexedDB에 임시 저장됩니다. 입력을 마치면 작품 관리 화면 아래의 **GitHub에 게시하기 ↑**로 공개할 수 있습니다.

처음 한 번만 GitHub Fine-grained personal access token을 준비합니다.

1. 작품 관리의 **처음 게시할 때 필요한 설정**을 엽니다.
2. 안내 링크에서 Repository access를 **Only select repositories → dhportfolio**로 지정합니다.
3. Repository permissions의 **Contents**만 **Read and write**로 설정합니다.
4. 발급된 토큰을 입력하고 **GitHub에 게시하기 ↑**를 누릅니다.

게시할 때 이미지 파일과 `public/portfolio-data.json`을 하나의 Git 커밋으로 저장하고 GitHub Actions가 자동 배포합니다. 약 1분 뒤 새 방문자와 다른 기기에서도 같은 작품을 볼 수 있습니다. 토큰은 React 상태에서 요청에만 사용하며 IndexedDB, localStorage, 저장소에 보관하지 않습니다.

**백업 파일 받기 ↓**와 **백업 불러오기**로 수동 백업과 복원도 가능합니다.

## 작품 삭제

작품 관리 화면의 저장된 작품 목록에서 **삭제**를 누릅니다. 삭제는 현재 브라우저의 초안에 먼저 적용되며, **GitHub에 게시하기 ↑**를 눌러야 모든 기기의 공개 사이트에서도 사라집니다.

## 모바일 UI

화면 폭 700px 이하에서는 홈·작품·업로드·소개·연락처를 담은 하단 빠른 메뉴가 나타납니다. 작품 관리 화면은 전체 화면 편집기로 바뀌고 입력 요소는 모바일 브라우저의 자동 확대를 막는 16px 글자 크기를 사용합니다. 하단 안전 영역과 320px 폭까지의 가로 넘침을 지원합니다.

## 개인정보 수정

`src/data/profile.js`에서 이름, 소개, 이메일, 전화번호와 경력 정보를 수정합니다.

현재 입력된 연락처:

```js
fullName: "김동혁",
email: "gimd50236@gmail.com",
phone: "010-4109-6552",
```

사이트 이름과 브라우저 제목은 다음 값에서 만들어집니다.

```js
name: "동혁 . 포트폴리오",
title: "디자이너 / 개발자",
```

경력은 아직 예시 상태입니다. 실제 경력으로 바꾼 뒤 `experienceIsSample`을 `false`로 변경하면 예시 안내가 사라집니다.

## GitHub Pages 배포

저장소가 아직 없다면 프로젝트 폴더에서 다음 명령을 실행합니다. `YOUR_USERNAME`과 저장소 주소는 본인 정보로 변경하세요.

```bash
git init
git add .
git commit -m "Create portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/donghyuk-portfolio.git
git push -u origin main
```

GitHub 저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다. 이후 `main`에 push할 때마다 `.github/workflows/deploy.yml`이 설치, 빌드, 배포를 자동으로 실행합니다.

Vite 경로는 Actions에서 실제 Pages 하위 경로를 자동으로 전달받습니다. 저장소 이름을 코드에 직접 적을 필요가 없습니다. 상세 페이지는 `HashRouter`를 사용하므로 GitHub Pages에서 새로고침해도 404가 발생하지 않습니다.

## 주요 파일

```text
public/portfolio-data.json        공개 사이트의 작품 데이터
src/context/ProjectsContext.jsx   업로드, 이미지 최적화, 초안과 공개 데이터 동기화
src/components/ProjectManager.jsx 작품 관리 화면
src/components/MobileNav.jsx      모바일 하단 빠른 메뉴
src/lib/githubPublisher.js        GitHub 저장소 게시
src/components/EmptyPortfolio.jsx 빈 작품 상태
src/data/profile.js               이름, 소개, 연락처, 경력
src/styles/global.css             전체 디자인과 반응형 스타일
.github/workflows/deploy.yml      GitHub Pages 자동 배포
```

## 확인

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm run test:e2e
```

또는 Playwright Chromium을 설치해 실행할 수 있습니다.

```bash
npx playwright install chromium
npm run test:e2e
```

검사는 빈 작품 화면, 한국어 문구, 연락처, 320–1440px 가로 넘침, 실제 이미지 업로드, JSON 다운로드, 카드·상세 페이지 생성, 새로고침 후 유지, 작품 삭제와 모바일 메뉴를 확인합니다.

사이트에 표시되는 이메일과 전화번호는 공개 GitHub Pages에 배포하면 누구나 볼 수 있습니다.
