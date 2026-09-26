# Perintö

![pic](pic.png)

*Inheritance.* Generations of small learners pass pieces of their world model to their children
through a narrow channel. Can knowledge pile up beyond what one lifetime can find? Can a language
of **laws** carry a world that single facts cannot? Does a gene for trusting elders adapt to the culture?

Open [live Demo!](https://anttiluode.github.io/Perinto/docs/index.html) Every curve is computed in the
browser from `src/v1.js`, the same code as the measured runs.

**Status:** v0 works. Frozen v1 **failed all four predictions**. A post-hoc v1.1 on fresh worlds,
pre-registered before it ran, found that a language of laws works once children trust their elders.

## The world

8 layers × 8 places, 4 moves from each place: 256 rules. Food is worth layer² (0 at the surface,
49 at the bottom). 10% of steps slip back to the surface. A child explores for 120 steps in trips
of 12, trying untried moves and using its model to reach the nearest unknown. An adult makes 6 trips of
10 steps down its believed best path; fitness is how deep they end. Each child has one elder, chosen
by fitness, who speaks W sentences before the child explores.

In v1 the world has **laws**: in each layer one move leads down from 75% of places. The other 25% are
exceptions. A learner adopts a law after seeing the same move lead down from k places in a layer
(k is a gene). An elder can say a law in one sentence.

## v0: one rule per sentence

6 worlds, 60 generations, mean of the last 10 (`scripts/run_v0.js`):

| population | sentences | knowledge | fitness | trust gene |
|---|---:|---:|---:|---:|
| alone | 0 | 0.30 | 14.2 | 0.44 (drift) |
| teach anything | 40 | 0.34 | 15.6 | 0.58 |
| teach what I found late | 40 | 0.35 | 16.1 | 0.49 |
| teach anything | 100 | 0.45 | 20.1 | 0.81 |
| teach what I found late | 100 | 0.45 | 20.1 | 0.72 |

With a wide channel, knowledge ratchets past what a lifetime finds alone (6/6 worlds), and trust
rises only where there is something worth trusting. The channel is the ceiling: an adult knows
roughly what it heard plus what it found. Choosing what to teach made no difference.

## v1 (frozen): laws in a 12-sentence channel — every prediction failed

`PREDICTIONS.md` was committed before the v1 code. Result (`results/summary_v1.json`):

| gate | result |
|---|---|
| G0 laws matter (handed true laws 27.5 vs none 13.7; wrong laws 10.6) | pass |
| H1 laws + exceptions − facts ≥ +3.0 | **fail**: +0.46 |
| H2 ratchet ≥ +3.0 over generation 1 and over alone | **fail**: +0.53, +0.62 |
| H3 exceptions − random facts ≥ +1.5 | **fail**: −0.23 |
| H4 trust, laws − facts ≥ +0.10 | **fail**: +0.035 |

Laws barely spread (2.3 correct of 7 against 2.1 alone). Trust started at 0.2, and a
12-sentence culture was too thin to select it upward. So the culture never started, and trust was
never selected: gene and culture each waited for the other. In v0 a 100-sentence channel got past
that stall. Here it did not.

## Diagnostic and v1.1 (post-hoc): with trusting children, laws carry the world

A diagnostic with trust fixed at 1 (`scripts/diag_trust1.js`, seeds 1–6) showed laws working. It also
showed that sending exceptions hurt. `POSTHOC.md` was then committed, before v1.1's code or runs,
with **fresh worlds 7–12**
and one new arm: a listener who knows the heard facts were chosen as exceptions and counts only its
own observations as evidence about laws. Result (`results/summary_v11.json`), W = 12:

| population | gen 1 | gen 10 | gen 30 | gens 51–60 | true laws held |
|---|---:|---:|---:|---:|---:|
| alone | 13.2 | 12.8 | 13.2 | 13.4 | 2.2 |
| facts only | 12.8 | 14.4 | 13.7 | 13.8 | 2.0 |
| **laws + random facts** | 13.1 | 15.1 | 19.0 | **21.0** | 4.9 |
| laws + exceptions | 13.4 | 13.7 | 16.6 | 18.9 | 4.5 |
| laws + exceptions, aware listener | 13.4 | 14.7 | 18.4 | 20.3 | 4.8 |
| facts only, **40** sentences | 12.8 | 15.7 | 15.7 | 16.3 | 3.3 |

| prediction | result |
|---|---|
| Q1 laws + random − facts ≥ +3.0, ≥ 5/6 worlds | **pass**: +7.2, 6/6 |
| Q2 laws at 12 sentences ≥ facts at 40 | **pass**: 21.0 vs 16.3 |
| Q3 aware − unaware (exceptions) ≥ +1.5, ≥ 5/6 | **fail**: +1.3, 5/6 |
| Q4 aware exceptions − random facts ≥ +1.0, ≥ 5/6 | **fail**: −0.7, 3/6 |

What this shows:

- **A few laws carry a world.** Twelve sentences that include laws take adults deeper than forty
  single facts. The laws **accumulate over generations**: nobody alone learns more than 2 of the 7,
  and the population ends up holding about 5. Deep laws can only be discovered by learners who
  arrived deep because of shallower inherited laws. That is a ratchet made of concepts.
- **The culture needs trust, and trust needs the culture.** Starting from sceptical children, a thin
  channel never gets going (frozen v1). This bootstrap problem is the most interesting failure here.
- **Telling people where your law fails did not pay.** Children who counted curated exceptions as
  ordinary evidence rejected true laws. A listener who modelled why the speaker chose its words
  recovered most, but not all, of the loss. At 40 sentences it recovered none, so that explanation
  is partial.

## For the idea behind it

Antti's question: if people are sequence learners with inverse models, and we pass those models to
each other through language, what happens across generations? In this toy:
passing single facts helps only through a wide channel. Passing **compressed structure** helps
through a narrow one, and it ratchets. It works only if listeners trust. Listeners also need a
model of the speaker: without one, a curated message misleads.

## Ledger

- **Post-hoc:** v1.1 was designed after v1 failed. Fresh worlds were used, but it should be
  repeated with more seeds before anyone relies on it.
- **Fixed speaking policies.** The language does not evolve; only whether laws may be spoken. An
  evolving vocabulary (which regularities become words) is the obvious next version.
- **One kind of law** (a layer-wide down move), hand-coded induction, and an "aware" flag instead of
  a learned model of the speaker.
- **Tiny world**, 40 learners, 60 generations, 6 worlds per run.
- **Not new:** cumulative culture and the ratchet (Tomasello 1999; Tennie, Call & Tomasello 2009);
  iterated learning and compression in language (Kirby, Cornish & Smith 2008); gene–culture
  coevolution (Boyd & Richerson 1985); learning guiding evolution (Hinton & Nowlan 1987); loss
  when transmission shrinks (Henrich 2004); pedagogical sampling and inferring why a teacher chose
  an example (Shafto, Goodman & Griffiths 2014); cultural transmission in deep RL agents (Bhoopchand
  et al. 2023). What is specific here is the measured stall of gene–culture bootstrapping in a thin
  channel, the concept ratchet, and the harm from a curated curriculum.

## Run it

```
node --test test/v1.test.js       # 4 tests
node scripts/gate0.js             # G0
node scripts/run_v1.js 12 && node scripts/run_v1.js 40 && node scripts/summarize_v1.js
node scripts/diag_trust1.js 12    # post-hoc diagnostic
node scripts/run_v11.js 12 && node scripts/run_v11.js 40 && node scripts/summarize_v11.js
LY=8 W=100 node scripts/run_v0.js # v0 table rows (W=40 or 100)
node scripts/build_pages.js       # docs/index.html and docs/perinto.js
```

No dependencies beyond Node 18+. Each v1 run takes about two minutes.

## Layout

```
PREDICTIONS.md   v1 predictions (committed before v1 code)
POSTHOC.md       v1.1 predictions (committed after v1, before v1.1 code)
src/v0.js        v0 engine (one rule per sentence)
src/v1.js        v1 engine (laws, induction gene, aware listener); Node and browser
scripts/         runners, mechanical summarizers, page build
results/         raw runs and summaries
docs/            the live demo page
test/            unit tests
```
