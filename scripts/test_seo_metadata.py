"""Source-level guard: SEO overrides must not leak into visible templates."""
import unittest
import json
import tomllib
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent


class SeoMetadataTests(unittest.TestCase):
    def test_built_article_overrides_and_fallbacks(self):
        posts = json.loads((ROOT / 'public/api/posts.json').read_text())['posts']
        urls = {p['title']: p['url'] for p in posts}
        for source in (ROOT / 'content/posts').glob('20*.md'):
            data = tomllib.loads(source.read_text().split('+++', 2)[1])
            expected = data.get('seoDescription') or data.get('description')
            if not expected:
                continue
            with self.subTest(article=source.name):
                output = ROOT / 'public' / urlsplit(urls[data['title']]).path.lstrip('/') / 'index.html'
                markup = output.read_text()
                found = {}
                class Metadata(HTMLParser):
                    def handle_starttag(self, tag, attrs):
                        attrs = dict(attrs)
                        if tag == 'meta':
                            found[attrs.get('name') or attrs.get('property')] = attrs.get('content')
                Metadata().feed(markup)
                for key in ('description', 'og:description', 'twitter:description'):
                    self.assertEqual(found[key], expected)
                for raw in re.findall(r'<script\b[^>]*type=[\"\']?application/ld\+json[\"\']?[^>]*>(.*?)</script>', markup, re.S):
                    for entity in json.loads(raw).get('@graph', []):
                        if entity.get('@id', '').endswith('#article'):
                            self.assertEqual(entity['description'], expected)

    def test_override_is_only_used_in_head_and_schema(self):
        allowed = {'partials/head.html', 'partials/structured-data.html'}
        found = set()
        for path in (ROOT / 'layouts').rglob('*'):
            if path.is_file() and path.suffix in {'.html', '.xml', '.json', '.txt'} and 'seoDescription' in path.read_text():
                found.add(path.relative_to(ROOT / 'layouts').as_posix())
        self.assertEqual(found, allowed)

    def test_head_falls_back_without_replacing_editorial_description(self):
        head = (ROOT / 'layouts/partials/head.html').read_text()
        self.assertIn('.Params.seoDescription | default .Description | default site.Params.description | plainify', head)
        schema = (ROOT / 'layouts/partials/structured-data.html').read_text()
        self.assertIn('.Params.seoDescription | default .Description | plainify', schema)


if __name__ == '__main__':
    unittest.main()
