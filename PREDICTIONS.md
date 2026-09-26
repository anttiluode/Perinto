# Perintö v1 predictions: can a language of laws carry a world through a narrow channel?

Written and committed before the v1 engine exists and before any v1 run.

## Background (v0, already measured)

In v0 each sentence an elder speaks carries one rule, "from place s, move a leads to place s'".
Six worlds, 60 generations: with 100 sentences per child, adults know 0.45 of the 256 rules
against 0.30 for learners alone, and a trust gene rises (0.72–0.81 against 0.44 drift). With 40
sentences, culture adds little (0.34–0.35). Teaching "what I found late" did not beat teaching
anything. The channel was the ceiling.

## The v1 world

Same shape as v0: 8 layers × 8 places × 4 moves, food worth layer², 10% slips to the surface.
One change: the world has **laws**. In each layer one move leads down from most places (75%).
The other 25% of places are **exceptions** whose down move is a different one. The non-down
moves stay in the layer (70%) or climb one layer (30%), as in v0.

## The learners

As in v0, plus one ability: **law induction**. After each 12-step trip, for each layer, a learner
counts places where it believes a move leads down. If one move leads down from at least **k** places
and from at least twice as many as any other move, it adopts "in layer L, move a goes down".
k is a gene (start 4, range 2–8, mutates ±1 with probability 0.2). A heard law is dropped if the
learner's own facts contradict it at least k times and more often than they support it.

Laws steer behaviour: when no known fact leads deeper, a learner follows its law for the layer.
Every population has the same learners. Only what the elders may say differs.

## Arms (what an elder may say, W sentences per child)

| arm | sentences |
|---|---|
| ALONE | none |
| FACTS | W single rules, chosen at random (v0) |
| LAWS_RANDOM | the elder's laws first (one sentence each), then random rules |
| LAWS_EXC | the elder's laws first, then **exceptions**: rules where the elder's own law is wrong (a down move the law does not predict, or the law's move not going down there), then random rules |

A law costs one sentence, the same as a rule. Copying errors: 5% (a corrupted law names a random move).
Primary channel W = 12. Secondary W = 40 (exploratory).

## Protocol

Worlds seeded 100+seed, seeds 1–6. 40 learners per generation, 60 generations. Scores are means
over generations 51–60 unless stated. Fitness = mean layer² reached on 6 adult trips of 10 steps.

## Gates

- **G0 setup (one generation, no culture):** learners handed the true laws (all layers, trust 1)
  beat learners with none by ≥ +5 fitness; learners handed wrong laws score below learners with none.
  If G0 fails, laws do not matter in this world and nothing below is interpreted.
- **H1 compression:** at W = 12, LAWS_EXC − FACTS ≥ +3.0 fitness, positive in ≥ 5/6 seeds.
- **H2 ratchet, not instant:** at W = 12, LAWS_EXC gens 51–60 minus LAWS_EXC gen 1 ≥ +3.0
  (≥ 5/6 seeds), and LAWS_EXC − ALONE ≥ +3.0.
- **H3 residue:** at W = 12, LAWS_EXC − LAWS_RANDOM ≥ +1.5 fitness, positive in ≥ 5/6 seeds.
  (In v0 the residue idea failed. Here the residue is well defined: where my own law is wrong.)
- **H4 trust gene:** at W = 12, mean trust LAWS_EXC − FACTS ≥ +0.10, positive in ≥ 5/6 seeds.

Exploratory, no prediction: the induction gene k by arm; the deepest layer with a correct law;
all W = 40 results.

## Ledger, written in advance

- Speaking policies are fixed by arm. The language itself does not evolve in v1; only whether
  laws exist in the channel. An evolving vocabulary is a later version.
- One kind of law (a layer-wide down move). Real concepts are richer.
- H1 is partly built in: one law sentence covers about 6 places. The non-trivial parts are H2
  (someone must first discover deep laws, which no lifetime alone can), H3 and H4.
- Tiny world, 6 seeds.
