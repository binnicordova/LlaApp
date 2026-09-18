import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
for (const lang of ['en','es']) {
  const p=await b.newPage({viewport:{width:1600,height:900}});
  await p.goto(`http://localhost:4510/index.html?lang=${lang}`,{waitUntil:'load'});
  await p.waitForTimeout(1800);
  for (const [frac,name] of [[0.02,'01-hero'],[0.245,'02-consult'],[0.49,'03-build'],[0.62,'04-scale'],[0.97,'05-2027']]) {
    await p.evaluate(f=>scrollTo({top:Math.round(f*6.16*innerHeight),behavior:'instant'}), frac);
    await p.waitForTimeout(1300);
    await p.screenshot({path:`lab/narr-${lang}-${name}.png`});
  }
  await p.close();
}
await b.close(); console.log('narrative frames written');
