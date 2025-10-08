import * as express from 'express';
import { getWhatsappBearer, generateCode, validateCode, sendWhatsAppText } from './wsp.lib';

// Router using functional helpers
export const router = express.Router();

router.post('/send-otp', async (req: express.Request, res: express.Response) => {
  const to = req.body?.to;
  if (!to) return res.status(400).json({ error: 'missing `to` phone number' });

  const code = generateCode(to);
  const bearer = getWhatsappBearer();
  if (!bearer) {
    // do not return the code in the response
    return res.status(403).json({ to, sent: false, reason: 'whatsapp_not_configured' });
  }

  const result = await sendWhatsAppText(bearer, to, code);
  // do not include the code in the response
  return res.status(200).json({ to, sent: !result.error, whatsapp: result });
});

router.post('/validate-otp', (req: express.Request, res: express.Response) => {
  const to = req.body?.to;
  const code = req.body?.code;
  if (!to || !code) return res.status(400).json({ error: 'missing `to` or `code`' });
  const valid = validateCode(to, String(code));
  return res.status(valid ? 200 : 401).json({ valid });
});

export default router;
