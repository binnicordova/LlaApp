import { onRequest } from "firebase-functions/v2/https";

// Serves the homepage with real content negotiation: a client that sends
// `Accept: text/markdown` gets the markdown version (llms-full.txt), everyone
// else gets the normal static HTML. Node 20's runtime ships a global `fetch`,
// so this fetches both variants straight from Hosting rather than bundling a
// second copy of the page into the function.
//
// IMPORTANT — this is not wired up by default. Firebase Hosting serves an
// exact static-file match (public/index.html at "/") before it ever
// evaluates a rewrite, so this function will never run unless index.html is
// moved off the root path first. See the "Enabling content negotiation"
// section in the repo notes before adding the rewrite in firebase.json.

const ORIGIN = "https://llaapp.com";
const STATIC_HOME_PATH = "/_static/index.html";
const MARKDOWN_PATH = "/llms-full.txt";

function prefersMarkdown(acceptHeader: string): boolean {
  const firstType = acceptHeader
    .split(",")[0]
    ?.trim()
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  return firstType === "text/markdown";
}

export const renderHome = onRequest({ region: "us-central1" }, async (req, res) => {
  const accept = req.get("accept") || "";
  const wantsMarkdown = prefersMarkdown(accept);
  const upstreamPath = wantsMarkdown ? MARKDOWN_PATH : STATIC_HOME_PATH;

  try {
    const upstream = await fetch(`${ORIGIN}${upstreamPath}`);
    if (!upstream.ok) {
      res.status(upstream.status).send("Upstream fetch failed");
      return;
    }
    const body = await upstream.text();

    res.set("Vary", "Accept");
    // NOT cached at Firebase Hosting's CDN on purpose: Hosting's cache key
    // does not split on the `Accept` header, so a shared `s-maxage` here
    // would let one variant (HTML or Markdown) get cached and then served
    // to the other kind of client. Browsers may still cache their own copy
    // for a few minutes.
    res.set("Cache-Control", "private, no-store");
    res.set(
      "Content-Type",
      wantsMarkdown ? "text/markdown; charset=utf-8" : "text/html; charset=utf-8"
    );
    res.status(200).send(body);
  } catch (err) {
    console.error("renderHome content negotiation failed", err);
    res.status(502).send("Upstream fetch failed");
  }
});
