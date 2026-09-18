import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:4510/index.html',{waitUntil:'load'});
await p.waitForTimeout(1500);
const s=[];
for(let f=0;f<=1.0001;f+=0.02){
  await p.evaluate(v=>scrollTo({top:v,behavior:'instant'}),Math.round(f*6.16*900));
  await p.waitForTimeout(110);
  s.push({f,legs:await p.evaluate(()=>[...document.querySelectorAll('[data-sc-segment]')].map(x=>({
    o:+(+getComputedStyle(x).opacity).toFixed(3),
    t:+(x.querySelector('video')?.currentTime||0).toFixed(3)})))});
}
// A visible leg must be advancing. If every visible leg is static between two
// samples, the reader is looking at a still image while scrolling.
const stuck=[];
for(let i=1;i<s.length;i++){
  const vis=s[i].legs.map((l,k)=>({k,l,prev:s[i-1].legs[k]})).filter(x=>x.l.o>0.01);
  if(!vis.length) continue;
  if(vis.every(x=>Math.abs(x.l.t-x.prev.t)<0.004))
    stuck.push({at:s[i].f.toFixed(2), legs:vis.map(x=>`leg${x.k+1}@${x.l.t}`).join(' ')});
}
console.log(`samples ${s.length}, spans where every visible leg was static: ${stuck.length}`);
stuck.slice(0,6).forEach(x=>console.log(`   track ${x.at}: ${x.legs}`));
console.log(stuck.length===0
 ? 'VERDICT: no visible leg is ever frozen. The harness FROZEN CLIP lines refer to hidden, parked legs, which is how worldflight keeps every clip mounted.'
 : 'VERDICT: real frozen frames on screen.');
await b.close();
