import type { NextFunction, Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

// Reference implementation of MPP (Machine Payments Protocol,
// https://mpp.dev, co-authored by Tempo and Stripe: github.com/tempoxyz/mpp-specs).
//
// Unlike x402, MPP is not a JSON-body-in-the-402-response protocol — it's an
// HTTP authentication scheme (RFC 7235-style), like Basic or Bearer, named
// "Payment". A server challenges with `WWW-Authenticate: Payment ...`; a
// client that already has proof of payment retries with
// `Authorization: Payment <base64url-JSON>`. Verified against the published
// draft syntax at https://paymentauth.org/draft-httpauth-payment-00.html —
// this demo never verifies a real credential against a processor (Stripe,
// Tempo, etc.); wire that in before accepting real payments.

export interface MppChallengeOptions {
  realm: string;
  method: string; // payment method identifier your processor expects, e.g. "stripe", "tempo", "card"
  amount: string;
  currency: string;
  description: string;
  expiresInSeconds?: number;
}

function base64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function buildPaymentChallenge(options: MppChallengeOptions): string {
  const id = randomBytes(12).toString('hex');
  const expires = new Date(Date.now() + (options.expiresInSeconds ?? 300) * 1000).toISOString();
  const request = base64url(
    JSON.stringify({ amount: options.amount, currency: options.currency, description: options.description }),
  );

  const params = [
    `id="${id}"`,
    `realm="${options.realm}"`,
    `method="${options.method}"`,
    `intent="charge"`,
    `expires="${expires}"`,
    `request="${request}"`,
  ];
  return `Payment ${params.join(', ')}`;
}

export function parsePaymentCredential(authorizationHeader: string): { challenge?: unknown; source?: unknown; payload?: unknown } | null {
  const match = authorizationHeader.match(/^Payment\s+([A-Za-z0-9_-]+)$/);
  if (!match) return null;
  try {
    return JSON.parse(base64urlDecode(match[1]));
  } catch {
    return null;
  }
}

export function requireMppPayment(options: MppChallengeOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.get('Authorization');
    if (authorization) {
      const credential = parsePaymentCredential(authorization);
      if (credential?.payload) {
        // TODO: verify `credential.payload` against your processor (Stripe,
        // Tempo, etc.) before calling next(). This demo trusts any
        // well-formed credential.
        return next();
      }
    }

    res.status(402).set('WWW-Authenticate', buildPaymentChallenge(options));
    next(); // let the route handler finish the response (it may also attach an x402 body)
  };
}
