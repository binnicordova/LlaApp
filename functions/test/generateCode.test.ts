import { generateCode } from '../src/auth/wsp.lib';

test('generateCode deterministic', () => {
  // same input returns same code
  const a = generateCode('16503744225');
  const b = generateCode('16503744225');
  expect(a).toBe(b);
  expect(a).toMatch(/^\d{6}$/);
});
