# 음악 플러그인 허브
설치한 음악 플러그인을 한눈에 보는 개인용 사이트. 서버·DB 없음.
GitHub Pages로 공개됨: https://7hyun29.github.io/music-plugin-hub/ (main에 push하면 반영)

# 절대 규칙
- 작업 시작 전 `git status` 확인, 작업 단위마다 커밋
- 파일 삭제·이동은 반드시 먼저 물어볼 것
- UI 작업 전 design.md 필독
- 완료 보고에는 smoke.sh 실행 결과(마지막 줄 `SMOKE OK`) 첨부
- 새 라이브러리·도구 추가 전 이유를 설명하고 허락받기
- 같은 문제로 2번 실패하면 멈추고 상황을 보고할 것
- 라이선스 시리얼·비밀번호는 어떤 파일에도 쓰지 않기 (저장소와 사이트가 공개 상태)
- push 전에 반드시 `bash smoke.sh` — site/data.js가 갱신돼야 Pages 사이트에 반영됨
- 화면은 data/plugins.json을 보여주기만 함. 데이터를 화면 코드에 직접 쓰지 않기

- plugins.json 수정 후에는 `bash smoke.sh` (형식 검사 + site/data.js 재생성)
- site/data.js는 자동 생성 파일. 직접 고치지 않기

# 문서 지도
- 사이트: site/index.html (브라우저로 바로 열기) / site/app.js / site/style.css
- 진행 상황·다음 할 일: HANDOFF.md (세션 끝날 때 반드시 갱신)
- 디자인 규칙: design.md
- 데이터 형식: data/SCHEMA.md / 데이터: data/plugins.json
