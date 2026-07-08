# 건설뉴스브리핑

**건설 실무자를 위한 공식소식 관제센터**

국토교통부, 대한건설협회, 대한건축사협회, CSI(건설공사 안전관리 종합정보망) 등 공식 출처의 공지·보도자료·정책·안전 정보를 하루 1~2회 자동 수집해 한곳에 모아 보여주는 독립 웹앱입니다.

## 문서방과의 관계

- [문서방](https://nam2037772.github.io/munseobang-open-toolbox/)은 건설인이 도구와 답안 카드를 꺼내 쓰는 작업대입니다.
- 건설뉴스브리핑은 공식 출처 소식만 모아 보여주는 관제센터이며, 별도 독립 앱으로 동작합니다.
- 문서방 메인 화면에는 건설뉴스브리핑으로 이동하는 카드(링크)만 연결되며, 기능 자체는 이 저장소에서 관리합니다.

## 원칙

- 사용자 파일을 저장하지 않습니다.
- 공식 정보를 복사해 쌓아두는 저장소가 아닙니다. 제목, 날짜, 출처, 카테고리, 원문 링크만 저장하고 원문 전문은 저장하지 않습니다.
- 프론트엔드는 크롤링을 직접 수행하지 않습니다. 수집은 GitHub Actions가 서버 측에서 수행합니다.
- 출처 하나가 실패해도 전체 화면과 나머지 출처 수집은 멈추지 않습니다.

## 기술 스택

- React + TypeScript + Vite
- 정적 배포: GitHub Pages
- 수집: Node.js 스크립트(`scripts/fetch-news.mjs`) + GitHub Actions 스케줄

## 설치 및 실행

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

빌드 결과물은 `dist/`에 생성되며 GitHub Pages에 정적 파일로 배포합니다.

## 뉴스 수집 방식

`scripts/fetch-news.mjs`가 아래 출처를 수집해 `public/data/news.json`과 `public/data/meta.json`을 갱신합니다.

1. 국토교통부 — RSS(`board_rss.jsp`) 보도자료·공지사항
2. 대한건설협회 — 공지사항·보도자료 게시판
3. 대한건축사협회 — 공지사항 게시판
4. CSI(건설공사 안전관리 종합정보망) — 공지사항·자료실

로컬에서 수동 실행:

```bash
npm run fetch:news
```

GitHub Actions(`.github/workflows/fetch-news.yml`)가 매일 UTC 0시, 12시(KST 오전 9시, 오후 9시)에 자동 실행하고, 변경된 `public/data/news.json`, `public/data/meta.json`, `scripts/fetch-news-log.json`을 커밋·푸시합니다. 이 커밋은 `deploy.yml`의 배포 워크플로를 다시 트리거해 사이트에 반영됩니다.

### 처리 규칙

- 출처별 최신 항목을 최대 25건까지 유지하고, 전체는 최대 200건으로 제한합니다.
- 기존 데이터와 새로 수집한 데이터는 원문 링크(`url`) 기준으로 중복을 제거합니다.
- 날짜를 읽을 수 없는 항목은 수집일(KST 기준)을 날짜로 대신 사용합니다.
- 제목 키워드로 `AI·디지털`, `법령·고시`, `안전`, `건설기술`, `정책·제도` 카테고리를 보조 분류하며, 해당하지 않으면 출처별 기본 카테고리를 사용합니다.
- 출처 하나가 실패해도 `try/catch`로 감싸 나머지 출처 수집과 파일 저장을 계속 진행하고, 실행 결과는 `scripts/fetch-news-log.json`에 최근 30회까지 남깁니다.

### `news.json` 구조

```json
[
  {
    "source": "국토교통부",
    "category": "정책·제도",
    "title": "제목",
    "date": "2026-07-07",
    "url": "원문 링크",
    "tags": ["건설", "정책"]
  }
]
```

## 새 출처 추가 방법

1. `scripts/fetch-news.mjs`에 해당 출처를 수집하는 `fetchXxx` 함수를 추가합니다. HTML 게시판이면 `extractTrBlocks`로 행을 나눈 뒤 제목·링크·날짜를 정규식으로 추출하고, RSS면 `<item>` 블록을 파싱하는 `fetchMolitFeed` 패턴을 참고합니다.
2. 함수는 `{ source, category, title, date, url, tags }` 배열을 반환해야 합니다. `date`는 `YYYY-MM-DD` 형식이며 파싱에 실패하면 생략해도 수집일로 자동 대체됩니다.
3. `JOBS` 배열에 `{ name, run }` 항목을 추가합니다. `name`은 로그에 표시되는 이름입니다.
4. `npm run fetch:news`로 로컬에서 실행해 `public/data/news.json`에 정상적으로 항목이 추가되는지 확인합니다.
5. 대상 사이트의 `robots.txt`와 이용약관을 확인하고, 제목·날짜·링크 등 최소한의 메타데이터만 수집합니다.

## 화면 구성

- 앱 제목과 소개문
- 출처 필터, 카테고리 필터, 키워드 검색
- 최신순 정렬 목록과 원문보기 버튼
- 새로고침 버튼과 마지막 업데이트 시간 표시
- 공식 출처 링크만 제공한다는 안내문

## 배포

GitHub 저장소를 만든 뒤 `main`(또는 `master`) 브랜치에 푸시하면 `.github/workflows/deploy.yml`이 GitHub Pages로 자동 배포합니다. 저장소 설정의 Pages 소스를 "GitHub Actions"로 지정해야 합니다.
