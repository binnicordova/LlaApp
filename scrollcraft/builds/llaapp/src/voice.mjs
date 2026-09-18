import { readFileSync } from 'node:fs';
const ORDER=['wfHeroTitle','wfHeroLead','wfAuditTitle','wfAuditBody','wfDataTitle','wfDataBody','wfWorkTitle','wfWorkBody','wfWorkEyebrow','wfWorkMeta','wfCloseTitle','wfCloseBody','wfCta','wfEmail'];
const en=JSON.parse(readFileSync('locales/en.json','utf8'));
console.log('=== VOICE THROUGH THE SCROLL (first person singular vs plural) ===');
for (const k of ORDER){
  const v=en[k]||''; 
  const we=/\b(we|our|us)\b/i.test(v), me=/\b(I|my|me)\b/.test(v);
  const tag = we&&me ? 'BOTH' : we ? 'WE ' : me ? 'I  ' : '–  ';
  console.log(`  ${tag}  ${k.padEnd(15)} ${v.slice(0,86)}`);
}
console.log('\n=== ONE LABEL PER INTENT (taste.md) ===');
const intents={
 'book the meeting':['wfCta','wfLeg5','wfCloseTitle'],
 'the paid engagement':['wfLeg2','wfAuditBody']
};
for (const [intent,keys] of Object.entries(intents)){
  console.log(`  "${intent}" is called:`);
  for (const k of keys) console.log(`     ${k.padEnd(14)} ${en[k]}`);
}
console.log('\n=== THE OBJECTIVE, CLAIM BY CLAIM ===');
const all=ORDER.map(k=>en[k]).join(' ').toLowerCase();
const claims={
 '"custom software"':'custom software',
 '"AI transformation"':'ai transformation',
 '"app" / app products':'app',
 'downloads / scale in numbers':'download',
 '2027 / any date or urgency':'2027',
 'the word "elite"':'elite',
 '"consult"':'consult'
};
for (const [label,needle] of Object.entries(claims))
  console.log(`  ${all.includes(needle)?'present ':'ABSENT  '} ${label}`);
