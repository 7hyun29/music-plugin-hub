#!/bin/bash
# data/plugins.json → site/data.js 생성.
# 브라우저에서 index.html을 더블클릭으로 열어도 데이터가 보이게 하려고 .js로 감싼다.
# plugins.json을 고친 뒤 실행: bash build.sh   (python3 필요)

cd "$(dirname "$0")" || exit 1

python3 - <<'PY'
import json, sys
try:
    with open("data/plugins.json", encoding="utf-8") as f:
        data = json.load(f)
except Exception as e:
    print(f"BUILD FAIL: data/plugins.json을 읽을 수 없음 — {e}")
    sys.exit(1)
body = json.dumps(data, ensure_ascii=False, indent=1).replace("</", "<\\/")
with open("site/data.js", "w", encoding="utf-8") as f:
    f.write("// 자동 생성 파일 — 직접 고치지 말 것. data/plugins.json 수정 후 bash build.sh\n")
    f.write("window.PLUGIN_DATA = " + body + ";\n")
print(f"build: site/data.js 생성 (플러그인 {len(data.get('plugins', []))}개)")
PY
