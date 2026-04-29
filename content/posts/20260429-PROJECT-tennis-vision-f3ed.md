+++
title = "F3ED Can't Call an Ace: Fixing a NeurIPS 2024 Tennis Model"
seoTitle = "F3ED Tennis Model Audit: Fixing Outcome Labels with OCR"
date = 2026-04-29
publishDate = 2026-04-29T03:00:00Z
lastmod = 2026-04-29
images = ["https://static.philippdubach.com/ograph/ograph-tennis-vision3.jpg"]
description = "F3ED, the NeurIPS 2024 tennis shot detector, mislabels 73% of single-shot serve unforced errors. A 23-line scoreboard OCR reconciler fixes them."
keywords = ["tennis shot detection", "tennis broadcast computer vision", "tennis match analytics open source", "fine-grained tennis event detection", "automatic ace detection tennis", "F3ED tennis model audit", "tennis scoreboard OCR pipeline", "score-grammar reconciler", "TenniSet V006 benchmark", "ATP Challenger video analysis", "shot outcome classification", "EasyOCR tennis scoreboard", "YOLOv8x tennis player detection", "CatBoost bounce detection filter"]
categories = ["AI"]
type = "Project"
draft = false
takeaways = [
  "F3ED labeled 11 single-shot serve rallies as unforced errors but only 3 were genuine, 7 were first-serve faults and 1 was an ace, so 73% are mislabeled by tennis's own definition",
  "A 23-line reconciler that reads the scoreboard before and after each rally overrides F3ED's outcome label in microseconds, running once per rally against a 1 Hz OCR state timeline",
  "Swapping YOLOv8m for YOLOv8x lifted top-player pose coverage from 70.0% to 97.6% at 1080p but did nothing at 720p, where the camera-far player drops below COCO's small-object scale buckets",
  "Two filters cut CatBoost bounce false positives by 21-27%: a 400 ms temporal dedup and a court-locality check that drops bounces landing more than 200 px past the doubles alley",
]
faq = [
  {question = "What is F3ED and why does it mislabel tennis serves?", answer = "F3ED is the NeurIPS 2024 fine-grained tennis event detector. It detects shots well, achieving 0.54 F1 on TenniSet V006 with the highest precision among published baselines. The catch is its 4-class outcome head (in, winner, forced-err, unforced-err), which has no class for ace, double_fault, or first_serve_fault. Those events are score-grammar, not shot properties: they require state from outside the shot itself. When F3ED sees a serve that scores a point with no return, the closest available label is unforced-err, so that's what it emits."},
  {question = "How does the OCR reconciler correct F3ED's outputs?", answer = "The reconciler reads the scoreboard state before and after each rally via EasyOCR sampling at ~1 Hz, then computes the points-won delta. For single-shot serve rallies the delta uniquely identifies the outcome: server +1 receiver +0 is an ace, server +0 receiver +0 is a first-serve fault, server +0 receiver +1 is a double fault. The classifier is 23 lines and runs in microseconds. When F3ED disagrees, the reconciler overrides the outcome and writes the corrected label back into the rally event so it surfaces in render."},
  {question = "Does upgrading YOLOv8 from m to x improve tennis broadcast player detection?", answer = "Only at 1080p. On a 1080p ATP Challenger clip, top-player pose coverage went from 70.0% with YOLOv8m to 97.6% with YOLOv8x. On a 720p clip the same swap moved coverage from 70.3% to 68.6%, within noise. The mechanism is plausible: at 1080p the camera-far player is roughly 60 to 100 pixels tall, the regime where YOLOv8x's COCO AP@small advantage fires. At 720p the same player is 30 to 50 pixels, below COCO's small-object scale buckets where the larger backbone outperforms. If you're scraping broadcast tennis, fight for 1080p sources."},
  {question = "How can you reduce false positives in CatBoost tennis bounce detection?", answer = "Two cheap filters cut 21-27 percent of false bounces on a 20-minute clip where the detector emitted 378 bounces against 84 actual shots. First, a temporal dedup with 400 ms minimum separation between bounces, fps-aware, drops 9 to 12 percent by collapsing the detector firing on consecutive frames for one physical contact. Second, a court-locality filter projects the ball pixel through the homography to canvas coordinates and drops the bounce if it falls outside the court polygon plus a 200 px buffer. That kills inter-rally noise where the ball is being held or replayed, dropping another 12 to 15 percent."},
  {question = "Can shot detection alone produce accurate tennis match analytics?", answer = "No. Shot detection and outcome classification look like the same problem and aren't. F3ED's per-shot taxonomy works for direction, technique, and basic outcomes that depend only on the shot itself. It cannot emit aces, double faults, or first-serve faults because those events depend on what happens between shots or on what doesn't happen at all. On broadcast tennis the cheapest outcome ground truth is text the broadcaster has already burned into the corner of every frame, and feeding that signal into runtime label correction closes the gap."},
  {question = "What is the difference between an ace and an unforced error in tennis?", answer = "An ace is a legal serve the receiver doesn't touch, ending the point in the server's favor with one shot. An unforced error is a missed shot in a multi-shot rally that the player had time and balance to make, usually attributed to the loser of the point. The two outcomes are mutually exclusive: aces are won by the server in one shot, unforced errors are lost by either player after a rally has begun. F3ED conflates them because the model has no class for ace, so winning serves get labeled unforced-err by default."},
]
+++

I built a tennis broadcast pipeline this spring and ended up running F3ED, the NeurIPS 2024 shot detector, on a couple of ATP Challenger matches. F3ED is a good model. It also kept labeling clear aces as "unforced errors", which is what this post is about. Code: [github.com/philippdubach/tennis-vision](https://github.com/philippdubach/tennis-vision).

F3ED ([NeurIPS 2024](https://openreview.net/forum?id=Y23LZxN9eU)) detects shots well. The catch is the outcome head, which has 4 classes: `in`, `winner`, `forced-err`, `unforced-err`. There's no class for `ace`, `double_fault`, or `first_serve_fault`. Those events aren't shot properties; they're score-grammar, and they need state from outside the shot itself.

I audited 11 single-shot serve rallies F3ED labeled `unforced-err`. 7 are first-serve-faults. 1 is an ace. Only 3 are genuine unforced-errors. 73% mislabeled by tennis's own definition.

The fix is a 30-line reconciler that reads the scoreboard. OCR isn't novel here. What I haven't seen anyone do is plug it back into runtime label correction, which is what makes the difference. N=44 rallies across two matches; this is a hypothesis, not a finding. The structural argument doesn't depend on N.

## The current pipeline

Two phases, with a serializable artifact between them:

{{< img src="00_architecture.png" alt="Pipeline architecture diagram showing Phase 1 GPU detection, the upstream.npz boundary, and Phase 2 local CPU stages with the score-delta reconciler highlighted as the key contribution" width="80%" >}}

`upstream.npz` is a 5-field dataclass (`ball_track`, `homography_matrices`, `kps_court`, `persons_top/bottom`, `bounces`). It's the contract between the GPU-bound detection layer and everything else. You re-run Phase 2 in seconds and don't pay the GPU bill again until Phase 1 inputs change. This was a boring early decision that quietly carried the project. Every iteration runs in ~10 minutes instead of needing a fresh Colab session.

The score-delta reconciler sits at the end of Phase 2. It sees F3ED's per-shot taxonomy and the OCR-derived score states. When they disagree, it overrides the outcome label.

Quality on TenniSet V006 (28 ground-truth points across 20 minutes, with ±12-frame tolerance):

{{< img src="table_01_benchmarks.png" alt="Detector benchmark table on TenniSet V006 showing F3ED pretrained achieves the highest F1 of 0.54 with 109 TP, 48 FP, 55 FN, 0.53 recall and 0.69 precision, beating E2E-Spot and rule-based baselines that both score 0.50 F1" width="80%" >}}

F3ED has the highest F1, with fewer false positives at comparable recall. I'm not arguing it's broken. I'm arguing about a specific thing it can't do alone.

> *Note: numbers above are from the V006 baseline run on commit `0babb71` (2026-04-23). Bounce-dedup and reconciler work since then shift F1 marginally upward; full re-eval pending a Phase-1 v8x rerun on V006.*

## The audit

Tennis scoring is a finite-state machine. A point ends in exactly one of:

- `ace`: server's first or second serve, receiver doesn't return
- `double_fault`: both serves miss
- `first_serve_fault`: first serve misses; second serve still to come
- multi-shot rally → `winner` / `forced-err` / `unforced-err`

F3ED can only emit the bottom row. The first three depend on what happens between shots, or on what doesn't happen at all, and the model doesn't see between-shot stuff. It also has no class to put the answer in if it did: `ace`, `double_fault`, and `first_serve_fault` are not in F3ED's published label set. The closest available emission for any of them is `serve` + `unforced-err`. The model can't learn to distinguish them even if the training data did, because there's nowhere to put the answer.

Here's what tipped me off. set1 R4, t=107s:

```
F3ED raw_elements:  ['T', 'ad', 'near', 'serve', 'unforced-err']
Score before rally:  Poljicak 0    Dodig 0     (game start)
Score after rally:   Poljicak 15   Dodig 0
```

Server scored, receiver didn't move, F3ED labeled the serve "unforced error". You can't hit an unforced error and win the point. It was an ace, and F3ED doesn't have an "ace" button to press, so it picked the closest available label.

The reconciler is short. For each single-shot serve rally, read the scoreboard before and after:

```python
# Verbatim from src/tennis_vision/scoreboard/reconcile.py
_POINT_RANK = {'0': 0, '15': 1, '30': 2, '40': 3, 'AD': 4}

def _delta_points_won(before: ScoreState, after: ScoreState) -> tuple[int, int]:
    """(top_pts_won, bot_pts_won) between two states. A game-counter increment
    counts as +1 (the lost-side rolls back to 0); same-game incremental points
    are tracked via the points-rank delta."""
    top = max(0, after.tg - before.tg)
    bot = max(0, after.bg - before.bg)
    if after.tg == before.tg and after.bg == before.bg:
        top += max(0, _POINT_RANK.get(after.tp, 0) - _POINT_RANK.get(before.tp, 0))
        bot += max(0, _POINT_RANK.get(after.bp, 0) - _POINT_RANK.get(before.bp, 0))
    return top, bot

def _classify_single_shot_serve(rally, before, after) -> tuple[str, str, str]:
    top_d, bot_d = _delta_points_won(before, after)
    server_d   = top_d if rally.server == 'top' else bot_d
    receiver_d = bot_d if rally.server == 'top' else top_d
    receiver   = 'bottom' if rally.server == 'top' else 'top'
    if server_d == 0 and receiver_d == 0:
        return ('first_serve_fault', 'unknown', 'ocr_score_delta_first_serve_fault')
    if server_d > 0 and receiver_d == 0:
        return ('ace', rally.server, 'ocr_score_delta_ace')
    if receiver_d > 0 and server_d == 0:
        return ('double_fault', receiver, 'ocr_score_delta_double_fault')
    return ('unknown', rally.winner, rally.method + '+ocr_inconclusive')
```

That's the whole reconciler: 23 lines, microseconds per rally. The OCR sampling pass that produces the `before` / `after` states runs once during Phase 2 (~1 Hz over the broadcast); the reconciler itself is a constant-time lookup against the resulting state timeline.

Running it across set1 + match2 (44 rallies, 11 single-shot serve rallies) shows the structure F3ED missed:

{{< img src="table_02_outcomes.png" alt="Confusion table showing how F3ED labels map to OCR-grounded reality: of eleven unforced-err labels, seven are actually first-serve-faults, one is an ace, and only three are genuine unforced errors, while winner and in labels are correct" width="65%" >}}

{{< img src="01_outcome_transitions.png" alt="Sankey-style chart showing F3ED outcome labels transitioning to OCR-grounded ground truth, with seven of eleven unforced errors reclassified as first-serve faults, one as an ace, and only three remaining as genuine unforced errors" width="80%" >}}

8 of 11 unforced-err serves (73%) are something else by tennis's actual rules. All 8 got the right label after reconciliation. Whether 73% holds up on a larger sample is a real question; the audit framework would answer it cheaply on more clips. The remaining error budget is OCR layout failures (next section) and ambiguous score deltas in multi-shot rallies, where neither F3ED nor OCR alone tells `winner` from `forced-err`.

The point here isn't that F3ED is wrong. The model emits the labels it has classes for, which is what models do. The point is that shot detection and outcome classification look like the same problem and aren't, and on broadcast tennis the cheapest outcome ground truth is text the broadcaster has already burned into the corner of every frame.

{{< readnext slug="counting-cards-with-computer-vision" >}}

## Does the OCR actually work?

Worth asking. The whole reconciler depends on the scoreboard reader being right. Honest answer: it depends heavily on whether the layout config is tuned. When it is, OCR is reliable. When it isn't, individual fields collapse.

The pipeline is EasyOCR cropping a per-layout ROI (`split_open_1080p`, `split_open_720p`, `bloomfield_720p`), then a tennis-grammar decoder that rejects illegal transitions (`40-30` → `0-0` without a game break, `AD-15`, and so on) and majority-votes within a sample window.

Field-parse rates on the two clips in this audit, sampled at ~1 Hz:

{{< img src="table_03_ocr_parse_rates.png" alt="OCR field-parse rates table showing set1 with split_open_1080p layout achieves near-perfect parsing at 100 percent for games and 98.7 percent for points, while match2 with mistuned split_open_720p layout drops to 45.6 percent on bot_games" width="90%" >}}

set1 is essentially perfect. match2's `bot_games` parse drops below half because the ROI for `split_open_720p` is mistuned and crops too tight on the digit. Annoying, but the grammar decoder rescues enough frames to emit 28 valid score states across 1002 samples, which is plenty. The reconciler degrades gracefully: rallies without a clean before/after pair fall back to F3ED's raw outcome rather than crashing.

The fix for match2 is layout cleanup, not architecture. None of these components are novel. [TennisExpert](https://arxiv.org/abs/2603.13397) (Liu et al. 2026, the paper that kicked off this whole project for me) and the TenniSet eval framework (Faulkner & Dick, DICTA 2017) both use OCR + grammar at the labeling stage. What I haven't seen anyone do is plug the same signal back into runtime label correction.

## Putting it in the render

After reconciling, the corrected outcome flows back onto the last shot of the rally and surfaces in the rolling event-timeline panel. Here's a single point rendered end-to-end with all overlays live:

{{< video src="tennis_vision-example-point.mp4" srcMobile="tennis_vision-example-point-mobile.mp4" alt="Looping tennis broadcast clip showing the rendered overlay with rally panel, scoreboard echo, per-player stats, and direction labels updating live during a single point" width="80%" aspect="16/9" >}}

Same set1 R4 ace, mid-frame: Top-left RALLY panel reads `0.0s P2 Serve T ACE`. The `ACE` suffix replaced F3ED's `UE`. The scoreboard echo (bottom-left) mirrors what triggered the correction (Poljicak just picked up 15), and the per-player stats panel (bottom-right) ticks his ace counter by one. The model's wrong answer gets quietly corrected because a different signal contradicted it. That's the whole post in one frame.

{{< img src="05_set1_ace_corrected.png" alt="Rendered tennis broadcast frame showing the corrected ace label in the rally panel reading 0.0s P2 Serve T ACE, with the scoreboard echo confirming Poljicak picked up 15 and the per-player stats panel ticking the ace counter by one" width="80%" >}}

The same panel surfaces F3ED's other labels in real time: direction (`T` for down-the-T serves, `CC`/`DL`/`DM`/`II`/`IO` for groundstrokes) and shot type when not a basic groundstroke (`Slice`, `Volley`, `Drop`, `Lob`).

{{< img src="06_match2_rally_panel.png" alt="match2 rally panel rendering F3ED's 29-class taxonomy in real time, showing direction codes for down-the-line, cross-court, and inside-out groundstrokes alongside shot-type tags like Slice, Volley, Drop, and Lob" width="80%" >}}

That panel is the F3ED 29-class taxonomy made human-readable, in real time. The reconciler doesn't touch direction or technique. Those are pure shot properties, exactly the regime F3ED is designed for. It only fires on the score-grammar events the model can't see.

A clean direction histogram comes for free as a side effect. 97 groundstrokes from match2:

{{< img src="04_direction_distribution.png" alt="Histogram of groundstroke directions from 97 shots in match2 showing 36 percent down the middle, 31 percent cross-court, 17 percent inside-out, 12 percent down-the-line, and 3 percent inside-in" width="80%" >}}

36% down the middle, 31% cross-court, 17% inside-out, 12% down-the-line, 3% inside-in. The kind of stat broadcasters quote without showing where it came from. Here it's a one-liner over `shots.json`.

## Things that didn't pay off

Two ideas I tried that I expected to be wins. Neither was.

### YOLOv8x doesn't help at 720p

Phase-1 person detector was YOLOv8m. Swapping in v8x looked like a free improvement: COCO AP@small bumps about 5 pp, and the camera-far ("top") player on broadcast tennis is the smallest object in the frame, so that's exactly where the gain should land.

{{< img src="02_pose_coverage_by_resolution.png" alt="Bar chart comparing top-player pose coverage with YOLOv8m versus YOLOv8x at two resolutions, showing 1080p coverage rising from 70.0 percent to 97.6 percent while 720p coverage stays flat at roughly 70 percent" width="80%" >}}

set1 (1080p): top-player pose coverage 70.0% → 97.6%. match2 (720p): 70.3% → 68.6%, within noise. Two clips isn't a study, but the mechanism is plausible: at 1080p the camera-far player is ~60-100 px tall, the regime where v8x's AP@small advantage fires. At 720p the same player is ~30-50 px, below the COCO scale buckets where -x outperforms -m. The detector can't recover what isn't in the input. If you're scraping ATP Challenger feeds, fight for 1080p sources. Everything downstream compounds on what the detector gives you.

### CatBoost over-fires bounces

The bounce detector emitted 378 bounces on a 20-min match2 clip with 84 shots, 4.5× the realistic ratio. Most of the noise is the detector lighting up on the same physical bounce across consecutive frames, plus inter-rally footage where the ball is in a player's hand or in a replay close-up.

Two cheap filters cut 21-27% of false bounces:

{{< img src="03_bounce_filter_waterfall.png" alt="Waterfall chart showing bounce-count reduction from 378 raw CatBoost bounces through a 400 ms temporal dedup that drops 9 to 12 percent, then a court-locality filter that drops a further 12 to 15 percent" width="80%" >}}

The first is a temporal dedup with ~400 ms minimum separation between bounces, fps-aware. It collapses CatBoost firing on three consecutive frames for one physical contact and drops 9-12%.

The second is a court-locality filter: project the ball pixel through the homography to canvas coordinates, drop if it falls outside the court polygon plus a 200 px buffer. This kills inter-rally noise where the ball is being held or replayed, dropping another 12-15%.

Real bounces don't fire 200 ms apart and don't land 3 m past the doubles alley. Neither filter is novel; both are roughly ten lines of code. If you're using a CatBoost-style bounce detector you probably want both anyway.

## What's open

44 rallies isn't enough to nail the percentage, just to expose the structure. Running the audit across 10+ matches is the obvious next step. It would also surface match-to-match variance in F3ED's failure modes. Does it mislabel aces more often on hard courts than clay? I have no idea, and I'd like to know.

The reconciler currently only handles single-shot serve rallies. When both players hit clean balls and the point ends, the score delta is the same whether the winner came from a `winner` or a `forced-err`. Neither F3ED nor OCR alone disambiguates. A trajectory-aware classifier on the last two shots would close that gap. Haven't tried it.

The longer-term move is closed-loop F3ED retraining: use the OCR-corrected labels as supervision for a small classifier head whose input is (F3ED 4-class outcome, OCR delta, single-shot flag) and whose output is the extended set {`in`, `winner`, `forced-err`, `unforced-err`, `ace`, `double_fault`, `first_serve_fault`, `unreturnable`}. About 5 minutes of training data per match. 10+ matches gets a usable head. The interesting move there is putting the OCR signal into training rather than just inference.