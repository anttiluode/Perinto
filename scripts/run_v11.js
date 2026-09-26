// v1.1 post-hoc (POSTHOC.md): trust fixed at 1, fresh seeds 7-12, five arms.
const V = require("../src/v1.js"), fs = require("fs");
V.P.T0 = 1; V.P.MUT = 0;
const width = +(process.argv[2] || 12), G = 60, SEEDS = [7, 8, 9, 10, 11, 12], NOISE = 0.05;
const ARMS = ["alone", "facts", "laws_random", "laws_exc", "laws_exc_aware"];
const out = {width, G, SEEDS, NOISE, ARMS, trust: 1, runs: {}};
for (const seed of SEEDS) {
  const W = V.makeWorld(V.mulberry(100 + seed)); out.runs[seed] = {};
  ARMS.forEach((arm, k) => { const L = new V.Lineage(arm, seed * 10 + k + 1); for (let g = 0; g < G; g++) L.generation(W, width, NOISE); out.runs[seed][arm] = L.hist; });
}
fs.writeFileSync(`${__dirname}/../results/v11_W${width}.json`, JSON.stringify(out));
