import { readFileSync, statSync } from 'node:fs';
const LANGS=['es','fr','de','it'];
const USED=['wfHeroTitle','wfHeroLead','wfCta','wfEmail','wfAuditTitle','wfAuditBody','wfDataTitle','wfDataBody','wfWorkTitle','wfWorkBody','wfWorkEyebrow','wfWorkMeta','wfFounderRole','wfCloseTitle','wfCloseBody','wfLeg1','wfLeg2','wfLeg3','wfLeg4','wfLeg5'];
const W = s => new RegExp(`(?<![\\p{L}])(?:${s})(?![\\p{L}])`,'iu');
const PROBE={
  es:{informal:W('tus|tu|te|contigo|vas a|tienes|tuyo'), formal:W('sus|su|usted|consigo')},
  fr:{informal:W('ton|ta|tes|tu|toi'),                   formal:W('votre|vos|vous')},
  de:{informal:W('dein|deine|du|dir|dich'),              formal:W('ihre|ihr|ihnen|sie')},
  it:{informal:W('tuo|tua|tuoi|tue|tu|ti|lavorerai|terrai'), formal:W('vostro|vostra|vostri|vostre|voi|lei')}
};
for (const l of LANGS){
  const d=JSON.parse(readFileSync(`locales/${l}.json`,'utf8'));
  const inf=[], form=[];
  for (const k of USED){
    const v=d[k]; if(!v) continue;
    if (PROBE[l].informal.test(v)) inf.push(k);
    if (PROBE[l].formal.test(v)) form.push(k);
  }
  const mixed = inf.length && form.length;
  console.log(`${l.toUpperCase()}  ${mixed?'MIXED REGISTER':'consistent'}`);
  if (inf.length)  console.log(`   informal: ${inf.join(', ')}`);
  if (form.length) console.log(`   formal:   ${form.join(', ')}`);
  if (mixed) for (const k of [...new Set([...inf,...form])]) console.log(`      ${k}: ${d[k].slice(0,88)}`);
}
console.log('\n=== locale payload fetched on every visit ===');
for (const l of ['en',...LANGS]){
  const all=JSON.parse(readFileSync(`locales/${l}.json`,'utf8'));
  const live=Object.fromEntries(USED.filter(k=>all[k]).map(k=>[k,all[k]]).concat([['meta',all.meta]]));
  const full=statSync(`locales/${l}.json`).size;
  const need=Buffer.byteLength(JSON.stringify(live));
  console.log(`  ${l}: ${(full/1024).toFixed(1)}kB shipped, ${(need/1024).toFixed(1)}kB actually used  (${Math.round(100-need/full*100)}% dead)`);
}
