#!/usr/bin/env python3
"""Publish only the approved, explicit static assets. No runtime dependencies."""
import os
from pathlib import Path
import shutil
import tempfile

PUBLISH_FILES = (
    "index.html", "about.html", "cookie.html", "privacy.html", "resources.html",
    "terms.html", "tips.html", "googlebf96f5e560998a67.html", "robots.txt",
    "sitemap.xml", "site.webmanifest", "android-chrome-192x192.png",
    "android-chrome-512x512.png", "apple-touch-icon.png", "favicon-16x16.png",
    "favicon-32x32.png", "favicon.ico", "og-image.png", "css/styles.css",
    "js/script.js", "js/calculator.js", "img/richard_crane_profile.jpeg",
    "img/richard_crane_profile.png",
)


def refuse_symlink_ancestry(path):
    for part in (path, *path.parents):
        if part.is_symlink():
            raise ValueError(f"Symlinks are not allowed: {part}")


def build(root):
    root = Path(os.path.abspath(root))
    output_parent = root / ".output"
    output = output_parent / "public"
    refuse_symlink_ancestry(output)
    if output.exists():
        if not output.is_dir():
            raise ValueError(f"Output must be a directory: {output}")
        for current, directories, files in os.walk(output, followlinks=False):
            for name in directories + files:
                if (Path(current) / name).is_symlink():
                    raise ValueError(f"Symlinks are not allowed: {Path(current) / name}")
    for relative in PUBLISH_FILES:
        source = root / relative
        refuse_symlink_ancestry(source)
        if not source.is_file():
            raise ValueError(f"Missing required asset: {relative}")
    output_parent.mkdir(exist_ok=True)
    # Stage all copies before discarding the prior successful publication.
    with tempfile.TemporaryDirectory(prefix=".publish-", dir=output_parent) as temporary:
        staged = Path(temporary) / "public"
        staged.mkdir()
        for relative in PUBLISH_FILES:
            target = staged / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(root / relative, target)
        if output.exists():
            shutil.rmtree(output)
        staged.rename(output)
    return output


if __name__ == "__main__":
    try:
        result = build(Path(__file__).absolute().parents[1])
    except (ValueError, OSError) as error:
        raise SystemExit(str(error))
    print(f"Published {len(PUBLISH_FILES)} assets to {result}")
