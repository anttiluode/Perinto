const test = require("node:test"), assert = require("node:assert");
const V = require("../src/v1.js");
test("world has laws with about 25% exceptions and down moves lead one layer deeper", () => {
  let exc = 0, n = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const W = V.makeWorld(V.mulberry(seed));
    for (let s = 0; s < V.S - V.PER; s++) {
      n++; if (W.down[s] !== W.law[V.layerOf(s)]) exc++;
      assert.strictEqual(V.layerOf(W.T[s * V.A + W.down[s]]), V.layerOf(s) + 1);
      for (let a = 0; a < V.A; a++) if (a !== W.down[s]) assert.ok(V.layerOf(W.T[s * V.A + a]) <= V.layerOf(s));
    }
  }
  assert.ok(Math.abs(exc / n - 0.25) < 0.04, `exception rate ${exc / n}`);
});
test("a learner induces a law from k agreeing facts and not from fewer", () => {
  const ag = new V.Agent(1, 3);
  for (let s = 8; s < 10; s++) ag.see(s * V.A + 2, 16 + s);
  ag.induce(); assert.strictEqual(ag.law[1], -1);
  ag.see(10 * V.A + 2, 20); ag.induce(); assert.strictEqual(ag.law[1], 2);
});
test("an untrusting child hears nothing; a trusting child hears everything", () => {
  const r = V.mulberry(3), a0 = new V.Agent(0, 4), a1 = new V.Agent(1, 4);
  a0.hearLaw(2, 1, r); a0.hearFact(5, 9, r); a1.hearLaw(2, 1, r); a1.hearFact(5, 9, r);
  assert.strictEqual(a0.law[2], -1); assert.strictEqual(a0.B[5], -1);
  assert.strictEqual(a1.law[2], 1); assert.strictEqual(a1.B[5], 9);
});
test("ALONE never hears anything and runs deterministically", () => {
  const W = V.makeWorld(V.mulberry(101));
  const a = new V.Lineage("alone", 11).generation(W, 12, 0.05), b = new V.Lineage("alone", 11).generation(W, 12, 0.05);
  assert.deepStrictEqual(a, b); assert.strictEqual(a.lawShare, 0);
});
