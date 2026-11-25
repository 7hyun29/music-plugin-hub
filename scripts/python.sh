# smoke.sh / build.sh가 불러 쓰는 파이썬 찾기.
# Windows에서는 python3가 Microsoft Store 바로가기일 수 있어 실제로 실행되는지 확인한다.
export PYTHONIOENCODING=utf-8
PY=""
for c in python3 python py; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c "import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)" >/dev/null 2>&1; then
    PY="$c"
    break
  fi
done
if [ -z "$PY" ]; then
  echo "FAIL: Python 3를 찾을 수 없음 — 설치 후 터미널을 새로 열 것"
  exit 1
fi
