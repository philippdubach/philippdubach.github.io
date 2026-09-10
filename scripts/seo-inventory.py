#!/usr/bin/env python3
"""Generate a source-backed article decision register; no network or credentials."""
import json
import sys
import tomllib
from pathlib import Path

root = Path(__file__).resolve().parent.parent
records = []
for path in sorted((root / 'content/posts').glob('20*.md')):
    source = path.read_text()
    metadata, body = source.split('+++', 2)[1:]
    data = tomllib.loads(metadata)
    override = data.get('seoDescription')
    records.append({
        'source': str(path.relative_to(root)), 'title': data['title'],
        'date': str(data['date']), 'categories': data.get('categories', []),
        'type': data.get('type', 'unspecified'),
        'seoTitle': data.get('seoTitle', data['title']),
        'description': data.get('description', ''), 'seoDescription': override,
        'decision': 'change' if override else 'needs evidence',
        'reason': ('Accuracy-only search override; visible description preserved.' if override else
                   'Preserve current output pending page/query evidence and full-body review; not a finding of a defect.'),
        'headings': [line.lstrip('# ') for line in body.splitlines() if line.startswith('## ')],
        'doi': data.get('doi'), 'visibleChangesAllowed': False,
    })
payload = {'version': 1, 'articles': len(records), 'records': records}
if len(sys.argv) == 2:
    Path(sys.argv[1]).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
else:
    print(json.dumps(payload, indent=2, ensure_ascii=False))
