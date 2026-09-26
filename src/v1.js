// Perintö v1: generations of learners pass facts and laws about a layered world down a narrow channel.
// Runs in Node (require) and in the browser (window.Perinto). Rules follow PREDICTIONS.md.
(function (root) {
"use strict";
const LAYERS = 8, PER = 8, A = 4, S = LAYERS * PER, NE = S * A;
const VALUE = Array.from({length: LAYERS}, (_, L) => L * L);
const P = {E: 120, R: 12, SLIP: 0.1, H: 10, N: 40, MUT: 0.08, T0: 0.2, K0: 4, KMIN: 2, KMAX: 8, KMUT: 0.2, EXC: 0.25};
const layerOf = s => (s / PER) | 0;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const ri = (r, n) => Math.floor(r() * n);
const inLayer = (r, L) => L * PER + ri(r, PER);

// ---------- world ----------
function makeWorld(r, exc = P.EXC) {
  const T = new Int16Array(NE), law = new Int8Array(LAYERS), down = new Int8Array(S);
  for (let L = 0; L < LAYERS; L++) law[L] = ri(r, A);
  for (let s = 0; s < S; s++) {
    const L = layerOf(s);
    let d = law[L];
    if (r() < exc) { d = ri(r, A - 1); if (d >= law[L]) d++; }   // exception: a different down move
    down[s] = d;
    for (let a = 0; a < A; a++) {
      if (a === d) T[s * A + a] = inLayer(r, Math.min(L + 1, LAYERS - 1));
      else T[s * A + a] = inLayer(r, r() < 0.7 ? L : Math.max(L - 1, 0));
    }
  }
  return {T, law, down};
}
function shiftWorld(W, r, frac) {   // re-draw a fraction of places, laws included for re-drawn layers
  const f = makeWorld(r);
  for (let L = 0; L < LAYERS; L++) if (r() < frac) {
    W.law[L] = f.law[L];
    for (let s = L * PER; s < (L + 1) * PER; s++) { W.down[s] = f.down[s]; for (let a = 0; a < A; a++) W.T[s * A + a] = f.T[s * A + a]; }
  }
}

// ---------- learner ----------
class Agent {
  constructor(trust, k) {
    this.trust = trust; this.k = k;
    this.cnt = new Float32Array(NE * S); this.tot = new Float32Array(NE);
    this.B = new Int16Array(NE).fill(-1); this.self = new Uint16Array(NE);
    this.heard = new Uint8Array(NE);
    this.law = new Int8Array(LAYERS).fill(-1); this.lawSrc = new Int8Array(LAYERS); // 1 heard, 2 induced
    this.selfOnly = false; // v1.1: only own observations count as evidence about laws
  }
  upd(i) { const o = i * S; let b = -1, bv = 0; for (let k = 0; k < S; k++) { const v = this.cnt[o + k]; if (v > bv) { bv = v; b = k; } } this.B[i] = b; }
  hearFact(i, s2, r) { if (r() >= this.trust) return; this.cnt[i * S + s2] += 0.9; this.tot[i] += 0.9; this.heard[i] = 1; this.upd(i); }
  hearLaw(L, a, r) { if (r() >= this.trust) return; this.law[L] = a; this.lawSrc[L] = 1; }
  see(i, s2) { this.cnt[i * S + s2] += 1; this.tot[i] += 1; this.self[i]++; this.upd(i); }
  open(i) { return this.self[i] === 0 && this.tot[i] < 0.5; }
  deeper(s, a) { const b = this.B[s * A + a]; return b >= 0 && layerOf(b) > layerOf(s); }
  ev(i) { return !this.selfOnly || this.self[i] > 0; }
  induce() {
    for (let L = 0; L < LAYERS - 1; L++) {
      const c = [0, 0, 0, 0];
      for (let s = L * PER; s < (L + 1) * PER; s++) for (let a = 0; a < A; a++) if (this.ev(s * A + a) && this.deeper(s, a)) c[a]++;
      let top = 0; for (let a = 1; a < A; a++) if (c[a] > c[top]) top = a;
      let second = 0; for (let a = 0; a < A; a++) if (a !== top && c[a] > second) second = c[a];
      if (c[top] >= this.k && c[top] >= 2 * second) { this.law[L] = top; this.lawSrc[L] = 2; continue; }
      if (this.law[L] >= 0 && this.lawSrc[L] === 1) {        // test a heard law against own facts
        const a = this.law[L]; let sup = 0, con = 0;
        for (let s = L * PER; s < (L + 1) * PER; s++) { const b = this.B[s * A + a]; if (b >= 0 && this.ev(s * A + a)) (layerOf(b) > L ? sup++ : con++); }
        if (con >= this.k && con > sup) { this.law[L] = -1; this.lawSrc[L] = 0; }
      }
    }
  }
}
const step = (T, s, a, r) => r() < P.SLIP ? inLayer(r, 0) : T[s * A + a];

const prev = new Int16Array(S), act = new Int8Array(S), dep = new Int8Array(S), q = new Int16Array(S);
function bfs(B, s0, goal, maxD) {
  prev.fill(-2); let head = 0, tail = 0; q[tail++] = s0; prev[s0] = -1; dep[s0] = 0;
  while (head < tail) {
    const s = q[head++];
    if (s !== s0 && goal(s)) { let c = s; while (prev[c] !== s0) c = prev[c]; return act[c]; }
    if (dep[s] >= maxD) continue;
    for (let a = 0; a < A; a++) { const n = B[s * A + a]; if (n >= 0 && prev[n] === -2) { prev[n] = s; act[n] = a; dep[n] = dep[s] + 1; q[tail++] = n; } }
  }
  return -1;
}

function childhood(ag, T, r) {
  let s = inLayer(r, 0);
  const hasOpen = x => { for (let a = 0; a < A; a++) if (ag.open(x * A + a)) return true; return false; };
  const here = [];
  for (let t = 0; t < P.E; t++) {
    if (t % P.R === 0) { if (t > 0) ag.induce(); s = inLayer(r, 0); }
    const L = layerOf(s), lw = ag.law[L];
    here.length = 0;
    for (let k = 0; k < A; k++) if (ag.open(s * A + k)) here.push(k);
    let a;
    if (here.length) a = (lw >= 0 && here.includes(lw) && r() < 0.5) ? lw : here[ri(r, here.length)];
    else {
      a = bfs(ag.B, s, hasOpen, 12);
      if (a < 0) a = lw >= 0 ? lw : ri(r, A);
    }
    const s2 = step(T, s, a, r); ag.see(s * A + a, s2); s = s2;
  }
  ag.induce();
}

function chooseDown(ag, s, r) {
  const L = layerOf(s);
  for (let a = 0; a < A; a++) if (ag.deeper(s, a)) return a;             // a known fact leads down
  const lw = ag.law[L];
  if (lw >= 0 && ag.B[s * A + lw] < 0) return lw;                         // the law, where no fact says otherwise
  const a = bfs(ag.B, s, x => layerOf(x) > L, P.H);                       // a known path down
  return a >= 0 ? a : ri(r, A);
}

function adulthood(ag, W, r) {
  let fit = 0;
  for (let k = 0; k < 6; k++) {
    let s = inLayer(r, 0);
    for (let h = 0; h < P.H; h++) { if (layerOf(s) === LAYERS - 1) break; s = step(W.T, s, chooseDown(ag, s, r), r); }
    fit += VALUE[layerOf(s)];
  }
  ag.fit = fit / 6;
  let ok = 0; for (let i = 0; i < NE; i++) if (ag.B[i] === W.T[i]) ok++;
  ag.know = ok / NE;
  let dk = 0, deepest = -1, lawsOk = 0;
  for (let s = 0; s < S - PER; s++) {          // places that have a down move (not the bottom layer)
    let pred = -1; for (let a = 0; a < A; a++) if (ag.deeper(s, a)) { pred = a; break; }
    if (pred < 0) pred = ag.law[layerOf(s)];
    if (pred === W.down[s]) dk++;
  }
  for (let L = 0; L < LAYERS - 1; L++) if (ag.law[L] === W.law[L]) { lawsOk++; deepest = L; }
  ag.downKnow = dk / (S - PER); ag.lawsOk = lawsOk; ag.deepestLaw = deepest;
}

function pick(adults, r) {
  let tot = 0; for (const a of adults) tot += a.fit + 0.2;
  let x = r() * tot; for (const a of adults) { x -= a.fit + 0.2; if (x <= 0) return a; }
  return adults[adults.length - 1];
}

function shuffle(xs, r) { for (let k = xs.length - 1; k > 0; k--) { const j = ri(r, k + 1); const t = xs[k]; xs[k] = xs[j]; xs[j] = t; } return xs; }

// what an elder says; returns number of law sentences used
function teach(parent, child, mode, W, noise, r) {
  let used = 0, lawsSaid = 0;
  const exc = mode === "laws_exc" || mode === "laws_exc_aware";
  if (mode === "laws_random" || exc) {
    for (let L = 0; L < LAYERS - 1 && used < W; L++) if (parent.law[L] >= 0) {
      child.hearLaw(L, r() < noise ? ri(r, A) : parent.law[L], r); used++; lawsSaid++;
    }
  }
  const known = [];
  for (let i = 0; i < NE; i++) if (parent.B[i] >= 0) known.push(i);
  shuffle(known, r);
  let order = known;
  if (exc) {
    const isExc = i => {
      const s = (i / A) | 0, a = i % A, L = layerOf(s), lw = parent.law[L];
      if (lw < 0 || L === LAYERS - 1) return false;
      const deep = layerOf(parent.B[i]) > L;
      return (deep && a !== lw) || (!deep && a === lw);
    };
    order = known.filter(isExc).concat(known.filter(i => !isExc(i)));
  }
  for (let k = 0; k < order.length && used < W; k++, used++) {
    const i = order[k]; child.hearFact(i, r() < noise ? ri(r, S) : parent.B[i], r);
  }
  return lawsSaid;
}

class Lineage {
  constructor(mode, seed) { this.mode = mode; this.r = mulberry(seed); this.adults = null; this.hist = []; }
  generation(W, width, noise) {
    const r = this.r, kids = []; let lawsSaid = 0;
    for (let n = 0; n < P.N; n++) {
      let trust = P.T0, k = P.K0;
      if (this.adults) {
        const g = pick(this.adults, r);
        trust = Math.max(0, Math.min(1, g.trust + (r() - 0.5) * 2 * P.MUT));
        k = g.k; if (r() < P.KMUT) k = Math.max(P.KMIN, Math.min(P.KMAX, k + (r() < 0.5 ? -1 : 1)));
      }
      const c = new Agent(trust, k);
      c.selfOnly = this.mode === "laws_exc_aware";
      if (this.adults && this.mode !== "alone" && width > 0) lawsSaid += teach(pick(this.adults, r), c, this.mode, width, noise, r);
      childhood(c, W.T, r); adulthood(c, W, r); kids.push(c);
    }
    this.adults = kids;
    const m = f => kids.reduce((x, kk) => x + f(kk), 0) / kids.length;
    const o = {fit: m(a => a.fit), know: m(a => a.know), downKnow: m(a => a.downKnow), trust: m(a => a.trust),
      k: m(a => a.k), lawsOk: m(a => a.lawsOk), deepestLaw: m(a => a.deepestLaw), lawShare: width > 0 ? lawsSaid / (P.N * width) : 0};
    this.hist.push(o);
    return o;
  }
  best() { return this.adults.reduce((b, a) => (a.fit > b.fit || (a.fit === b.fit && a.downKnow > b.downKnow)) ? a : b); }
}

// G0: one generation, no culture, learners handed true laws, none, or wrong laws
function gate0(seed) {
  const W = makeWorld(mulberry(100 + seed)), out = {};
  for (const cond of ["none", "true", "wrong"]) {
    const r = mulberry(seed * 1000 + 7); let fit = 0;
    for (let n = 0; n < P.N; n++) {
      const ag = new Agent(1, P.K0);
      if (cond !== "none") for (let L = 0; L < LAYERS - 1; L++) {
        let a = W.law[L]; if (cond === "wrong") { a = ri(r, A - 1); if (a >= W.law[L]) a++; }
        ag.law[L] = a; ag.lawSrc[L] = 1;
      }
      childhood(ag, W.T, r); adulthood(ag, W, r); fit += ag.fit;
    }
    out[cond] = fit / P.N;
  }
  return out;
}

const api = {LAYERS, PER, A, S, NE, P, layerOf, mulberry, makeWorld, shiftWorld, Agent, Lineage, gate0};
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Perinto = api;
})(typeof window !== "undefined" ? window : globalThis);
