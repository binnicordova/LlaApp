/**
 * x402 payment gate — Cloudflare Worker reference implementation
 * (https://www.x402.org). Same challenge/response pattern as
 * functions/src/x402Middleware.ts, ported to the edge: a request without
 * proof of payment gets HTTP 402 + a JSON list of accepted payment methods;
 * a request carrying `X-PAYMENT` is let through to origin.
 *
 * Route this at whichever path(s) you want to monetize — it does not need
 * to run in front of the whole zone the way the Markdown-negotiation
 * Worker does. See wrangler.toml.example for a route scoped to one path.
 *
 * This demo never verifies the header against a real facilitator — wire in
 * an x402 facilitator (e.g. Coinbase's) before accepting real payments.
 */

const PRICE = { amount: "50000", currency: "USDC", network: "base-sepolia" };
const PAY_TO = "0x000000000000000000000000000000000000dEaD"; // TODO: real receiving wallet
const DESCRIPTION = "AI Adoption Market Analysis (demo)";

export default {
  async fetch(request) {
    const paymentHeader = request.headers.get("X-PAYMENT");

    if (!paymentHeader) {
      const body = {
        x402Version: 1,
        accepts: [
          {
            scheme: "exact",
            network: PRICE.network,
            maxAmountRequired: PRICE.amount,
            resource: new URL(request.url).pathname,
            description: DESCRIPTION,
            mimeType: "application/json",
            payTo: PAY_TO,
            asset: PRICE.currency,
          },
        ],
      };
      return new Response(JSON.stringify(body), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: verify `paymentHeader` against an x402 facilitator before
    // returning the real paid response. This demo trusts any header.
    return new Response(
      JSON.stringify({
        title: "AI Adoption Market Analysis (demo)",
        content: "Example paid content, unlocked after payment verification.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
};
