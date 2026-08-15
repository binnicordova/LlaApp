import * as express from 'express';

// Backs the metadata published at /.well-known/oauth-authorization-server
// and /.well-known/openid-configuration. LLAAPP does not gate any content
// behind OAuth today, so these return honest 501 responses instead of a
// fake grant flow — real handlers land here once a protected resource
// (e.g. a partner API or MCP server) actually needs one.
export const router = express.Router();

router.get('/authorize', (_req: express.Request, res: express.Response) => {
  res.status(501).json({
    error: 'not_implemented',
    error_description: 'LLAAPP does not yet issue authorization grants. All site content is public.',
  });
});

router.post('/token', (_req: express.Request, res: express.Response) => {
  res.status(501).json({
    error: 'unsupported_grant_type',
    error_description: 'LLAAPP does not yet issue access tokens.',
  });
});

router.post('/register', (_req: express.Request, res: express.Response) => {
  res.status(501).json({
    error: 'not_implemented',
    error_description: 'Dynamic client registration is not yet available.',
  });
});

router.get('/userinfo', (_req: express.Request, res: express.Response) => {
  res.status(501).json({
    error: 'not_implemented',
    error_description: 'LLAAPP does not yet issue identity tokens.',
  });
});

export default router;
