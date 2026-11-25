# HANDOFF

새 세션은 이 파일부터 읽을 것. 세션 끝날 때 갱신.

## 현재 단계
1단계 완료 — git 저장소, CLAUDE.md, design.md, HANDOFF.md, plugins.json 형식 초안

## 진행 순서
- [x] 1. git 저장소 + CLAUDE.md / design.md / HANDOFF.md
- [ ] 2. plugins.json 항목 확정 (초안: data/SCHEMA.md, 샘플 3개)
- [ ] 3. 스캔 스크립트로 Windows·Mac 목록 각각 뽑기
- [ ] 4. 종류·태그·메모 채우기
- [ ] 5. 화면 만들기 (검색, 필터, 카드/표 전환)
- [ ] 6. 별도 세션에서 리뷰 + smoke.sh로 SMOKE OK 확인

## 다음에 할 일
- data/SCHEMA.md의 "정해야 할 것" 결정
- smoke.sh는 2단계에서 형식이 확정되면 작성 (데이터 형식 검사부터)

## 결정된 것
- 개인용 로컬 사이트. 서버·DB·클라우드·배포 없음
- 데이터는 data/plugins.json 한 파일

## 주의
- 스캔 스크립트 초안(scan_windows.ps1, scan_mac.sh)은 별도로 만들어 둠. 3단계에서 scripts/로 가져올 것
