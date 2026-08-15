import * as express from 'express';
import { buildX402Payload } from './x402Middleware';
import { buildPaymentChallenge, parsePaymentCredential } from './mppMiddleware';

// Demo route proving out payment discovery end-to-end for two different
// agent-payment protocols at once: x402 (JSON body in the 402 response) and
// MPP (an HTTP `Payment` auth-scheme challenge in `WWW-Authenticate`). A
// client can satisfy either — send `X-PAYMENT` for x402, or
// `Authorization: Payment ...` for MPP — same as a server offering both
// Basic and Bearer auth on one endpoint.
//
// Not a real product: swap payTo for a real receiving wallet/account and
// the network for a mainnet before treating this as a revenue path.

export const router = express.Router();

const X402_OPTIONS = {
  price: { amount: '50000', currency: 'USDC', network: 'base-sepolia' },
  payTo: '0x000000000000000000000000000000000000dEaD', // TODO: replace with a real receiving wallet
  description: 'AI Adoption Market Analysis (demo)',
};

const MPP_OPTIONS = {
  realm: 'llaapp.com',
  method: 'stripe', // TODO: set to whatever your processor's MPP integration expects
  amount: '0.50',
  currency: 'USD',
  description: 'AI Adoption Market Analysis (demo)',
};

router.get('/market-analysis', (req: express.Request, res: express.Response) => {
  const x402Paid = Boolean(req.get('X-PAYMENT'));

  const authorization = req.get('Authorization');
  const mppCredential = authorization ? parsePaymentCredential(authorization) : null;
  const mppPaid = Boolean(mppCredential?.payload);

  if (!x402Paid && !mppPaid) {
    // TODO: before accepting real money, verify the X-PAYMENT header against
    // an x402 facilitator and/or the Authorization: Payment credential
    // against your MPP processor instead of rejecting unconditionally here.
    res
      .status(402)
      .set('WWW-Authenticate', buildPaymentChallenge(MPP_OPTIONS))
      .json(buildX402Payload(req.originalUrl, X402_OPTIONS));
    return;
  }

  res.json({
    title: 'AI Adoption Market Analysis (demo)',
    content: 'Example paid content, unlocked after payment verification.',
    paidVia: x402Paid ? 'x402' : 'mpp',
  });
});

export default router;
