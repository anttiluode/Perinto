const {makeWorld, Lineage, P, mulberry} = require('../src/v0.js');
const G=60, seeds=[1,2,3,4,5,6];
const acc={alone:[],random:[],residue:[]};
for (const seed of seeds){
  const T=makeWorld(mulberry(100+seed));
  const L={alone:new Lineage('alone',seed*10+1),random:new Lineage('random',seed*10+2),residue:new Lineage('residue',seed*10+3)};
  const last={alone:[],random:[],residue:[]};
  for(let g=0;g<G;g++) for(const k in L){const o=L[k].generation(T,P.W); if(g>=G-10) last[k].push(o);}
  for(const k in L){const m=f=>last[k].reduce((x,o)=>x+f(o),0)/last[k].length; acc[k].push([m(o=>o.know),m(o=>o.fit),m(o=>o.trust)]);}
}
for(const k in acc){const a=acc[k]; const mean=j=>(a.reduce((x,r)=>x+r[j],0)/a.length).toFixed(3);
  console.log(k.padEnd(8),'know',mean(0),'fit',mean(1),'trust',mean(2),' per-seed know',a.map(r=>r[0].toFixed(2)).join(' '));}
