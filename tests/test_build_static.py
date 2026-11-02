"""Publisher regression tests use isolated fixtures, never application files."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("build_static", Path(__file__).resolve().parents[1] / "scripts/build_static.py")
publisher = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(publisher)


EXPECTED_FILES = set("""
index.html about.html cookie.html privacy.html resources.html terms.html tips.html
googlebf96f5e560998a67.html robots.txt sitemap.xml site.webmanifest
android-chrome-192x192.png android-chrome-512x512.png apple-touch-icon.png
favicon-16x16.png favicon-32x32.png favicon.ico og-image.png
css/styles.css js/script.js js/calculator.js
img/richard_crane_profile.jpeg img/richard_crane_profile.png
""".split())


class StaticPublisherTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        for relative in publisher.PUBLISH_FILES:
            source = self.root / relative
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_text("fixture " + relative)

    def test_exact_output_and_forbidden_stale_files_removed(self):
        for relative in ("arbitrary.html", "docs/private.md", ".agents/private.txt"):
            source = self.root / relative
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_text("private")
        output = publisher.build(self.root)
        for relative in ("old.html", "docs/private.md", ".agents/private.txt"):
            stale = output / relative
            stale.parent.mkdir(parents=True, exist_ok=True)
            stale.write_text("stale")
        publisher.build(self.root)
        self.assertEqual(EXPECTED_FILES, {str(p.relative_to(output)) for p in output.rglob("*") if p.is_file()})
        for relative in publisher.PUBLISH_FILES:
            self.assertEqual((output / relative).read_bytes(), (self.root / relative).read_bytes())

    def test_missing_asset_preserves_previous_output(self):
        output = publisher.build(self.root)
        sentinel = output / "previous.txt"
        sentinel.write_text("last successful build")
        (self.root / "favicon.ico").unlink()
        with self.assertRaisesRegex(ValueError, "Missing required asset"):
            publisher.build(self.root)
        self.assertEqual(sentinel.read_text(), "last successful build")

    def test_selected_source_file_symlink_refused(self):
        source = self.root / "index.html"
        source.unlink()
        source.symlink_to(self.root / "about.html")
        with self.assertRaisesRegex(ValueError, "Symlinks"):
            publisher.build(self.root)

    def test_selected_source_directory_symlink_refused(self):
        directory = self.root / "css"
        directory.rename(self.root / "real-css")
        directory.symlink_to(self.root / "real-css", target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "Symlinks"):
            publisher.build(self.root)

    def test_output_root_symlinks_refused(self):
        for relative in (".output", ".output/public"):
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as external:
                link = self.root / relative
                link.parent.mkdir(exist_ok=True)
                link.symlink_to(external, target_is_directory=True)
                try:
                    with self.assertRaisesRegex(ValueError, "Symlinks"):
                        publisher.build(self.root)
                finally:
                    link.unlink()

    def test_existing_output_file_and_directory_symlinks_refused(self):
        output = publisher.build(self.root)
        for is_directory in (False, True):
            with self.subTest(directory=is_directory):
                link = output / "unlisted-link"
                link.symlink_to(self.root / ("css" if is_directory else "index.html"), target_is_directory=is_directory)
                try:
                    with self.assertRaisesRegex(ValueError, "Symlinks"):
                        publisher.build(self.root)
                finally:
                    link.unlink()


if __name__ == "__main__":
    unittest.main()
