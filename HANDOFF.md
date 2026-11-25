# HANDOFF

새 세션은 이 파일부터 읽을 것. 세션 끝날 때 갱신.
마지막 갱신: 2026-11-25

## 현재 상태 한 줄
Mac 47개 반영 + ChatGPT 리뷰 1차 반영(데이터 v2 기기별 설치 기록, 접근성, 검색, 좁은 화면). 다음은 Windows 스캔 반영 + 종류 검토.

## 저장소
- GitHub: https://github.com/7hyun29/music-plugin-hub, 브랜치 `main`
- 사이트 주소(GitHub Pages): https://7hyun29.github.io/music-plugin-hub/ — 두 컴퓨터 모두 이 주소를 즐겨찾기
  - 루트 index.html이 site/로 이동시킴. Pages 설정: main 브랜치 / (root)
  - 저장소 Public + Pages 켜짐 확인 (2026-11-25)
- 사용 컴퓨터: Windows(Cubase Pro 15) + Mac(VEP 8, Logic) 두 대. 데이터를 고칠 때만 각자 `git clone`
- 이전 문제: 로컬 파일을 즐겨찾기하면 컴퓨터마다 경로가 달라 다른 컴퓨터에서 "file couldn't be accessed" 오류 → Pages 주소로 해결
- 평소 흐름: `git pull` → 수정 → `bash smoke.sh` → commit → `git push`

## 진행 순서
- [x] 1. git 저장소 + CLAUDE.md / design.md / HANDOFF.md
- [x] 2. plugins.json 항목 확정 + smoke.sh
- [x] 5. 화면 만들기 (검색, 필터, 카드/표 전환) — 사용자 요청으로 순서 앞당김
- [x] GitHub 저장소 생성 + push
- [~] 3. 스캔 → plugins.json 반영 — Mac 완료, **Windows 남음**
- [ ] 4. 종류·태그·메모 채우기
- [ ] 6. 별도 세션에서 리뷰 + smoke.sh로 SMOKE OK 확인

## 스캔 반영 방식 (확정, 2026-11-25)
- 사용자가 각 컴퓨터에서 스캔 → 바탕화면 CSV를 대화에 첨부 → Claude가 `python3 scripts/import_scan.py mac|windows <CSV>` 실행 → smoke → push
  - (처음 제안했던 scan-windows.json / scan-mac.json 분리 구조는 쓰지 않음. 반영을 Claude 한 곳에서만 해서 충돌 걱정이 없음)
- 묶기·이름·종류 기본값은 data/catalog.json. 새 플러그인이 "catalog.json에 없는 새 이름"으로 나오면 catalog에 추가 후 다시 import
- import는 그 기기의 installs 기록만 교체. 다른 기기 기록·종류·태그·메모는 덮지 않음. 스캔에 없는 항목도 지우지 않고 목록만 출력
- 설치 경로는 저장하지 않음
- 데이터 형식 v2 상세는 data/SCHEMA.md

## ChatGPT 리뷰 반영 (2026-11-25, 리뷰 기준 커밋 3bdd72c)
- 반영함: 기기별 포맷·버전 분리(v2), 위치+포맷 필터를 같은 기기 기록에 적용, Windows "스캔 미반영" 표시,
  키보드 포커스 유지·aria-pressed/aria-sort/role=status/검색 레이블, 여러 단어 검색·이름 우선 정렬,
  필터 안내·조건 지우기, 태그 정확 일치 필터(검색어 유지), 320/390px 배치, 긴 이름 줄바꿈, 태그 32px, 대비,
  smoke.sh에 시리얼·비밀번호 값 검사
- 판단: 카드 보기는 항상 이름순, 정렬은 표에서만 (카드에는 정렬 표시가 없어 혼란). 검색 300개 기준 5ms라 다시 그리기 최적화는 안 함
- 후속 기능 후보(아직 안 함): DAW별 필터 프리셋, 플러그인 이름 복사 버튼, 기기별 마지막 스캔 날짜 화면 표시(지금은 위치 칩 툴팁에만)
- 검증은 작업 환경의 임시 스크립트(Playwright + Chrome)로 함. 저장소에는 넣지 않음 (새 도구 추가 허락 필요)

## 다음 할 일
1. Windows 스캔: `powershell -ExecutionPolicy Bypass -File .\scripts\scan_windows.ps1` → plugins_windows.csv 받아서 import
   - scan_windows.ps1은 실제 Windows에서 아직 한 번도 안 돌려봄. 오류 나면 고칠 것
   - Windows 이름이 Mac과 다르면(예: `Kontakt 8` vs `Kontakt 8 (64bit)`) catalog.json patterns로 같은 id에 묶을 것
2. 사용자에게 종류 검토받기. 확신 없어서 `기타`로 둔 것: Cymatics Dark Sky, Cymatics Pandora, Replicate, Waves(WaveShell). MinimogueVA 제조사 모름
3. 태그·메모는 사용자가 말하는 대로 plugins.json에 직접 입력

## Mac 스캔에서 알게 된 것
- Mac에 Command Line Tools 설치 실패 ("not currently available from the software update server") → Mac에 git·python3 없음
  - 스캔은 git 없이 가능: `curl -O https://raw.githubusercontent.com/7hyun29/music-plugin-hub/main/scripts/scan_mac.sh && bash scan_mac.sh`
- 같은 제품 묶음: VEP 8(본체·Event/Audio Input·Surround), Microtonic+Multi, Reaktor 6+FX, Synth V 본체+ARA, ACE Bridge 2+ARA, Ozone 11 훅, WaveShell 15.5/17.1, UADx(NI 목록 이름으로 표시)
- 버전은 AAX 외 포맷 우선 (Omnisphere·Keyscape·Trilian AAX는 번호 체계가 다름). Serum 2 AAX만 2.0.24로 다른 포맷(2.1.5)보다 낮음
- Mac Kontakt 라이브러리는 NI Service Center 목록에서 Abbey Road Two 하나만 잡힘

## 아이콘 (2026-11-25)
- ChatGPT로 만든 PNG 16개를 사용자가 `assets/music-plugin-icons` 브랜치(bc19661)에 올림 → main에 fast-forward로 합침
- 로고: 제목 옆 + 파비콘(사이트·루트 index.html). 종류 아이콘: 종류 필터 칩, 카드 종류 표시
- 원격의 `assets/music-plugin-icons` 브랜치는 남아 있음 (지울지 사용자에게 안 물어봄)

## 사이트 동작
- site/index.html을 더블클릭으로 열면 됨 (서버 불필요)
- 데이터 흐름: data/plugins.json → build.sh → site/data.js → 화면
- 검색은 띄어쓰기·대소문자 무시, 여러 단어면 모두 포함 ("UADx Reverb", "Reaktor6"). 이름이 맞는 항목 먼저
- 필터: 같은 그룹 안은 OR, 그룹끼리는 AND. 위치+포맷은 같은 기기 기준. 칩 숫자는 다른 조건 적용 후 개수
- 태그 클릭 → 태그 필터 줄에 추가(정확 일치, 검색어 유지). `/` 키로 검색창, Esc로 검색 지우기
- 카드/표 선택은 브라우저에 기억됨. 카드는 이름순, 표는 열 제목 클릭으로 정렬

## 결정된 것
- 개인용 사이트. 서버·DB 없음, 외부 라이브러리 없음. 공개는 GitHub Pages 정적 호스팅만
- Kontakt 라이브러리도 같은 목록, type `Kontakt 라이브러리`
- 설치 위치는 windows / mac 2칸 (Logic·VEP 구분은 필요하면 태그·메모로). 기기별로 포맷·버전 따로 기록
- 태그는 자유 입력, smoke.sh가 띄어쓰기·대소문자만 다른 태그를 경고
- smoke.sh·build.sh는 Python 3 필요. scripts/python.sh가 python3/python/py 중 실제로 실행되는 것을 찾음 (Windows의 Store 가짜 python3 대응)
- .gitattributes로 .sh 줄바꿈 LF 고정 (Windows Git Bash 실행 오류 방지)

## 사용자 환경 메모
- Windows에 Git for Windows·Python 설치 안내를 마친 상태. 실제 설치·`git config` 완료 여부는 확인 안 됨
- 안내는 한국어로, 명령어는 복사해서 붙일 수 있게, 설치·설정 화면은 단계별로
