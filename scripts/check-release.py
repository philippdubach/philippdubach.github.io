#!/usr/bin/env python3
"""Dependency-free origin release gate; never modifies the built site."""

import json
from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class Homepage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.main = False
        self.headings = 0
        self.assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.main |= tag == "main" and attrs.get("id") == "main-content"
        self.headings += tag == "h1"
        if tag == "script" and attrs.get("src"):
            self.assets.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.assets.append(attrs.get("href", ""))


def check_release(directory):
    root = Path(directory).resolve(strict=True)
    required = ("index.html", "404.html", "index.xml", "feed.json",
                "api/posts.json", "sitemap.xml", "robots.txt", "llms.txt")
    for name in required:
        if not (root / name).is_file() or (root / name).stat().st_size == 0:
            raise ValueError(f"Missing or empty release artifact: {name}")

    page = Homepage()
    page.feed((root / "index.html").read_text())
    if not page.main or page.headings != 1:
        raise ValueError("Homepage must contain its main landmark and one h1")
    if not page.assets:
        raise ValueError("Homepage has no stylesheet/script assets")
    for url in page.assets:
        parsed = urlsplit(url)
        if parsed.netloc and parsed.netloc != "philippdubach.com":
            continue
        asset = (root / unquote(parsed.path).lstrip("/")).resolve()
        if not asset.is_relative_to(root) or not asset.is_file() or not asset.stat().st_size:
            raise ValueError(f"Missing, empty, or unsafe homepage asset: {url}")

    rss = ET.parse(root / "index.xml").getroot()
    sitemap = ET.parse(root / "sitemap.xml").getroot()
    feed = json.loads((root / "feed.json").read_text())
    posts = json.loads((root / "api/posts.json").read_text())
    if not rss.findall("channel/item") or not list(sitemap):
        raise ValueError("RSS or sitemap contains no entries")
    if not feed.get("items") or not posts.get("posts"):
        raise ValueError("JSON feed or posts API contains no entries")


if __name__ == "__main__":
    try:
        check_release(sys.argv[1] if len(sys.argv) > 1 else "public")
    except (OSError, ValueError, ET.ParseError) as error:
        sys.exit(f"Release check failed: {error}")
    print("Release artifacts valid; homepage and local assets are nonempty.")
