#!/usr/bin/env bash
# Usage: bash dev/check-contrast.sh [page...]   (after node dev/render.mjs)
cd "$(dirname "$0")/out" || exit 1
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
cp ../probe.js .
for f in "${@:-post post-related post-dark home home-dark home-nocover category category-summary protected tags}"; do
  for p in $f; do
    sed 's#</body>#<script src="probe.js"></script></body>#' "$p.html" > "probe-$p.html"
    for w in 1440,900 390,844; do
      echo "=== $p @ $w"
      "$CHROME" --headless=new --disable-gpu --window-size=$w --virtual-time-budget=6000 --dump-dom "file:///$(cygpath -m "$PWD")/probe-$p.html" 2>/dev/null \
        | python -I -c "import sys,re,html;d=sys.stdin.read();m=re.search(r'<pre id=\"probe-out\">(.*?)</pre>',d,re.S);print(html.unescape(m.group(1)) if m else 'no output')" | sort -u
    done
  done
done
