"""스캔 CSV를 data/plugins.json에 합친다.

사용: python3 scripts/import_scan.py mac     ~/Desktop/plugins_mac.csv
     python3 scripts/import_scan.py windows ~/Desktop/plugins_windows.csv
옵션: --data <경로>   다른 plugins.json에 반영 (테스트용)
     --date YYYY-MM-DD 스캔 날짜 (기본: 오늘)

- 설치 기록은 기기별로 따로 둔다: installs.mac / installs.windows 각각 {formats, version}.
  한 기기를 스캔하면 그 기기의 기록만 새로 쓰고, 다른 기기의 기록은 건드리지 않는다.
- data/catalog.json으로 같은 제품의 여러 파일(AU/VST3/AAX, 부속 플러그인)을 한 항목으로 묶는다.
- 직접 쓴 종류·태그·메모·라이선스·이름은 덮어쓰지 않는다.
- 설치 경로는 저장하지 않는다 (사용자 이름이 들어 있고, 사이트가 공개 상태).
- 이번 스캔에 없는 기존 기록은 지우지 않고 목록만 알려준다.
"""
import argparse, csv, datetime, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MACHINES = ["windows", "mac"]
FORMAT_ORDER = ["VST3", "VST2", "AU", "AAX"]
BAD_VERSION = re.compile(r"doesn't exist|error|not found", re.I)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "unknown"


def version_key(v):
    return [int(x) for x in re.findall(r"\d+", v)[:4]]


def main():
    ap = argparse.ArgumentParser(description="스캔 CSV → plugins.json")
    ap.add_argument("machine", choices=MACHINES)
    ap.add_argument("csv")
    ap.add_argument("--data", default=str(ROOT / "data/plugins.json"))
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    a = ap.parse_args()
    machine, csv_path, pj_path = a.machine, Path(a.csv).expanduser(), Path(a.data)

    catalog = json.loads((ROOT / "data/catalog.json").read_text(encoding="utf-8"))
    patterns = [(re.compile(p["regex"]), p["id"]) for p in catalog["patterns"]]
    meta = catalog["plugins"]
    ignore = set(catalog["ignore"])

    def resolve(name):
        for rx, pid in patterns:
            if rx.search(name):
                return pid
        return slug(name)

    # 1) 스캔 결과를 항목별로 모으기
    found = {}
    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            name = (row.get("name") or "").strip()
            if not name or name in ignore:
                continue
            pid = resolve(name)
            g = found.setdefault(pid, {"raw": name, "formats": set(), "versions": [], "vendor": ""})
            fmt = (row.get("format") or "").strip()
            # "1.6.6 f482751207", "4.03.0[10528]" 같은 빌드 번호는 떼어낸다
            ver = re.split(r"[\s\[]", (row.get("version") or "").strip())[0]
            if fmt in FORMAT_ORDER:
                g["formats"].add(fmt)
                if ver and not BAD_VERSION.search(ver):
                    g["versions"].append((fmt, ver))
            vendor = (row.get("vendor") or "").strip()
            if vendor and fmt != "NI" and not g["vendor"]:
                g["vendor"] = vendor

    # 2) plugins.json에 합치기
    data = json.loads(pj_path.read_text(encoding="utf-8"))
    if data.get("version") != 2:
        sys.exit("plugins.json version 2가 아님 — 형식을 먼저 확인할 것")
    by_id = {p["id"]: p for p in data["plugins"]}
    added, updated = [], []

    for pid, g in sorted(found.items()):
        m = meta.get(pid, {})
        # 버전: AAX는 번호 체계가 다른 경우가 많아 다른 포맷을 우선
        cands = [v for fmt, v in g["versions"] if fmt != "AAX"] or [v for _, v in g["versions"]]
        record = {
            "formats": sorted(g["formats"], key=FORMAT_ORDER.index),
            "version": max(cands, key=version_key) if cands else "",
        }
        if pid in by_id:
            by_id[pid]["installs"][machine] = record   # 이 기기 기록만 교체
            updated.append(pid)
        else:
            p = {
                "id": pid,
                "name": m.get("name", g["raw"]),
                "vendor": m.get("vendor") or g["vendor"] or "알 수 없음",
                "type": m.get("type", "기타"),
                "installs": {machine: record},
                "license": "",
                "tags": [],
                "note": "",
            }
            data["plugins"].append(p)
            by_id[pid] = p
            added.append(pid)

    for p in data["plugins"]:   # 기기 순서 고정
        p["installs"] = {k: p["installs"][k] for k in MACHINES if k in p["installs"]}
    data["plugins"].sort(key=lambda p: p["name"].lower())
    data.setdefault("scans", {})[machine] = a.date
    pj_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    missing = [p["name"] for p in data["plugins"] if machine in p["installs"] and p["id"] not in found]
    unknown = [pid for pid in added if pid not in meta]
    print(f"{machine} 스캔 반영 ({a.date}): 새 항목 {len(added)}개, 갱신 {len(updated)}개 (전체 {len(data['plugins'])}개)")
    if unknown:
        print("catalog.json에 없는 새 이름 (종류 '기타'로 넣음):", ", ".join(unknown))
    if missing:
        print(f"이번 {machine} 스캔에 없는 기존 기록 (지우지 않음):", ", ".join(missing))


if __name__ == "__main__":
    main()
