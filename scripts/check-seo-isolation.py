#!/usr/bin/env python3
"""Verify a metadata-only build preserves every body and feed/API payload."""
import re
import json
import sys
from pathlib import Path


def check(before, after):
    before, after = Path(before), Path(after)
    files = sorted(before.rglob('*.html'))
    assert {p.relative_to(before) for p in files} == {
        p.relative_to(after) for p in after.rglob('*.html')
    }, 'HTML inventory changed'
    checked = 0
    for old in files:
        rel = old.relative_to(before)
        a, b = old.read_text(), (after / rel).read_text()
        body_a = re.search(r'<body\b[^>]*>.*</body>', a, re.S)
        body_b = re.search(r'<body\b[^>]*>.*</body>', b, re.S)
        if body_a:
            assert body_b and body_a.group() == body_b.group(), f'Body changed: {rel}'
            checked += 1
    for name in ('index.xml', 'feed.json'):
        assert (before / name).read_bytes() == (after / name).read_bytes(), f'Payload changed: {name}'
    old_api = json.loads((before / 'api/posts.json').read_text())
    new_api = json.loads((after / 'api/posts.json').read_text())
    # This field is deliberately the current build time, not article content.
    old_api.pop('generated', None)
    new_api.pop('generated', None)
    assert old_api == new_api, 'Posts API changed beyond its build timestamp'
    print(f'SEO isolation passed: {checked} identical HTML bodies; RSS, JSON feed and posts API unchanged.')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Usage: python3 scripts/check-seo-isolation.py BEFORE AFTER')
    check(*sys.argv[1:])
