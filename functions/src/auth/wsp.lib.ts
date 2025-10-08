import * as https from 'https';

// Config helpers
export const getOtpSecret = (): string => process.env.OTP_SECRET!;
export const getWhatsappBearer = (): string => process.env.WHATSAPP_BEARER!;

// OTP functions (pure) - lightweight deterministic algorithm (no crypto)
// Algorithm: simple roll-hash over (to + secret) producing a numeric value, then mod 1e6
export const generateCode = (to: string, secret = getOtpSecret()): string => {
  const s = String(to) + '|' + String(secret);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0; // keep as unsigned 32-bit
  }
  const codeNum = h % 1000000;
  return String(codeNum).padStart(6, '0');
};

export const validateCode = (to: string, code: string, secret?: string): boolean => {
  return String(code) === generateCode(to, secret);
};

// WhatsApp send function (imperative side-effect)
export const sendWhatsAppText = (bearer: string, to: string, text: string): Promise<{ status?: number; body?: string; error?: string }> => {
  if (!bearer) return Promise.resolve({ error: 'not_configured' });
  const WHATSAPP_ID = process.env.WHATSAPP_ID;
  const TEMPLATENAME = 'single_verification_code';
  const LANGUAGECODE = 'en_US';
  const payload = { 
    messaging_product: 'whatsapp', 
    to, 
    type: 'template', 
    template: { 
      name: TEMPLATENAME, 
      language: { code: LANGUAGECODE },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: text
            }
          ]
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            {
              type: "text",
              text: text
            }
          ]
        }
      ]
    } 
  };
  const body = JSON.stringify(payload);
  const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${WHATSAPP_ID}/messages`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  } as any;

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', (e) => resolve({ error: String(e) }));
    req.write(body);
    req.end();
  });
};
