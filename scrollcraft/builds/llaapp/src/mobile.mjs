import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const ctx=await b.newContext({viewport:{width:390,height:844}, hasTouch:true, isMobile:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4510/index.html',{waitUntil:'load'});
await p.waitForTimeout(1800);
let fails=0;
const ok=(n,c,d='')=>{console.log(`  ${c?'PASS':'FAIL'}  ${n}${d?'  '+d:''}`); if(!c)fails++;};

ok('no page errors', errs.length===0, errs.join('; '));
const rail=await p.evaluate(()=>{
  const n=document.querySelector('.wf-mrail');
  const btns=[...document.querySelectorAll('.wf-mrail__leg')];
  const r=btns.map(b=>b.getBoundingClientRect());
  return {visible:getComputedStyle(n).display!=='none', count:btns.length,
    minW:Math.min(...r.map(x=>x.width)), minH:Math.min(...r.map(x=>x.height)),
    label:document.getElementById('mrailLabel').textContent.trim(),
    lerp:document.querySelector('[data-sc-mode]').getAttribute('data-sc-lerp')};
});
ok('phone route rail is present', rail.visible && rail.count===5, `${rail.count} ticks`);
ok('tap targets are at least 44px', rail.minW>=44 && rail.minH>=44, `${Math.round(rail.minW)}x${Math.round(rail.minH)}`);
ok('lerp retuned for touch', rail.lerp==='0.16', `data-sc-lerp=${rail.lerp}`);
ok('rail starts on the first leg', rail.label==='Vancouver', rail.label);

// tap "The work" and confirm we land on the peak with its copy at full strength
await p.tap('.wf-mrail__leg[data-leg="3"]');
await p.waitForTimeout(2600);
const peak=await p.evaluate(()=>{
  const total=6.16;
  const frac=scrollY/(total*innerHeight);
  const blocks=[...document.querySelectorAll('[data-sc-copy]')].map(b=>+getComputedStyle(b).opacity);
  return {frac:+frac.toFixed(3), maxOpacity:Math.max(...blocks),
    label:document.getElementById('mrailLabel').textContent.trim(),
    current:document.querySelector('.wf-mrail__leg[aria-current="true"]')?.dataset.leg};
});
ok('tapping a tick travels to that leg', peak.current==='3', `landed on leg ${peak.current} at track ${peak.frac}`);
ok('it lands on copy, not in silence', peak.maxOpacity>0.9, `max copy opacity ${peak.maxOpacity.toFixed(2)}`);
ok('label follows the journey', peak.label==='Scale', peak.label);

// the sounding must answer a tap on touch
const sig=await p.evaluate(async()=>{
  const cv=document.getElementById('sounding'); const c=cv.getContext('2d');
  const ink=()=>{const d=c.getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=4) if(d[i]>0)n++;return n;};
  const before=ink();
  dispatchEvent(new PointerEvent('pointerdown',{clientX:innerWidth/2,clientY:innerHeight/2,bubbles:true}));
  let peak=0; for(let i=0;i<24;i++){await new Promise(r=>requestAnimationFrame(r)); peak=Math.max(peak,ink());}
  return {before,peak};
});
ok('the sounding answers a tap', sig.peak>sig.before, `${sig.peak} px lit`);
await p.screenshot({path:'lab/proof-04-mobile-rail.png'});
await b.close();
console.log(fails?`\n${fails} FAILED`:'\nmobile interaction checks passed');
process.exit(fails?1:0);
