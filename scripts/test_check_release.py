"""The origin must retain its old release when any mandatory artifact fails."""

from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import xml.etree.ElementTree as ET

from importlib.util import module_from_spec, spec_from_file_location

spec = spec_from_file_location("release_check", Path(__file__).with_name("check-release.py"))
release_check = module_from_spec(spec)
spec.loader.exec_module(release_check)


class ReleaseGateTest(unittest.TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.files = {
            "index.html": '<link rel="stylesheet" href="/site.css"><main id="main-content"><h1>Site</h1></main>',
            "site.css": "body {color: black}",
            "404.html": "Not found",
            "index.xml": "<rss><channel><item><title>Article</title></item></channel></rss>",
            "sitemap.xml": '<urlset><url><loc>https://philippdubach.com/</loc></url></urlset>',
            "feed.json": '{"items": [{"id":"article"}]}',
            "api/posts.json": '{"posts": [{"id":"article"}]}',
            "robots.txt": "User-agent: *\nAllow: /",
            "llms.txt": "# Site\nArticle index",
        }
        for name, content in self.files.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)

    def test_complete_release_passes(self):
        release_check.check_release(self.root)

    def test_missing_artifacts_fail(self):
        for name, content in self.files.items():
            with self.subTest(name=name):
                path = self.root / name
                path.unlink()
                with self.assertRaises((OSError, ValueError)):
                    release_check.check_release(self.root)
                path.write_text(content)

    def test_corrupt_artifacts_fail(self):
        invalid = {
            "index.html": ["", "<h1>Missing main</h1>"],
            "site.css": [""],
            "index.xml": ["<broken", "<rss><channel/></rss>"],
            "sitemap.xml": ["<urlset/>"],
            "feed.json": ["invalid", '{"items":[]}'],
            "api/posts.json": ['{"posts":[]}'],
        }
        for name, contents in invalid.items():
            for content in contents:
                with self.subTest(name=name, content=content):
                    (self.root / name).write_text(content)
                    with self.assertRaises((OSError, ValueError, ET.ParseError)):
                        release_check.check_release(self.root)
                    (self.root / name).write_text(self.files[name])


if __name__ == "__main__":
    unittest.main()
