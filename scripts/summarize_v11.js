const fs = require("fs");
const load = w => JSON.parse(fs.readFileSync(`${__dirname}/../results/v11_W${w}.json`));
const tail = (h, key) => h.slice(50, 60).reduce((x, o) => x + o[key], 0) / 10;
const mean = xs => xs.reduce((x, y) => x + y, 0) / xs.length, pos = xs => xs.filter(x => x > 0).length;
const d12 = load(12), d40 = load(40), res = {};
for (const [name, d] of [["W12", d12], ["W40", d40]]) {
  res[name] = {};
  for (const arm of d.ARMS) {
    const per = d.SEEDS.map(s => d.runs[s][arm]);
    res[name][arm] = {fitGen1: mean(per.map(h => h[0].fit)), fitGen10: mean(per.map(h => h[9].fit)), fitGen30: mean(per.map(h => h[29].fit)),
      fit: mean(per.map(h => tail(h, "fit"))), downKnow: mean(per.map(h => tail(h, "downKnow"))), lawsOk: mean(per.map(h => tail(h, "lawsOk"))), k: mean(per.map(h => tail(h, "k")))};
  }
}
const diff = (a, b) => d12.SEEDS.map(s => tail(d12.runs[s][a], "fit") - tail(d12.runs[s][b], "fit"));
const q1 = diff("laws_random", "facts"), q3 = diff("laws_exc_aware", "laws_exc"), q4 = diff("laws_exc_aware", "laws_random");
res.gates = {
  Q1: {mean: mean(q1), pos: pos(q1), pass: mean(q1) >= 3 && pos(q1) >= 5},
  Q2: {lawsRandomW12: res.W12.laws_random.fit, factsW40: res.W40.facts.fit, pass: res.W12.laws_random.fit >= res.W40.facts.fit},
  Q3: {mean: mean(q3), pos: pos(q3), perSeed: q3, pass: mean(q3) >= 1.5 && pos(q3) >= 5},
  Q4: {mean: mean(q4), pos: pos(q4), perSeed: q4, pass: mean(q4) >= 1.0 && pos(q4) >= 5},
};
fs.writeFileSync(`${__dirname}/../results/summary_v11.json`, JSON.stringify(res, null, 1));
const f = x => x.toFixed(2);
for (const w of ["W12", "W40"]) { console.log(`\n${w} arm             fit g1 → g10 → g30 → 51-60   downKnow lawsOk  k`);
  for (const [a, o] of Object.entries(res[w])) console.log(`    ${a.padEnd(15)} ${f(o.fitGen1)} → ${f(o.fitGen10)} → ${f(o.fitGen30)} → ${f(o.fit)}   ${f(o.downKnow)}   ${f(o.lawsOk)}  ${f(o.k)}`); }
console.log("\n" + Object.entries(res.gates).map(([g, o]) => `${g} ${o.pass ? "PASS" : "FAIL"} ${JSON.stringify(o, (k, v) => typeof v === "number" ? +v.toFixed(3) : v)}`).join("\n"));
