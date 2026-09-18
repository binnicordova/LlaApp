// Supplements worldflight-assert.mjs, which crashes at the lerp test because it
// reads window.__sc.clips and engine 0.3.0 never defines it. These checks use
// only public DOM state.
import { chromium } from 'playwright-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL=process.argv[2]||'http://localhost:4510/index.html';
let fails=0;
const ok=(n,c,d='')=>{ console.log(`  ${c?'PASS':'FAIL'}  ${n}${d?'  '+d:''}`); if(!c)fails++; };

const b=await chromium.launch({executablePath:CHROME});

// 1-3: motion contract
let p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1500);
const vh=900, W=[1.1,1.1,1.1,1.76,1.1];
const c0=(i)=>W.slice(0,i).reduce((a,x)=>a+x,0);

// lerp convergence and non-overshoot inside leg 1
await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}), Math.round(0.10*W[0]*vh));
await p.waitForTimeout(1400);
const trace=await p.evaluate(({y})=>new Promise(res=>{
  const v=document.querySelectorAll('[data-sc-segment] video')[0];
  const s=[]; scrollTo({top:y,behavior:'instant'}); let n=0;
  (function f(){ s.push(+v.currentTime.toFixed(4)); if(++n<100) requestAnimationFrame(f); else res({s,dur:v.duration}); })();
}), {y:Math.round(0.85*W[0]*vh)});
const target=0.85*trace.dur, end=trace.s.at(-1), peak=Math.max(...trace.s);
ok('playhead converges on the target', Math.abs(end-target)<0.22, `end ${end.toFixed(2)}s target ${target.toFixed(2)}s`);
ok('playhead does not overshoot', peak<=target+0.12, `peak ${peak.toFixed(2)}s`);
ok('playhead is smoothed, not 1:1', trace.s[2]<target-0.4, `t2 ${trace.s[2].toFixed(2)}s`);

// seam is one-sided: the outgoing leg holds full strength until covered
const seam=await p.evaluate(({top,vh,seam})=>{
  const segs=[...document.querySelectorAll('[data-sc-segment]')];
  const out=[];
  for(let k=-1;k<=1;k+=0.25){
    scrollTo({top:Math.round(top+k*seam*vh*0.5),behavior:'instant'});
    out.push(segs.map(s=>+(getComputedStyle(s).opacity)));
  }
  return out;
},{top:c0(1)*vh,vh,seam:0.16});
const bad=seam.find(r=>r[0]<0.999 && r[1]<0.999);
ok('seam crossfade is one-sided', !bad, bad?`both legs partial: ${JSON.stringify(bad.slice(0,2))}`:'outgoing holds until covered');

// copy translate cap: 4vh across a whole window
const tymax=await p.evaluate(({vh,total})=>{
  const blocks=[...document.querySelectorAll('[data-sc-copy]')];
  let max=0;
  for(let f=0;f<=1.0001;f+=0.02){
    scrollTo({top:Math.round(f*total*vh),behavior:'instant'});
    for(const el of blocks){
      const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);
      max=Math.max(max,Math.abs(m.m42));
    }
  }
  return max;
},{vh,total:6.16});
ok('copy translate within the 4vh cap', tymax<=vh*0.04+1, `max ${tymax.toFixed(1)}px of ${(vh*0.04).toFixed(0)}px`);
await p.close();

// 4: reduced motion must never fetch a clip
p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(1200);
await p.evaluate(()=>scrollTo({top:document.body.scrollHeight*0.5,behavior:'instant'}));
await p.waitForTimeout(900);
const rm=await p.evaluate(()=>{
  const v=[...document.querySelectorAll('[data-sc-segment] video')];
  return { withSrc:v.filter(x=>x.currentSrc||x.getAttribute('src')).length,
           posters:[...document.querySelectorAll('.sc-world__poster')].filter(i=>i.complete&&i.naturalWidth>0).length };
});
ok('reduced motion fetches no clip', rm.withSrc===0, `${rm.withSrc} video(s) with a src`);
ok('reduced motion still has its posters', rm.posters===5, `${rm.posters}/5 decoded`);
await b.close();
console.log(fails? `\n${fails} FAILED` : '\nall supplementary checks passed');
process.exit(fails?1:0);
