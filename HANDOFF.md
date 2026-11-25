# HANDOFF

새 세션은 이 파일부터 읽을 것. 세션 끝날 때 갱신.

## 현재 단계
2단계 완료 — plugins.json 형식 확정(data/SCHEMA.md), smoke.sh 데이터 검사 작성

## 진행 순서
- [x] 1. git 저장소 + CLAUDE.md / design.md / HANDOFF.md
- [x] 2. plugins.json 항목 확정 + smoke.sh (데이터 형식 검사)
- [ ] 3. 스캔 스크립트로 Windows·Mac 목록 각각 뽑기
- [ ] 4. 종류·태그·메모 채우기
- [ ] 5. 화면 만들기 (검색, 필터, 카드/표 전환)
- [ ] 6. 별도 세션에서 리뷰 + smoke.sh로 SMOKE OK 확인

## 다음에 할 일
- 3단계: 스캔 결과(CSV)를 plugins.json 형식으로 바꾸는 변환 스크립트 + Windows·Mac 스캔 실행
- plugins.json의 샘플 3개는 실제 목록이 들어오면 삭제

## 결정된 것
- 개인용 로컬 사이트. 서버·DB·클라우드·배포 없음
- 데이터는 data/plugins.json 한 파일
- Kontakt 라이브러리도 같은 목록, type `Kontakt 라이브러리`
- 설치 위치는 windows / mac 2칸
- 태그는 자유 입력, smoke.sh가 비슷한 태그를 경고
- smoke.sh는 python3 필요 (Windows에서는 Git Bash 등에서 실행)

## 주의
- 스캔 스크립트 초안(scan_windows.ps1, scan_mac.sh)은 별도로 만들어 둠. 3단계에서 scripts/로 가져올 것
