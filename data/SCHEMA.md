# plugins.json 형식 (v2)

형식 검사는 `bash smoke.sh`로 한다.

```json
{
  "version": 2,
  "scans": { "mac": "2026-11-25", "windows": "2026-11-26" },
  "plugins": [
    {
      "id": "serum2",
      "name": "Serum 2",
      "vendor": "Xfer Records",
      "type": "신스",
      "installs": {
        "windows": { "formats": ["VST3"], "version": "2.2.0" },
        "mac":     { "formats": ["VST3", "AU", "AAX"], "version": "2.1.5" }
      },
      "license": "",
      "tags": ["게임 BGM"],
      "note": ""
    }
  ]
}
```

| 필드 | 형식 | 필수 | 설명 |
|---|---|---|---|
| `scans` | 객체 | O | 기기별 마지막 스캔 날짜. 없는 기기는 화면에 "스캔 미반영"으로 표시 |
| `id` | 문자열 | O | 영문 소문자·숫자·하이픈, 중복 불가 |
| `name` | 문자열 | O | 표시 이름 |
| `vendor` | 문자열 | O | 제조사 |
| `type` | 문자열 | O | 아래 목록 중 하나 |
| `installs` | 객체 | O | 기기(`windows`, `mac`)별 설치 기록. 각 기록은 `formats`(`VST3`, `VST2`, `AU`, `AAX`)와 `version`. Kontakt 라이브러리만 `formats`를 비워둘 수 있음 |
| `license` | 문자열 | | 관리 계정 이름만. 예 `iLok`, `Native Access` |
| `tags` | 배열 | | 자유 입력 |
| `note` | 문자열 | | 직접 쓴 한 줄 소감 |

`type` 목록: `오케스트라 라이브러리`, `Kontakt 라이브러리`, `가상악기`, `신스`, `샘플러`, `EQ`, `컴프`, `리버브`, `앰프·새츄레이션`, `이펙트`, `보컬`, `MIDI 도구`, `마스터링`, `유틸`, `기타`

## 공개 데이터 주의
저장소와 사이트가 공개 상태. smoke.sh가 막는 것:
- 항목 이름에 serial·password·key 등
- license·note·tags 값에 시리얼 번호 모양(`ABCD-1234-EFGH`), "비밀번호·비번·시리얼·라이선스 키·크랙" 같은 단어

## 스캔 반영 방법
- `python3 scripts/import_scan.py mac|windows <CSV 경로>` → `bash smoke.sh`
- 한 기기를 스캔하면 그 기기의 `installs` 기록만 새로 씀. 다른 기기 기록과 직접 쓴 종류·태그·메모·라이선스는 그대로
- 같은 제품의 여러 파일은 data/catalog.json의 `patterns`로 묶고, 표시 이름·제조사·종류 기본값도 catalog.json에서 정함
- 설치 경로는 저장하지 않음 (사용자 이름 포함 + 공개 사이트)
- 이번 스캔에 없는 기존 기록은 지우지 않고 목록만 출력

## 화면 필터 규칙
- 같은 줄(종류·위치·포맷·태그) 안에서는 OR, 줄끼리는 AND
- 위치와 포맷은 **같은 기기의 설치 기록**에 함께 적용: `Windows + AU` = Windows에 AU로 설치된 것
- 태그 필터는 정확히 일치. 검색은 띄어쓰기·대소문자 무시, 여러 단어면 모두 포함

## 결정 기록
- 2026-11-25 Kontakt 라이브러리는 같은 목록에 넣고 `type`으로 구분
- 2026-11-25 태그는 자유 입력. smoke.sh가 띄어쓰기·대소문자만 다른 태그를 경고
- 2026-11-25 종류 목록 확장 (가상악기·앰프·새츄레이션·이펙트·보컬·MIDI 도구·마스터링). 사용자 검토 대기
- 2026-11-25 v1 → v2: 기기별 포맷·버전이 섞이는 문제(리뷰 지적) 때문에 `locations`/`formats`/`version`을 `installs`로 바꿈. 기존 47개는 모두 Mac 단독이라 손실 없이 변환
