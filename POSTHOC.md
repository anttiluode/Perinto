# Perintö v1.1 (post-hoc): a listener that models why the speaker chose its words

Written after the frozen v1 result and after one diagnostic, committed before v1.1 code or runs.

## What happened

Frozen v1 (`results/summary_v1.json`): H1–H4 all fail. Laws barely spread (2.3 correct laws of 7
in the law arms, 2.1 alone). The trust gene stayed low (0.31–0.50) at W = 12.

Diagnostic (`scripts/diag_trust1.js`, trust fixed at 1, seeds 1–6, labelled post-hoc): at W = 12,
laws + random facts reach 20.9 fitness against 14.8 for facts, positive in 6/6 seeds, and climb
over generations (13.8 → 17.1 → 18.8 → 20.9). Twelve law sentences beat forty fact sentences (16.7).
So the frozen failure was the trust gene failing to bootstrap, not the language.

The same diagnostic showed laws + exceptions doing **worse** than laws + random facts
(18.2 vs 20.9). Suspected cause: exception facts are a curated sample, but the child counts them
as ordinary evidence. Told "the law's move does not go down here" several times, it rejects a true
law, and its own induction sees too many non-law down moves to form one.

## v1.1 change

One new arm, **LAWS_EXC_AWARE**: the same elders, saying the same sentences as LAWS_EXC. The child
knows the heard rules were chosen as exceptions. It uses them to act, but only its **own**
observations count as evidence when it induces or tests laws.

Trust is fixed at 1 in v1.1 (the diagnostic's setting). Everything else as in PREDICTIONS.md.
**Fresh seeds 7–12** (worlds 107–112). W = 12 primary, W = 40 secondary.

## Predictions

- **Q1 language:** at W = 12, LAWS_RANDOM − FACTS ≥ +3.0 fitness, positive in ≥ 5/6 seeds.
- **Q2 compression:** mean LAWS_RANDOM at W = 12 ≥ mean FACTS at W = 40.
- **Q3 modelling the speaker:** at W = 12, LAWS_EXC_AWARE − LAWS_EXC ≥ +1.5, positive in ≥ 5/6.
- **Q4 then exceptions pay:** at W = 12, LAWS_EXC_AWARE − LAWS_RANDOM ≥ +1.0, positive in ≥ 5/6.

Q3 and Q4 can fail independently. If Q3 passes and Q4 fails, a listener that models the speaker
recovers from a curated curriculum, but the curriculum still does not beat plain random facts.

## Ledger, written in advance

- Post-hoc: designed after seeing v1 and the diagnostic. Fresh seeds reduce but do not remove
  the risk of fitting to what was seen.
- "Aware" is a hand-coded flag, not a learned model of the speaker.
- Trust fixed at 1 removes the gene–culture bootstrap problem that sank the frozen run; that
  problem is itself a result and stays in the README.
