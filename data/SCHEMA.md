# plugins.json 형식 (초안)

파일은 `{ "version": 1, "plugins": [ ... ] }` 형태. 플러그인 하나가 항목 하나.

| 필드 | 형식 | 필수 | 설명 |
|---|---|---|---|
| `id` | 문자열 | O | 영문 소문자·숫자·하이픈. 예 `kontakt-8` |
| `name` | 문자열 | O | 표시 이름 |
| `vendor` | 문자열 | O | 제조사 |
| `version` | 문자열 | | 스캔으로 채움 |
| `type` | 문자열 | O | 아래 목록 중 하나 |
| `formats` | 배열 | O | `VST3`, `VST2`, `AU`, `AAX` 중 여러 개 |
| `locations` | 배열 | O | `win-cubase`, `mac-vep`, `mac-logic` 중 여러 개 |
| `license` | 문자열 | | 관리 계정 이름만. 예 `iLok`, `Native Access`. 시리얼 금지 |
| `tags` | 배열 | | 용도. 예 `스트링 편곡`, `게임 BGM`, `믹싱` |
| `note` | 문자열 | | 직접 쓴 한 줄 소감 |

`type` 목록: `오케스트라 라이브러리`, `신스`, `샘플러`, `EQ`, `컴프`, `리버브`, `유틸`, `기타`

## 정해야 할 것
1. Kontakt 라이브러리를 플러그인과 같은 목록에 넣을지, 별도 `type`(예: `Kontakt 라이브러리`)으로 둘지
2. `locations`의 Mac VEP / Mac Logic 구분 — 같은 Mac이라 설치는 같고 "어디서 쓰는지"만 다름. 설치 기준(`windows`, `mac`)으로 바꿀지
3. 태그를 자유 입력으로 둘지, 정해진 목록에서만 고르게 할지
