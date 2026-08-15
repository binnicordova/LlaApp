import type { NextFunction, Request, Response } from 'express';

// Reference implementation of the x402 challenge/response pattern
// (https://www.x402.org, spec docs at https://docs.x402.org): a client
// without proof of payment gets HTTP 402 plus a machine-readable list of
// accepted payment methods in the response body; a client that already
// paid attaches an `X-PAYMENT` header and is let through.
//
// This is the JSON-body pattern used by the original x402 whitepaper and
// still what most deployed x402 facilitators/clients (Coinbase's
// x402-express, x402-next, thirdweb, etc.) speak today. docs.x402.org also
// references a newer header-based "V2" flow (PAYMENT-REQUIRED /
// PAYMENT-SIGNATURE / PAYMENT-RESPONSE headers) that we could not get a
// full field-level schema for at the time this was written — before wiring
// this to real money, diff this against the official `x402-express`
// package (npmjs.com/package/x402-express) rather than trusting this file
// verbatim; a maintained SDK tracks spec revisions, this reference doesn't.
//
// This demo never verifies the header against a real facilitator — wire in
// an x402 facilitator (e.g. Coinbase's) before accepting real payments.

export interface X402Price {
  amount: string;
  currency: string;
  network: string;
}

export interface X402Options {
  price: X402Price;
  payTo: string;
  description: string;
}

export function buildX402Payload(resource: string, options: X402Options) {
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: options.price.network,
        maxAmountRequired: options.price.amount,
        resource,
        description: options.description,
        mimeType: 'application/json',
        payTo: options.payTo,
        asset: options.price.currency,
      },
    ],
  };
}

export function requirePayment(options: X402Options) {
  return (req: Request, res: Response, next: NextFunction) => {
    const paymentHeader = req.get('X-PAYMENT');
    if (paymentHeader) {
      // TODO: verify `paymentHeader` against an x402 facilitator before
      // calling next(). Until then this demo treats any header as valid.
      return next();
    }

    res.status(402).json(buildX402Payload(req.originalUrl, options));
  };
}
