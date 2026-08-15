#!/usr/bin/env node
// Real broken-link check for the deployed site: fetches every internal and
// external href/src found on the live page and reports genuine failures
// (DNS errors, connection refused, 404/410/5xx) separately from 401/403
// responses from sites that simply block non-browser traffic (WAF/bot
// protection) — those are noisy false positives, not broken links.
//
// This is the concrete, CI-runnable equivalent of GeoDaddy's "run with
// site-wide crawling" recommendation for a single-page site: llaapp.com has
// exactly one crawlable page (see sitemap.xml), so "site-wide" here means
// "every outbound link that page contains," which this script verifies
// directly against production rather than waiting on a third-party crawl.
//
// Usage:
//   node scripts/check-links.mjs                       # checks https://llaapp.com/
//   node scripts/check-links.mjs http://localhost:4173  # checks a local preview instead

const target = process.argv[2] || "https://llaapp.com/";
const origin = new URL(target).origin;

const UA = "Mozilla/5.0 (compatible; LLAAPPLinkCheck/1.0; +https://llaapp.com)";
const TIMEOUT_MS = 12_000;

function extractUrls(html, base) {
  const attrRe = /(?:href|src)="([^"]+)"/g;
  const found = new Set();
  let m;
  while ((m = attrRe.exec(html))) {
    const raw = m[1];
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
    try {
      found.add(new URL(raw, base).toString());
    } catch {
      // ignore unparsable
    }
  }
  return [...found];
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": UA }, signal: controller.signal });
    // Some origins don't implement HEAD correctly; retry with GET before
    // concluding it's broken.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": UA }, signal: controller.signal });
    }
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    return { url, status: null, ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

const res = await fetch(target, { headers: { "User-Agent": UA } });
if (!res.ok) {
  console.error(`Could not fetch ${target}: HTTP ${res.status}`);
  process.exit(1);
}
const html = await res.text();
const urls = extractUrls(html, target).filter((u) => u.startsWith("http"));

console.log(`Checking ${urls.length} unique link(s) found on ${target}\n`);

const results = await Promise.all(urls.map(checkUrl));

const broken = results.filter((r) => !r.ok && r.status !== 401 && r.status !== 403);
const botBlocked = results.filter((r) => r.status === 401 || r.status === 403);
const ok = results.filter((r) => r.ok);

for (const r of ok) console.log(`  OK    ${r.status}  ${r.url}`);
for (const r of botBlocked) console.log(`  WARN  ${r.status}  ${r.url}  (likely bot/WAF-blocked, verify manually in a browser)`);
for (const r of broken) console.log(`  FAIL  ${r.status ?? "ERR"}  ${r.url}${r.error ? `  (${r.error})` : ""}`);

console.log(`\n${ok.length} ok, ${botBlocked.length} bot-blocked (needs manual check), ${broken.length} broken`);
process.exitCode = broken.length > 0 ? 1 : 0;
