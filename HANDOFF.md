# HANDOFF

새 세션은 이 파일부터 읽을 것. 세션 끝날 때 갱신.

## 현재 단계
사이트 먼저 완성 (5단계를 3·4단계보다 앞당김). 지금은 샘플 데이터 3개로 동작.

## 진행 순서
- [x] 1. git 저장소 + CLAUDE.md / design.md / HANDOFF.md
- [x] 2. plugins.json 항목 확정 + smoke.sh
- [x] 5. 화면 만들기 (검색, 필터, 카드/표 전환) — 순서 앞당김
- [ ] 3. 스캔 스크립트로 Windows·Mac 목록 각각 뽑기 → plugins.json 반영
- [ ] 4. 종류·태그·메모 채우기
- [ ] 6. 별도 세션에서 리뷰 + smoke.sh로 SMOKE OK 확인

## 다음에 할 일
- 3단계: 스캔 결과(CSV)를 plugins.json 형식으로 바꾸는 변환 스크립트 작성 + Windows·Mac 스캔 실행
- 실제 목록이 들어오면 plugins.json의 샘플 3개 삭제

## 사이트 동작
- site/index.html을 더블클릭으로 열면 됨 (서버 불필요)
- 데이터 흐름: data/plugins.json → build.sh → site/data.js → 화면
- 검색은 띄어쓰기·대소문자 무시 ("게임bgm"으로 "게임 BGM" 검색)
- 필터: 같은 그룹 안은 OR, 그룹끼리는 AND. 칩 숫자는 다른 조건 적용 후 개수
- 태그 클릭 → 그 태그로 검색. `/` 키로 검색창, Esc로 검색 지우기
- 카드/표 선택은 브라우저에 기억됨. 표는 열 제목 클릭으로 정렬

## 결정된 것
- 개인용 로컬 사이트. 서버·DB·클라우드·배포 없음, 외부 라이브러리 없음
- 데이터는 data/plugins.json 한 파일
- Kontakt 라이브러리도 같은 목록, type `Kontakt 라이브러리`
- 설치 위치는 windows / mac 2칸
- 태그는 자유 입력, smoke.sh가 비슷한 태그를 경고
- smoke.sh·build.sh는 python3 필요 (Windows에서는 Git Bash 등에서 실행)

## 주의
- 스캔 스크립트 초안(scan_windows.ps1, scan_mac.sh)은 별도로 만들어 둠. 3단계에서 scripts/로 가져올 것
