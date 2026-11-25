# HANDOFF

새 세션은 이 파일부터 읽을 것. 세션 끝날 때 갱신.
마지막 갱신: 2026-11-25

## 현재 상태 한 줄
사이트 화면 완성(샘플 데이터 3개), GitHub에 올림. 다음은 실제 플러그인 스캔 → 사이트 반영.

## 저장소
- GitHub: https://github.com/7hyun29/music-plugin-hub (Private), 브랜치 `main`
- 사용 컴퓨터: Windows(Cubase Pro 15) + Mac(VEP 8, Logic) 두 대. 각자 `git clone`해서 `site/index.html`을 연다
- 평소 흐름: `git pull` → 수정 → `bash smoke.sh` → commit → `git push`

## 진행 순서
- [x] 1. git 저장소 + CLAUDE.md / design.md / HANDOFF.md
- [x] 2. plugins.json 항목 확정 + smoke.sh
- [x] 5. 화면 만들기 (검색, 필터, 카드/표 전환) — 사용자 요청으로 순서 앞당김
- [x] GitHub 저장소 생성 + push
- [ ] 3. 스캔 → plugins.json 반영 ← **다음 작업**
- [ ] 4. 종류·태그·메모 채우기
- [ ] 6. 별도 세션에서 리뷰 + smoke.sh로 SMOKE OK 확인

## 다음 작업 (3단계) 상세
제안해 둔 구조 — **사용자 확인 전**이므로 시작 전에 이대로 갈지 먼저 물어볼 것:
- 두 컴퓨터가 plugins.json 한 파일을 동시에 고치면 git 충돌이 나기 쉬움. 그래서 파일을 나눔:
  - `data/scan-windows.json`, `data/scan-mac.json`: 스캔 결과. 각 컴퓨터는 자기 파일만 고침
  - `data/plugins.json`: 직접 쓰는 정보(종류·태그·메모·라이선스)
  - `build.sh`가 셋을 합쳐 `locations`(windows/mac)를 자동으로 채움
- 할 일:
  1. scripts/scan_windows.ps1, scripts/scan_mac.sh 를 위 구조에 맞게 수정 (지금은 바탕화면에 CSV 저장하는 초안)
  2. 같은 플러그인을 어떻게 한 항목으로 묶을지(이름·제조사 기준 id 생성) 정하기
  3. build.sh 합치기 로직 + smoke.sh 검사 추가
  4. 실제 목록이 들어오면 plugins.json의 샘플 3개 삭제 (삭제 전 사용자에게 물어볼 것)
- 스캔 대상 경로와 Kontakt 라이브러리 처리 방법은 scripts/ 안의 두 스크립트 참고
- scan_windows.ps1은 실제 Windows에서 아직 실행해 보지 않음 (작성 환경에 PowerShell 없음)

## 사이트 동작
- site/index.html을 더블클릭으로 열면 됨 (서버 불필요)
- 데이터 흐름: data/plugins.json → build.sh → site/data.js → 화면
- 검색은 띄어쓰기·대소문자 무시 ("게임bgm"으로 "게임 BGM" 검색)
- 필터: 같은 그룹 안은 OR, 그룹끼리는 AND. 칩 숫자는 다른 조건 적용 후 개수
- 태그 클릭 → 그 태그로 검색. `/` 키로 검색창, Esc로 검색 지우기
- 카드/표 선택은 브라우저에 기억됨. 표는 열 제목 클릭으로 정렬

## 결정된 것
- 개인용 로컬 사이트. 서버·DB·클라우드·배포 없음, 외부 라이브러리 없음
- Kontakt 라이브러리도 같은 목록, type `Kontakt 라이브러리`
- 설치 위치는 windows / mac 2칸 (Logic·VEP 구분은 필요하면 태그·메모로)
- 태그는 자유 입력, smoke.sh가 띄어쓰기·대소문자만 다른 태그를 경고
- smoke.sh·build.sh는 Python 3 필요. scripts/python.sh가 python3/python/py 중 실제로 실행되는 것을 찾음 (Windows의 Store 가짜 python3 대응)
- .gitattributes로 .sh 줄바꿈 LF 고정 (Windows Git Bash 실행 오류 방지)

## 사용자 환경 메모
- Windows에 Git for Windows·Python 설치 안내를 마친 상태. 실제 설치·`git config` 완료 여부는 확인 안 됨
- 안내는 한국어로, 명령어는 복사해서 붙일 수 있게, 설치·설정 화면은 단계별로
