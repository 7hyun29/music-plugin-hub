#!/bin/bash
# 데이터 형식 검사. 통과하면 마지막 줄에 SMOKE OK 출력.
# 실행: bash smoke.sh   (python3 필요)
# 순서: 데이터 형식 검사 → build.sh로 site/data.js 생성 → 화면 파일 확인

cd "$(dirname "$0")" || exit 1

python3 - <<'PY'
import json, re, sys
from collections import defaultdict

TYPES = {"오케스트라 라이브러리", "Kontakt 라이브러리", "신스", "샘플러",
         "EQ", "컴프", "리버브", "유틸", "기타"}
FORMATS = {"VST3", "VST2", "AU", "AAX"}
LOCATIONS = {"windows", "mac"}
REQUIRED = ["id", "name", "vendor", "type", "formats", "locations"]
ALLOWED = set(REQUIRED) | {"version", "license", "tags", "note"}
SECRET = re.compile(r"serial|password|passwd|비밀번호|시리얼|key", re.I)

errors, warnings = [], []
try:
    with open("data/plugins.json", encoding="utf-8") as f:
        data = json.load(f)
except Exception as e:
    print(f"FAIL: data/plugins.json을 읽을 수 없음 — {e}")
    sys.exit(1)

plugins = data.get("plugins")
if data.get("version") != 1 or not isinstance(plugins, list):
    print('FAIL: 최상위는 {"version": 1, "plugins": [...]} 형태여야 함')
    sys.exit(1)

seen_ids = set()
tag_forms = defaultdict(set)
for i, p in enumerate(plugins):
    where = f"#{i+1} {p.get('id', '?')}"
    for k in REQUIRED:
        if k not in p:
            errors.append(f"{where}: 필수 항목 '{k}' 없음")
    for k in p:
        if k not in ALLOWED:
            errors.append(f"{where}: 모르는 항목 '{k}'")
        if SECRET.search(k):
            errors.append(f"{where}: 시리얼·비밀번호로 보이는 항목 '{k}' — 넣지 말 것")
    pid = p.get("id", "")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", str(pid)):
        errors.append(f"{where}: id는 영문 소문자·숫자·하이픈만")
    if pid in seen_ids:
        errors.append(f"{where}: id 중복")
    seen_ids.add(pid)
    for k in ("name", "vendor"):
        if not str(p.get(k, "")).strip():
            errors.append(f"{where}: '{k}'가 비어 있음")
    if p.get("type") not in TYPES:
        errors.append(f"{where}: type '{p.get('type')}'은 목록에 없음")
    fm = p.get("formats", [])
    if not isinstance(fm, list) or any(x not in FORMATS for x in fm):
        errors.append(f"{where}: formats는 {sorted(FORMATS)} 중에서")
    elif not fm and p.get("type") != "Kontakt 라이브러리":
        errors.append(f"{where}: formats가 비어 있음 (Kontakt 라이브러리만 비워둘 수 있음)")
    loc = p.get("locations", [])
    if not isinstance(loc, list) or not loc or any(x not in LOCATIONS for x in loc):
        errors.append(f"{where}: locations는 windows, mac 중 하나 이상")
    tags = p.get("tags", [])
    if not isinstance(tags, list) or any(not isinstance(t, str) or not t.strip() for t in tags):
        errors.append(f"{where}: tags는 비어 있지 않은 문자열 목록")
    else:
        for t in tags:
            tag_forms[re.sub(r"\s+", "", t).lower()].add(t)
    for k in ("version", "license", "note"):
        if k in p and not isinstance(p[k], str):
            errors.append(f"{where}: '{k}'는 문자열")

for forms in tag_forms.values():
    if len(forms) > 1:
        warnings.append("비슷한 태그가 섞여 있음: " + " / ".join(sorted(forms)))

for w in warnings:
    print("WARN:", w)
for e in errors:
    print("FAIL:", e)
if errors:
    print(f"{len(errors)}개 오류")
    sys.exit(1)
print(f"플러그인 {len(plugins)}개, 태그 {len(tag_forms)}종 확인")
PY
[ $? -eq 0 ] || exit 1

# 빌드 확인: data.js 생성 + 화면 파일 존재
bash build.sh || exit 1
for f in site/index.html site/style.css site/app.js site/data.js; do
  [ -s "$f" ] || { echo "FAIL: $f 없음"; exit 1; }
done
if command -v node >/dev/null 2>&1; then
  node --check site/app.js || { echo "FAIL: site/app.js 문법 오류"; exit 1; }
  node --check site/data.js || { echo "FAIL: site/data.js 문법 오류"; exit 1; }
fi
echo "SMOKE OK"
