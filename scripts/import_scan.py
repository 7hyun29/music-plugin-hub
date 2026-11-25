"""스캔 CSV를 data/plugins.json에 합친다.

사용: python3 scripts/import_scan.py mac     ~/Desktop/plugins_mac.csv
     python3 scripts/import_scan.py windows ~/Desktop/plugins_windows.csv

- data/catalog.json으로 같은 제품의 여러 파일(AU/VST3/AAX, 부속 플러그인)을 한 항목으로 묶는다.
- 이미 있는 항목은 설치 위치·포맷·버전만 갱신하고, 직접 쓴 종류·태그·메모·라이선스는 건드리지 않는다.
- 설치 경로는 저장하지 않는다 (사용자 이름이 들어 있고, 사이트가 공개 상태).
- 이번 스캔에 없는 기존 항목은 지우지 않고 목록만 알려준다.
"""
import csv, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORMAT_ORDER = ["VST3", "VST2", "AU", "AAX"]
BAD_VERSION = re.compile(r"doesn't exist|error|not found", re.I)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "unknown"


def version_key(v):
    return [int(x) for x in re.findall(r"\d+", v)[:4]]


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in ("mac", "windows"):
        print(__doc__)
        sys.exit(1)
    machine, csv_path = sys.argv[1], Path(sys.argv[2]).expanduser()

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
    pj_path = ROOT / "data/plugins.json"
    data = json.loads(pj_path.read_text(encoding="utf-8"))
    by_id = {p["id"]: p for p in data["plugins"]}
    added, updated = [], []

    for pid, g in sorted(found.items()):
        m = meta.get(pid, {})
        # 버전: AAX는 번호 체계가 다른 경우가 많아 다른 포맷을 우선
        cands = [v for fmt, v in g["versions"] if fmt != "AAX"] or [v for _, v in g["versions"]]
        version = max(cands, key=version_key) if cands else ""
        formats = sorted(g["formats"], key=FORMAT_ORDER.index)

        if pid in by_id:
            p = by_id[pid]
            if machine not in p["locations"]:
                p["locations"] = sorted(set(p["locations"]) | {machine}, key=["windows", "mac"].index)
            p["formats"] = sorted(set(p["formats"]) | set(formats), key=FORMAT_ORDER.index)
            if version:
                p["version"] = version
            updated.append(pid)
        else:
            p = {
                "id": pid,
                "name": m.get("name", g["raw"]),
                "vendor": m.get("vendor") or g["vendor"] or "알 수 없음",
                "version": version,
                "type": m.get("type", "기타"),
                "formats": formats,
                "locations": [machine],
                "license": "",
                "tags": [],
                "note": "",
            }
            data["plugins"].append(p)
            by_id[pid] = p
            added.append(pid)

    data["plugins"].sort(key=lambda p: p["name"].lower())
    pj_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    missing = [p["name"] for p in data["plugins"] if machine in p["locations"] and p["id"] not in found]
    unknown = [pid for pid in added if pid not in meta]
    print(f"{machine} 스캔 반영: 새 항목 {len(added)}개, 갱신 {len(updated)}개 (전체 {len(data['plugins'])}개)")
    if unknown:
        print("catalog.json에 없는 새 이름 (종류 '기타'로 넣음):", ", ".join(unknown))
    if missing:
        print(f"이번 {machine} 스캔에 없는 기존 항목 (지우지 않음):", ", ".join(missing))


if __name__ == "__main__":
    main()
