// node scripts/run_v1.js W   -> results/v1_W{W}.json (per seed, per arm, per generation)
const V = require("../src/v1.js"), fs = require("fs");
const width = +(process.argv[2] || 12), G = 60, SEEDS = [1, 2, 3, 4, 5, 6], NOISE = 0.05;
const ARMS = ["alone", "facts", "laws_random", "laws_exc"];
const out = {width, G, SEEDS, NOISE, ARMS, runs: {}};
for (const seed of SEEDS) {
  const W = V.makeWorld(V.mulberry(100 + seed));
  out.runs[seed] = {};
  ARMS.forEach((arm, k) => {
    const L = new V.Lineage(arm, seed * 10 + k + 1);
    for (let g = 0; g < G; g++) L.generation(W, width, NOISE);
    out.runs[seed][arm] = L.hist;
  });
  console.error(`W=${width} seed ${seed} done`);
}
fs.writeFileSync(`${__dirname}/../results/v1_W${width}.json`, JSON.stringify(out));
