"""Usage: python scripts/sync_media_dims.py [--check]

Makes the width/height written in src/data/projects.ts match the real files in
public/, and reports any image, clip or poster that is missing. Run it after
re-exporting media. With --check nothing is written.
"""
import os
import re
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "src", "data", "projects.ts")
PUBLIC = os.path.join(ROOT, "public")

src = open(DATA, encoding="utf-8").read()
consts = dict(re.findall(r'const (\w+) = "(/[^"]+)";', src))
problems = []
changed = 0


def resolve(template):
    """`${CLAW}/x.jpg` or "/images/x.jpg" -> site path"""
    m = re.match(r"`\$\{(\w+)\}([^`]*)`", template)
    if m:
        if m.group(1) not in consts:
            return None  # a template inside a helper, not a real path
        return consts[m.group(1)] + m.group(2)
    return template.strip('"')


def size_of(path):
    full = PUBLIC + path
    if not os.path.exists(full):
        problems.append("MISSING " + path)
        return None
    with Image.open(full) as im:
        return im.size


def fix(match, path, w_group, h_group):
    global changed
    actual = size_of(path)
    if actual is None:
        return match.group(0)
    w, h = int(match.group(w_group)), int(match.group(h_group))
    if (w, h) == actual:
        return match.group(0)
    changed += 1
    print(f"  {path}: {w}x{h} -> {actual[0]}x{actual[1]}")
    text = match.group(0)
    a, b = match.start(w_group) - match.start(0), match.end(h_group) - match.start(0)
    middle = text[match.end(w_group) - match.start(0) : match.start(h_group) - match.start(0)]
    return text[:a] + str(actual[0]) + middle + str(actual[1]) + text[b:]


PATH = r'(`\$\{\w+\}[^`]*`|"/[^"]+")'
# img(path, "alt", w, h
src = re.sub(
    r"img\(" + PATH + r',\s*"[^"]*",\s*(\d+),\s*(\d+)',
    lambda m: fix(m, resolve(m.group(1)), 2, 3),
    src,
)


# clip(base, w, h  -> base.mp4 + base.jpg (the poster carries the dimensions)
def fix_clip(m):
    base = resolve(m.group(1))
    if not os.path.exists(PUBLIC + base + ".mp4"):
        problems.append("MISSING " + base + ".mp4")
    return fix(m, base + ".jpg", 2, 3)


src = re.sub(r"clip\(" + PATH + r",\s*(\d+),\s*(\d+)", fix_clip, src)

for m in re.finditer(r"(?:poster|video): " + PATH, src):
    path = resolve(m.group(1))
    if path and not os.path.exists(PUBLIC + path):
        problems.append("MISSING card " + path)

if "--check" not in sys.argv and changed:
    open(DATA, "w", encoding="utf-8", newline="\n").write(src)
print(f"{changed} size(s) {'would change' if '--check' in sys.argv else 'updated'}")
for p in sorted(set(problems)):
    print(p)
sys.exit(1 if problems else 0)
