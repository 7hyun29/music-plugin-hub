#!/bin/bash
# 음악 플러그인 스캔 (Mac)
# 실행: 터미널에서  bash scan_mac.sh
# 결과: ~/Desktop/plugins_mac.csv

out="$HOME/Desktop/plugins_mac.csv"
PB=/usr/libexec/PlistBuddy
q() { printf '"%s"' "${1//\"/\"\"}"; }   # CSV 따옴표 처리

echo "name,format,version,vendor,bundle_id,path" > "$out"

scan() {   # $1=포맷  $2=폴더  $3=확장자
  [ -d "$2" ] || return
  find "$2" -name "*.$3" -prune -print 2>/dev/null | while IFS= read -r p; do
    plist="$p/Contents/Info.plist"
    ver=$($PB -c "Print :CFBundleShortVersionString" "$plist" 2>/dev/null)
    bid=$($PB -c "Print :CFBundleIdentifier" "$plist" 2>/dev/null)
    vendor=""
    if [ "$1" = "AU" ]; then   # AU는 "제조사: 이름" 형태로 들어 있음
      vendor=$($PB -c "Print :AudioComponents:0:name" "$plist" 2>/dev/null | cut -d: -f1)
    fi
    name=$(basename "$p" ".$3")
    echo "$(q "$name"),$1,$(q "$ver"),$(q "$vendor"),$(q "$bid"),$(q "$p")" >> "$out"
  done
}

for base in "/Library/Audio/Plug-Ins" "$HOME/Library/Audio/Plug-Ins"; do
  scan AU   "$base/Components" component
  scan VST3 "$base/VST3"       vst3
  scan VST2 "$base/VST"        vst
done
scan AAX "/Library/Application Support/Avid/Audio/Plug-Ins" aaxplugin

# Native Instruments 제품/라이브러리 (Kontakt 라이브러리 포함)
sc="/Library/Application Support/Native Instruments/Service Center"
if [ -d "$sc" ]; then
  for x in "$sc"/*.xml; do
    [ -e "$x" ] || continue
    echo "$(q "$(basename "$x" .xml)"),NI,\"\",\"Native Instruments\",\"\",$(q "$x")" >> "$out"
  done
fi

echo "완료: $(($(wc -l < "$out") - 1))개 -> $out"
