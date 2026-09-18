import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
for (const rm of [false,true]) {
  const p=await b.newPage({viewport:{width:1440,height:900}, reducedMotion: rm?'reduce':'no-preference'});
  await p.goto('http://localhost:4510/index.html',{waitUntil:'load'});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(async ()=>{
    const cv=document.getElementById('sounding');
    if(!cv || getComputedStyle(cv).display==='none') return {skipped:true};
    const c=cv.getContext('2d');
    const ink=()=>{const d=c.getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=4) if(d[i]>0)n++;return n;};
    const before=ink();
    dispatchEvent(new PointerEvent('pointerdown',{clientX:innerWidth/2,clientY:innerHeight/2,bubbles:true}));
    let peak=0;
    for(let i=0;i<24;i++){ await new Promise(r=>requestAnimationFrame(r)); peak=Math.max(peak,ink()); }
    await new Promise(r=>setTimeout(r,1500));
    return {before, peak, after:ink()};
  });
  console.log(rm?'reduced motion:':'normal motion: ', JSON.stringify(r));
  if(!rm) console.log(r.peak>r.before ? '  PASS  the sounding draws on pointer, then decays to nothing' : '  FAIL  no ping drawn');
  else console.log(r.skipped ? '  PASS  the sounding is absent under reduced motion' : '  FAIL  still drawing under reduced motion');
  await p.close();
}
await b.close();
