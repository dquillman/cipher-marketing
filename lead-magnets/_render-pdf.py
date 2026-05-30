#!/usr/bin/env python3
"""
Render a lead-magnet markdown file to a print-ready PDF.

Pipeline:
  .md  ->  styled .html  ->  Chrome headless --print-to-pdf  ->  .pdf

Usage:
  python _render-pdf.py <slug>
  where <slug>.md exists in this directory and produces <slug>.pdf next to it.

Requires:
  - Python `markdown` library (`pip install markdown`)
  - Google Chrome at the default Windows path
"""

from __future__ import annotations
import sys
import subprocess
from pathlib import Path
import markdown

HERE = Path(__file__).resolve().parent

CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]


def find_chrome() -> str:
    for p in CHROME_PATHS:
        if Path(p).exists():
            return p
    raise FileNotFoundError("Chrome not found at default Windows paths")


def md_to_html(md_path: Path) -> str:
    text = md_path.read_text(encoding="utf-8")
    # Strip the YAML front matter (between leading --- markers) — markdown lib
    # treats it as a horizontal rule otherwise.
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end >= 0:
            text = text[end + 4 :].lstrip("\n")
    body = markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "sane_lists"],
        output_format="html5",
    )
    return body


CSS = """
@page { size: letter; margin: 0.75in 0.65in; }
body {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 11pt; line-height: 1.55; color: #0f172a;
  max-width: 7.1in; margin: 0 auto; padding: 0;
}
h1 { font-size: 28pt; line-height: 1.15; margin: 0 0 0.25in 0; color: #0b1220; }
h2 { font-size: 16pt; line-height: 1.25; margin: 0.35in 0 0.12in 0; color: #0b1220; page-break-after: avoid; }
h3 { font-size: 13pt; margin: 0.25in 0 0.08in 0; color: #0b1220; page-break-after: avoid; }
p  { margin: 0 0 0.12in 0; }
ul, ol { margin: 0 0 0.14in 0.3in; padding: 0; }
li { margin: 0 0 0.05in 0; }
blockquote {
  border-left: 3px solid #94a3b8;
  margin: 0 0 0.18in 0; padding: 0.04in 0 0.04in 0.18in;
  color: #1f2937; font-style: italic;
}
table { border-collapse: collapse; width: 100%; margin: 0 0 0.18in 0; font-size: 10pt; page-break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 6px 9px; text-align: left; vertical-align: top; }
th { background: #f1f5f9; font-weight: 600; }
code { font-family: "Consolas","Courier New",monospace; font-size: 10pt; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
pre  { background: #0f172a; color: #e2e8f0; padding: 10pt; border-radius: 4pt; font-size: 9.5pt; line-height: 1.45; overflow-wrap: break-word; page-break-inside: avoid; }
pre code { background: transparent; color: inherit; padding: 0; }
hr { border: 0; border-top: 1px solid #cbd5e1; margin: 0.25in 0; }
a { color: #1e3a8a; text-decoration: none; }
a:hover { text-decoration: underline; }
strong { font-weight: 700; }
em { font-style: italic; }
.byline { color: #475569; margin-bottom: 0.3in; }
"""


def wrap_html(title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>
"""


def render(slug: str) -> Path:
    md_path = HERE / f"{slug}.md"
    if not md_path.exists():
        raise FileNotFoundError(md_path)
    html_path = HERE / f"{slug}.html"
    pdf_path = HERE / f"{slug}.pdf"

    body = md_to_html(md_path)
    html_path.write_text(wrap_html(slug, body), encoding="utf-8")

    chrome = find_chrome()
    # Chrome wants forward slashes in file:// URLs
    file_url = "file:///" + str(html_path).replace("\\", "/")

    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        "--virtual-time-budget=5000",
        file_url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if not pdf_path.exists() or pdf_path.stat().st_size < 1000:
        raise RuntimeError(
            f"Chrome did not produce a valid PDF for {slug}.\n"
            f"stdout: {proc.stdout}\nstderr: {proc.stderr}"
        )
    return pdf_path


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: _render-pdf.py <slug>", file=sys.stderr)
        return 2
    for slug in sys.argv[1:]:
        out = render(slug)
        print(f"OK  {slug} -> {out.name}  ({out.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
