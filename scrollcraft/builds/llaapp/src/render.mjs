import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// One continuous camera path. Legs are cuts in the export, not cuts in the world.
// Leg N+1 starts at exactly the T where leg N ends, so the seam frames are
// identical by construction (worldflight.md section 6, architecture A).
export const LEGS = [
  { name:'leg1', label:'Above',      t0:0.00, t1:0.20, secs:5 },
  { name:'leg2', label:'Coast',      t0:0.20, t1:0.42, secs:5 },
  { name:'leg3', label:'Below',      t0:0.42, t1:0.58, secs:5 },
  { name:'leg4', label:'The work',   t0:0.58, t1:0.86, secs:8 },
  { name:'leg5', label:'Horizon',    t0:0.86, t1:1.00, secs:5 }
];
const FPS = 30;

const args = process.argv.slice(2);
const probeOnly = args.includes('--probe');
const mobile = args.includes('--mobile');
const W = mobile ? 720 : 1920, H = mobile ? 1280 : 1080;
const outRoot = resolve(HERE, mobile ? 'frames-m' : 'frames');

const browser = await chromium.launch({ executablePath: CHROME, args:['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport:{ width:W, height:H }, deviceScaleFactor:1 });
await page.goto('file://' + resolve(HERE,'world.html'));
await page.evaluate(([w,h,m]) => window.setup(w,h,m), [W,H,mobile]);
await page.evaluate(() => window.LOAD());

async function shoot(T, frame, file){
  const data = await page.evaluate(([t,f]) => {
    window.drawFrame(t,f);
    return document.getElementById('c').toDataURL('image/jpeg', 0.95);
  }, [T, frame]);
  writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}

if (probeOnly) {
  mkdirSync(resolve(HERE, mobile?'probe-m':'probe'), { recursive:true });
  const ts = [0.04, 0.16, 0.30, 0.46, 0.60, 0.66, 0.74, 0.82, 0.93];
  for (const [i,t] of ts.entries()){
    await shoot(t, Math.round(t*600), resolve(HERE, mobile?'probe-m':'probe',`p${String(i).padStart(2,'0')}-t${t}.jpg`));
  }
  console.log('probe frames written to src/probe/');
} else {
  let total = 0;
  for (const leg of LEGS){
    const dir = resolve(outRoot, leg.name);
    mkdirSync(dir, { recursive:true });
    const n = leg.secs * FPS;
    for (let i=0;i<n;i++){
      const T = leg.t0 + (leg.t1-leg.t0) * (i/(n-1));
      await shoot(T, total+i, resolve(dir, `f${String(i).padStart(4,'0')}.jpg`));
    }
    total += n;
    console.log(`${leg.name} (${leg.label}): ${n} frames`);
  }
  console.log(`${total} frames -> ${outRoot}`);
}
await browser.close();
