#!/usr/bin/env node
// Detect <img> tags with missing or empty alt attributes and suggest
// descriptive, AI-friendly alt text. Heuristics only — no network calls.
//
// Usage:
//   node scripts/audit-alt-text.mjs                 # report only
//   node scripts/audit-alt-text.mjs --fix            # write suggested alt text back into the file(s)
//   node scripts/audit-alt-text.mjs public/other.html --fix
//
// Default target moved from public/index.html to public/_static/index.html
// once the homepage started being served through the renderHome content-
// negotiation function instead of directly as a static file.
//
// What counts as "needs attention":
//   - alt attribute missing entirely
//   - alt="" AND the image is not inside an aria-hidden="true" wrapper
//     (an empty alt inside an aria-hidden decorative wrapper is correct
//     and is left alone)
//
// Suggestion sources, in priority order:
//   1. title="" on the <img> itself
//   2. data-analytics-label="" on the <img> or an ancestor <a>
//   3. visible caption/label text immediately after the image in the same block
//   4. the filename, humanized (logo-cocacola.svg -> "Cocacola logo")

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const fix = args.includes("--fix");
const files = args.filter((a) => !a.startsWith("--"));
const targets = files.length ? files : ["public/_static/index.html"];

const IMG_TAG_RE = /<img\b[^>]*>/g;
const ATTR_RE = (name) => new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i");

function humanizeFilename(src) {
  const base = src.split("/").pop().replace(/\.[a-z0-9]+$/i, "");
  const words = base
    .replace(/^(logo|icon|demo|blog|promo)[-_]?/i, (m) => m.replace(/[-_]/, " ").trim() + " ")
    .replace(/[-_]+/g, " ")
    .replace(/\b\d+x\d+\b/g, "")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function suggestAlt(imgTag, context) {
  const title = imgTag.match(ATTR_RE("title"));
  if (title && title[1].trim()) return title[1].trim();

  const analyticsLabel = imgTag.match(ATTR_RE("data-analytics-label"));
  if (analyticsLabel && analyticsLabel[1].trim()) return analyticsLabel[1].trim();

  if (context.ancestorLabel) return context.ancestorLabel;

  if (context.captionText) return context.captionText;

  const src = imgTag.match(ATTR_RE("src"));
  if (src) {
    const humanized = humanizeFilename(src[1]);
    if (humanized) return humanized;
  }

  return null;
}

function isInsideAriaHiddenWrapper(html, imgIndex) {
  // Walk backwards from the <img> to find the nearest unclosed ancestor
  // opening tag; if it (or one within ~300 chars back) carries
  // aria-hidden="true", treat the image as intentionally decorative.
  const windowStart = Math.max(0, imgIndex - 400);
  const before = html.slice(windowStart, imgIndex);
  return /aria-hidden="true"[^>]*>[^<]*$/.test(before) || /<[a-z]+[^>]*aria-hidden="true"[^>]*>(?:(?!<\/).)*$/is.test(before);
}

function findCaptionText(html, imgTagEnd) {
  // Look for a sibling text node or heading immediately following the image,
  // within the same small block (e.g. <span class="...">Coca-Cola</span>).
  const after = html.slice(imgTagEnd, imgTagEnd + 400);
  const match = after.match(/<(?:span|h\d|p|small)[^>]*>([^<{2,}][^<]{1,60})<\//);
  return match ? match[1].trim() : null;
}

function findAncestorLabel(html, imgIndex) {
  const before = html.slice(Math.max(0, imgIndex - 600), imgIndex);
  const anchor = [...before.matchAll(/<a\b([^>]*)>/g)].pop();
  if (!anchor) return null;
  const attrs = anchor[1];
  const ariaLabel = attrs.match(ATTR_RE("aria-label"));
  if (ariaLabel && ariaLabel[1].trim()) return ariaLabel[1].trim();
  const label = attrs.match(ATTR_RE("data-analytics-label"));
  if (label && label[1].trim()) return label[1].trim();
  const titleAttr = attrs.match(ATTR_RE("title"));
  if (titleAttr && titleAttr[1].trim()) return titleAttr[1].trim();
  return null;
}

let totalFlagged = 0;
let totalFixed = 0;

for (const relPath of targets) {
  const filePath = resolve(process.cwd(), relPath);
  let html = readFileSync(filePath, "utf8");
  const report = [];
  let cursor = 0;
  let output = "";

  html.replace(IMG_TAG_RE, (imgTag, offset) => {
    const hasAlt = ATTR_RE("alt").test(imgTag);
    const altMatch = imgTag.match(ATTR_RE("alt"));
    const altIsEmpty = hasAlt && altMatch[1].trim() === "";
    const needsAttention = !hasAlt || altIsEmpty;

    output += html.slice(cursor, offset);

    if (!needsAttention) {
      output += imgTag;
      cursor = offset + imgTag.length;
      return imgTag;
    }

    const decorative = isInsideAriaHiddenWrapper(html, offset);
    if (decorative) {
      output += imgTag;
      cursor = offset + imgTag.length;
      return imgTag;
    }

    const context = {
      ancestorLabel: findAncestorLabel(html, offset),
      captionText: findCaptionText(html, offset + imgTag.length),
    };
    const suggestion = suggestAlt(imgTag, context);
    const src = (imgTag.match(ATTR_RE("src")) || [, "(no src)"])[1];

    report.push({ src, hasAlt, suggestion });
    totalFlagged++;

    let newTag = imgTag;
    if (fix && suggestion) {
      newTag = hasAlt
        ? imgTag.replace(/alt="[^"]*"/, `alt="${suggestion.replace(/"/g, "&quot;")}"`)
        : imgTag.replace(/<img\b/, `<img alt="${suggestion.replace(/"/g, "&quot;")}"`);
      totalFixed++;
    }

    output += newTag;
    cursor = offset + imgTag.length;
    return imgTag;
  });
  output += html.slice(cursor);

  console.log(`\n${relPath}`);
  if (report.length === 0) {
    console.log("  No images with missing/empty alt text outside decorative wrappers.");
  } else {
    for (const r of report) {
      const status = r.hasAlt ? "empty alt=\"\"" : "missing alt";
      console.log(`  [${status}] ${r.src}`);
      console.log(`    -> suggested: ${r.suggestion ? JSON.stringify(r.suggestion) : "(no heuristic match — needs a human)"}`);
    }
  }

  if (fix && report.length) {
    writeFileSync(`${filePath}.bak`, html, "utf8");
    writeFileSync(filePath, output, "utf8");
    console.log(`  Wrote ${totalFixed} suggested alt attribute(s). Backup saved to ${relPath}.bak`);
  }
}

console.log(`\n${totalFlagged} image(s) flagged${fix ? `, ${totalFixed} fixed` : " (run with --fix to apply suggestions)"}.`);
process.exitCode = totalFlagged > 0 && !fix ? 1 : 0;
