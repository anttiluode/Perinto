// Perimä core: generations of learners pass pieces of their world model down a narrow channel.
let LAYERS = +(process.env.LY||8), PER = 8, A = 4, S = LAYERS*PER;
const layerOf = s => Math.floor(s / PER);
const VALUE = Array.from({length:LAYERS},(_, L)=>L*L);

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const ri = (r, n) => Math.floor(r() * n);
const inLayer = (r, L) => L * PER + ri(r, PER);

function makeWorld(r) {
  const T = new Int16Array(S * A);
  for (let s = 0; s < S; s++) {
    const L = layerOf(s), up = ri(r, A);
    for (let a = 0; a < A; a++) {
      if (a === up) T[s * A + a] = inLayer(r, Math.min(L + 1, LAYERS - 1));
      else T[s * A + a] = inLayer(r, r() < 0.7 ? L : Math.max(L - 1, 0));
    }
  }
  return T;
}
function shiftWorld(T, r, frac) {
  const fresh = makeWorld(r);
  for (let i = 0; i < S * A; i++) if (r() < frac) T[i] = fresh[i];
}

const P = { E: +(process.env.E||120), R: +(process.env.R||12), SLIP: 0.1, H: +(process.env.H||10), N: 40, W: +(process.env.W||100), NOISE: 0.05, MUT: 0.08 };

class Agent {
  constructor(trust) {
    this.trust = trust;
    this.cnt = new Float32Array(S * A * S);
    this.tot = new Float32Array(S * A);
    this.self = new Uint16Array(S * A);
    this.hard = new Float32Array(S * A).fill(-1); // time the entry was first self-observed (-1 never)
    this.told = new Uint8Array(S * A);
  }
  belief(i) {
    if (this.tot[i] <= 0) return -1;
    let b = -1, bv = 0; const o = i * S;
    for (let k = 0; k < S; k++) if (this.cnt[o + k] > bv) { bv = this.cnt[o + k]; b = k; }
    return b;
  }
  hear(i, s2, r) { if (r() >= this.trust) return; this.cnt[i * S + s2] += 0.9; this.tot[i] += 0.9; this.told[i] = 1; }
  see(i, s2, t) {
    this.cnt[i * S + s2] += 1; this.tot[i] += 1;
    if (this.self[i] === 0) this.hard[i] = t;
    this.self[i]++;
  }
  beliefs() { const B = new Int16Array(S * A); for (let i = 0; i < S * A; i++) B[i] = this.belief(i); return B; }
}

function step(T, s, a, r) { return r() < P.SLIP ? inLayer(r, 0) : T[s * A + a]; }

function bfsFirstAction(B, s0, goal, maxD) {
  // returns [firstAction, target] for nearest state satisfying goal, or null
  const prev = new Int16Array(S).fill(-2), act = new Int8Array(S).fill(-1);
  const q = [s0]; prev[s0] = -1; let depth = new Int8Array(S); depth[s0] = 0;
  for (let h = 0; h < q.length; h++) {
    const s = q[h];
    if (s !== s0 && goal(s)) { let c = s; while (prev[c] !== s0 && prev[c] !== -1) c = prev[c]; return [act[c], s]; }
    if (depth[s] >= maxD) continue;
    for (let a = 0; a < A; a++) {
      const n = B[s * A + a];
      if (n >= 0 && prev[n] === -2) { prev[n] = s; act[n] = a; depth[n] = depth[s] + 1; q.push(n); }
    }
  }
  return null;
}

function childhood(ag, T, r) {
  let s = inLayer(r, 0);
  for (let t = 0; t < P.E; t++) {
    if (t % P.R === 0) s = inLayer(r, 0);
    const untried = s2 => { for (let a = 0; a < A; a++) { const i = s2 * A + a; if (ag.self[i] === 0 && ag.tot[i] < 0.5) return true; } return false; };
    let a;
    const here = [];
    for (let k = 0; k < A; k++) { const i = s * A + k; if (ag.self[i] === 0 && ag.tot[i] < 0.5) here.push(k); }
    if (here.length) a = here[ri(r, here.length)];
    else {
      const B = ag.beliefs();
      const p = bfsFirstAction(B, s, untried, 12);
      a = p ? p[0] : ri(r, A);
    }
    const s2 = step(T, s, a, r);
    ag.see(s * A + a, s2, t);
    s = s2;
  }
}

function adulthood(ag, T, r) {
  const B = ag.beliefs();
  let fit = 0;
  for (let k = 0; k < 6; k++) {
    let s = inLayer(r, 0);
    for (let h = 0; h < P.H; h++) {
      if (layerOf(s) === LAYERS - 1) break;
      const L = layerOf(s);
      const p = bfsFirstAction(B, s, s2 => layerOf(s2) > L, P.H);
      const a = p ? p[0] : ri(r, A);
      s = step(T, s, a, r);
    }
    fit += VALUE[layerOf(s)];
  }
  ag.fit = fit / 6;
  let ok = 0; const byL = new Array(LAYERS).fill(0);
  for (let i = 0; i < S * A; i++) if (B[i] === T[i]) { ok++; byL[layerOf(Math.floor(i / A))]++; }
  ag.know = ok / (S * A); ag.knowL = byL.map(x => x / (PER * A));
  ag.B = B;
}

function pick(adults, r) {
  let tot = 0; for (const a of adults) tot += a.fit + 0.2;
  let x = r() * tot; for (const a of adults) { x -= a.fit + 0.2; if (x <= 0) return a; }
  return adults[adults.length - 1];
}

function teach(parent, child, mode, W, r) {
  const known = [];
  for (let i = 0; i < S * A; i++) if (parent.B[i] >= 0) known.push(i);
  if (mode === "random") {
    for (let k = known.length - 1; k > 0; k--) { const j = ri(r, k + 1); [known[k], known[j]] = [known[j], known[k]]; }
  } else { // residue: what the parent itself did not find early -> what a learner like me would miss
    const key = i => (parent.hard[i] < 0 ? 1e9 : parent.hard[i]) + r() * 0.01;
    known.sort((x, y) => key(y) - key(x));
  }
  for (let k = 0; k < Math.min(W, known.length); k++) {
    const i = known[k];
    const s2 = r() < P.NOISE ? ri(r, S) : parent.B[i];
    child.hear(i, s2, r);
  }
}

class Lineage {
  constructor(mode, seed) { this.mode = mode; this.r = mulberry(seed); this.adults = null; this.gen = 0; }
  generation(T, W) {
    const r = this.r, kids = [];
    for (let n = 0; n < P.N; n++) {
      let trust = +(process.env.T0||0.2);
      if (this.adults) trust = Math.max(0, Math.min(1, pick(this.adults, r).trust + (r() - 0.5) * 2 * P.MUT));
      const c = new Agent(trust);
      if (this.adults && this.mode !== "alone" && W > 0) teach(pick(this.adults, r), c, this.mode, W, r);
      childhood(c, T, r); adulthood(c, T, r); kids.push(c);
    }
    this.adults = kids; this.gen++;
    const m = f => kids.reduce((x, k) => x + f(k), 0) / kids.length;
    return { know: m(k => k.know), fit: m(k => k.fit), trust: m(k => k.trust),
             knowL: [...Array(LAYERS).keys()].map(L => m(k => k.knowL[L])) };
  }
}

if (typeof module !== "undefined") module.exports = { makeWorld, shiftWorld, Lineage, P, mulberry };
