/**
 * Markdown for Agents — Cloudflare Worker
 *
 * Sits in front of Firebase Hosting (llaapp.com's origin) as a Cloudflare
 * Worker on the zone. It intercepts only requests that prefer
 * `Accept: text/markdown` and serves the pre-built Markdown mirror of the
 * page (public/llms-full.txt) with the correct content type; every other
 * request passes straight through to Firebase Hosting untouched.
 *
 * Why a Worker instead of a Firebase Cloud Function: Firebase Hosting has
 * no header-based conditional routing, so doing this negotiation inside
 * Firebase means proxying 100% of homepage traffic through a Cloud
 * Function (see functions/src/contentNegotiation.ts for that fallback and
 * its tradeoffs). A Worker negotiates at the edge, so normal browser
 * traffic keeps hitting Firebase's CDN directly — no cold starts, no
 * static-serving regression, and the Vary is handled correctly.
 *
 * Deploy:
 *   1. Point llaapp.com's DNS through Cloudflare (orange-clouded).
 *   2. `wrangler deploy` this Worker (see wrangler.toml.example).
 *   3. Add a route for llaapp.com/* to this Worker in the Cloudflare
 *      dashboard (or via the `routes` field in wrangler.toml).
 */

const ORIGIN = "https://llaapp.com";

// Paths that have a Markdown counterpart. Extend this map as more pages
// get their own llms-full.txt-style mirror.
const MARKDOWN_MIRRORS = {
  "/": "/llms-full.txt",
};

function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const firstType = acceptHeader.split(",")[0].trim().split(";")[0].trim().toLowerCase();
  return firstType === "text/markdown";
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";

    const mirrorPath = MARKDOWN_MIRRORS[url.pathname];
    if (request.method === "GET" && mirrorPath && prefersMarkdown(accept)) {
      const markdownUrl = new URL(mirrorPath, ORIGIN);
      const upstream = await fetch(markdownUrl, { cf: { cacheTtl: 300, cacheEverything: true } });

      const headers = new Headers(upstream.headers);
      headers.set("Content-Type", "text/markdown; charset=utf-8");
      headers.set("Vary", "Accept");
      headers.set("Cache-Control", "public, max-age=300");

      return new Response(upstream.body, { status: upstream.status, headers });
    }

    // Not a markdown-preferring request for a mirrored path — pass through
    // to Firebase Hosting unchanged. Adding `Vary: Accept` here too so any
    // shared cache in between knows the response depends on Accept.
    const passthrough = await fetch(request);
    const headers = new Headers(passthrough.headers);
    headers.append("Vary", "Accept");
    return new Response(passthrough.body, { status: passthrough.status, headers });
  },
};
