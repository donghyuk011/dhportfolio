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
2. 아이디 `donghyuk011`과 관리자 비밀번호로 로그인합니다. 로그인 메일이나 GitHub 토큰은 사용하지 않습니다.
3. 대표 이미지와 작품 이름, 한 줄 소개를 입력합니다. 분야, 연도, 역할, 기간, 도구와 상세 내용은 선택 사항입니다.
4. 필요하면 추가 이미지를 최대 6장 선택합니다.
5. **모든 기기에 게시하기 ↑**를 누릅니다.

저장하면 다음 위치에 동시에 반영됩니다.

- 첫 화면 3D 캐러셀
- 02 작품 목록
- 작품 상세 페이지
- 다음 작품 연결

이미지는 브라우저에서 긴 쪽을 최대 1800px로 줄이고 WebP로 변환합니다. SVG와 GIF는 원본 형식을 유지합니다. 한 장당 최대 크기는 12MB입니다.

### 모든 기기에 작품 게시하기

작품 정보는 Supabase 데이터베이스에, 이미지는 Supabase Storage에 저장됩니다. 게시하거나 삭제하면 새 빌드를 기다리지 않고 모든 기기에 바로 반영됩니다. 방문자는 로그인 없이 작품을 볼 수 있고, 등록·삭제는 관리자 이메일과 비밀번호로 로그인한 경우에만 허용됩니다. 로그인 과정에서 이메일을 보내지 않으며 GitHub 토큰도 필요하지 않습니다.

이전 버전에서 현재 브라우저에 저장한 작품이 있다면 로그인 후 표시되는 **기존 작품 가져오기 ↑**를 한 번 눌러 클라우드로 옮길 수 있습니다.

**백업 파일 받기 ↓**와 **백업 불러오기**로 수동 백업과 복원도 가능합니다.

## 작품 삭제

관리자로 로그인한 뒤 작품 관리 화면의 게시된 작품 목록에서 **삭제**를 누릅니다. 삭제 결과는 모든 기기에 바로 반영됩니다.

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
public/portfolio-data.json        Supabase 연결 실패 시 사용할 기본 데이터
src/context/ProjectsContext.jsx   인증, 업로드, 이미지 최적화, Supabase 동기화
src/components/ProjectManager.jsx 작품 관리 화면
src/components/MobileNav.jsx      모바일 하단 빠른 메뉴
src/lib/supabase.js               Supabase 프로젝트 연결 설정
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

검사는 빈 작품 화면, 한국어 문구, 연락처, 320–1440px 가로 넘침, 관리자 이메일 로그인 화면, GitHub 토큰 입력 제거와 모바일 메뉴를 확인합니다.

사이트에 표시되는 이메일과 전화번호는 공개 GitHub Pages에 배포하면 누구나 볼 수 있습니다.
