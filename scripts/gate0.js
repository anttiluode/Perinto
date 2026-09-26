const V = require("../src/v1.js"), fs = require("fs");
const rows = [1, 2, 3, 4, 5, 6].map(seed => ({seed, ...V.gate0(seed)}));
const m = k => rows.reduce((x, r) => x + r[k], 0) / rows.length;
const res = {rows, mean: {none: m("none"), true: m("true"), wrong: m("wrong")}};
res.pass = res.mean.true - res.mean.none >= 5 && res.mean.wrong < res.mean.none;
fs.writeFileSync(__dirname + "/../results/gate0.json", JSON.stringify(res, null, 1));
console.log(JSON.stringify(res.mean), "G0", res.pass ? "PASS" : "FAIL");
rows.forEach(r => console.log(r.seed, r.none.toFixed(2), r.true.toFixed(2), r.wrong.toFixed(2)));
