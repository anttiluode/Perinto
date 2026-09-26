// POST-HOC DIAGNOSTIC (after the frozen v1 result): trust fixed at 1, no trust mutation. Not a gate.
const V = require("../src/v1.js"), fs = require("fs");
V.P.T0 = 1; V.P.MUT = 0;
const width = +(process.argv[2] || 12), G = 60, SEEDS = [1, 2, 3, 4, 5, 6];
const ARMS = ["alone", "facts", "laws_random", "laws_exc"], out = {};
for (const arm of ARMS) out[arm] = [];
for (const seed of SEEDS) {
  const W = V.makeWorld(V.mulberry(100 + seed));
  ARMS.forEach((arm, k) => { const L = new V.Lineage(arm, seed * 10 + k + 1); for (let g = 0; g < G; g++) L.generation(W, width, 0.05); out[arm].push(L.hist); });
}
const tail = (h, key) => h.slice(50, 60).reduce((x, o) => x + o[key], 0) / 10;
const res = {};
for (const arm of ARMS) {
  const m = key => out[arm].reduce((x, h) => x + tail(h, key), 0) / SEEDS.length;
  res[arm] = {fitGen1: out[arm].reduce((x, h) => x + h[0].fit, 0) / SEEDS.length, fit: m("fit"), downKnow: m("downKnow"), lawsOk: m("lawsOk"), k: m("k"),
    perSeedFit: out[arm].map(h => +tail(h, "fit").toFixed(2)), g10: out[arm].reduce((x, h) => x + h[9].fit, 0) / SEEDS.length, g30: out[arm].reduce((x, h) => x + h[29].fit, 0) / SEEDS.length};
}
fs.writeFileSync(`${__dirname}/../results/diag_trust1_W${width}.json`, JSON.stringify(res, null, 1));
for (const [a, o] of Object.entries(res)) console.log(width, a.padEnd(12), `fit g1 ${o.fitGen1.toFixed(1)} g10 ${o.g10.toFixed(1)} g30 ${o.g30.toFixed(1)} g51-60 ${o.fit.toFixed(1)}  down ${o.downKnow.toFixed(2)} lawsOk ${o.lawsOk.toFixed(2)} k ${o.k.toFixed(1)}  seeds ${o.perSeedFit.join(" ")}`);
