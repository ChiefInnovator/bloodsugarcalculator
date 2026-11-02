"""Exercise launcher integrity with isolated cache and manifest fixtures."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

LAUNCHER = Path(__file__).resolve().parents[1] / ".agents/skills/impeccable/scripts/impeccable"


class LauncherIntegrityTests(unittest.TestCase):
    def test_existing_valid_stamp_cannot_authorize_replaced_cached_bytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            scripts = root / "scripts"
            scripts.mkdir()
            launcher = scripts / "impeccable"
            shutil.copyfile(LAUNCHER, launcher)
            (scripts / "VERSION").write_text("fixture-version\n")
            cache = root / "cache/bin/fixture-version/impeccable"
            cache.parent.mkdir(parents=True)
            good_bytes = b'#!/bin/sh\nprintf "verified engine\\n"\n'
            cache.write_bytes(good_bytes)
            cache.chmod(0o755)
            digest = hashlib.sha256(good_bytes).hexdigest()
            # Both supported POSIX operating systems and architectures use this fixture.
            (scripts / "engine-checksums.txt").write_text("".join(
                f"fixture-version impeccable-{system}-{arch} {digest}\n"
                for system in ("darwin", "linux") for arch in ("arm64", "x64")
            ))
            environment = dict(os.environ, HOME=str(root), IMPECCABLE_HOME=str(root / "cache"), IMPECCABLE_LAUNCHER_PROBE="1")
            environment.pop("IMPECCABLE_BIN", None)
            good = subprocess.run(["sh", str(launcher), "engine-probe"], env=environment, capture_output=True, text=True)
            self.assertEqual(good.returncode, 0, good.stderr)
            self.assertIn("verified engine", good.stdout)
            stamp = Path(str(cache) + ".verified")
            self.assertEqual(stamp.read_text().strip(), digest)
            marker = root / "tampered-executed"
            cache.write_text(f'#!/bin/sh\ntouch "{marker}"\n')
            cache.chmod(0o755)
            bad = subprocess.run(["sh", str(launcher), "engine-probe"], env=environment, capture_output=True, text=True)
            self.assertEqual(bad.returncode, 127)
            self.assertIn("cannot verify the cached engine", bad.stderr)
            self.assertFalse(marker.exists(), "replaced bytes must never execute despite valid stamp")


if __name__ == "__main__":
    unittest.main()
