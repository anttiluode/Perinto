// Mechanical gate check from PREDICTIONS.md. Written before the main run.
const fs = require("fs");
const load = w => JSON.parse(fs.readFileSync(`${__dirname}/../results/v1_W${w}.json`));
const tail = (h, key) => h.slice(50, 60).reduce((x, o) => x + o[key], 0) / 10;
function table(d) {
  const t = {};
  for (const arm of d.ARMS) {
    const per = d.SEEDS.map(s => d.runs[s][arm]);
    const m = key => per.reduce((x, h) => x + tail(h, key), 0) / per.length;
    t[arm] = {fit: m("fit"), downKnow: m("downKnow"), know: m("know"), trust: m("trust"), k: m("k"),
      lawsOk: m("lawsOk"), deepestLaw: m("deepestLaw"), lawShare: m("lawShare"), fitGen1: per.reduce((x, h) => x + h[0].fit, 0) / per.length};
  }
  return t;
}
function diff(d, a, b, key) { return d.SEEDS.map(s => tail(d.runs[s][a], key) - tail(d.runs[s][b], key)); }
const mean = xs => xs.reduce((x, y) => x + y, 0) / xs.length, pos = xs => xs.filter(x => x > 0).length;
const d12 = load(12), res = {W12: table(d12)};
const h1 = diff(d12, "laws_exc", "facts", "fit");
const h2a = d12.SEEDS.map(s => tail(d12.runs[s].laws_exc, "fit") - d12.runs[s].laws_exc[0].fit);
const h2b = diff(d12, "laws_exc", "alone", "fit");
const h3 = diff(d12, "laws_exc", "laws_random", "fit");
const h4 = diff(d12, "laws_exc", "facts", "trust");
res.gates = {
  H1: {mean: mean(h1), pos: pos(h1), pass: mean(h1) >= 3 && pos(h1) >= 5},
  H2: {vsGen1: mean(h2a), posGen1: pos(h2a), vsAlone: mean(h2b), pass: mean(h2a) >= 3 && pos(h2a) >= 5 && mean(h2b) >= 3},
  H3: {mean: mean(h3), pos: pos(h3), perSeed: h3, pass: mean(h3) >= 1.5 && pos(h3) >= 5},
  H4: {mean: mean(h4), pos: pos(h4), pass: mean(h4) >= 0.10 && pos(h4) >= 5},
};
if (fs.existsSync(`${__dirname}/../results/v1_W40.json`)) res.W40 = table(load(40));
fs.writeFileSync(`${__dirname}/../results/summary_v1.json`, JSON.stringify(res, null, 1));
const f = x => x.toFixed(2);
for (const w of ["W12", "W40"]) if (res[w]) {
  console.log(`\n${w}  arm          fit(gen1→51-60)  downKnow  know  trust   k   lawsOk  lawShare`);
  for (const [arm, o] of Object.entries(res[w])) console.log(`     ${arm.padEnd(12)} ${f(o.fitGen1)} → ${f(o.fit)}   ${f(o.downKnow)}    ${f(o.know)}  ${f(o.trust)}  ${f(o.k)}  ${f(o.lawsOk)}   ${f(o.lawShare)}`);
}
console.log("\n" + Object.entries(res.gates).map(([g, o]) => `${g} ${o.pass ? "PASS" : "FAIL"} ${JSON.stringify(o, (k, v) => typeof v === "number" ? +v.toFixed(3) : v)}`).join("\n"));
