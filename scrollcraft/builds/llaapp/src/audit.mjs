import { readFileSync } from 'node:fs';
const html = readFileSync('index.html','utf8');
const LANGS = ['en','es','fr','de','it'];
const loc = Object.fromEntries(LANGS.map(l=>[l, JSON.parse(readFileSync(`locales/${l}.json`,'utf8'))]));

// keys in document order, with the scroll window they belong to
const blocks = [...html.matchAll(/data-sc-window="([^"]+)"([\s\S]*?)(?=data-sc-window="|<div data-sc-spacer)/g)];
const order = [];
for (const [,win,body] of blocks){
  for (const m of body.matchAll(/data-i18n="([^"]+)"/g)) order.push({win, key:m[1]});
}
// chrome keys (outside the copy layer)
const chrome = [...html.matchAll(/data-i18n="(wf(?:Cta|Email|Leg\d|FounderRole))"/g)].map(m=>m[1]);

const used = new Set([...order.map(o=>o.key), ...chrome]);
const enText = k => (loc.en[k] ?? '(missing)');

console.log('=== NARRATIVE IN SCROLL ORDER ===');
let last=null;
for (const {win,key} of order){
  if (win!==last){ console.log(`\n[window ${win}]`); last=win; }
  console.log(`  ${key.padEnd(16)} ${String(enText(key)).slice(0,96)}`);
}

console.log('\n=== RAIL LABELS (the spine the reader navigates by) ===');
for (const l of LANGS) console.log(`  ${l}: ` + [1,2,3,4,5].map(i=>loc[l][`wfLeg${i}`]??'MISSING').join(' / '));

console.log('\n=== i18n INTEGRITY ===');
for (const l of LANGS.filter(x=>x!=='en')){
  const missing=[...used].filter(k=>!(k in loc[l]) || !loc[l][k]);
  const same=[...used].filter(k=>loc[l][k] && loc[l][k]===loc.en[k] && !/^(Vancouver|LLAAPP)/.test(loc.en[k]));
  console.log(`  ${l}: missing ${missing.length?missing.join(','):'none'} | untranslated ${same.length?same.join(','):'none'}`);
}
const dead = Object.keys(loc.en).filter(k=>k!=='meta' && !used.has(k));
console.log(`\n=== DEAD KEYS (in locales, on no element) === ${dead.length} of ${Object.keys(loc.en).length}`);
console.log('  ' + dead.slice(0,28).join(', ') + (dead.length>28?` … +${dead.length-28} more`:''));

console.log('\n=== META PER LOCALE ===');
for (const l of LANGS) console.log(`  ${l}: ${loc[l].meta.title}`);
