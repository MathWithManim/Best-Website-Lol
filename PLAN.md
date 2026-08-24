# PLAN.md — Mini Arcade Launcher

> Authored overnight per request. No questions were asked; every decision is recorded here.

## What

A floating arcade button (fixed, top-left, below the navbar) that opens a modal
launcher with five minigame cards. Each card navigates to `/game/[1-5]`, which
hosts a fully playable client-side minigame:

| # | Route      | Game        | Booth color          | Art (inline SVG, no icon fonts)     |
|---|------------|-------------|----------------------|-------------------------------------|
| 1 | /game/1    | Plinko      | Teal `#0E7C7B`       | Peg board + falling ball            |
| 2 | /game/2    | Coin Flip   | Brass gold `#C9962E` | Coin, heads face / tails face       |
| 3 | /game/3    | Mini Slots  | Cherry red `#C0392B` | Three-reel window with symbols      |
| 4 | /game/4    | Hi-Lo Cards | Table green `#2E7D32`| Two playing cards fanned            |
| 5 | /game/5    | Wheel Spin  | Violet `#7048B6`     | Segmented prize wheel               |

## Why these choices

- The site already owns a paper-and-brown carnival identity (`#F5E6CA`,
  browns, typewriter/mono/cursive type). The arcade extends that world:
  each game is a "carnival booth" with its own saturated color, all sitting
  on the existing cream/dark-brown surfaces.
- **Signature element**: the launcher is a tiny arcade cabinet — marquee with
  chasing lights, coin slot, gentle bob — not a generic floating circle.
- No external downloads or icon packs: the sandbox has no general internet
  egress (verified earlier), and the brief says "don't use icons". Every tile
  gets bespoke inline SVG art instead. Zero new dependencies.
- Games are pure client-side fun. They do NOT touch LuckBucks or any Convex
  state — zero backend risk while the owner sleeps. Economy integration is
  listed under Future Work for explicit approval.

## Interaction spec

- **Button**: fixed `left-4 top-[88px]` (navbar is sticky h~72 z-40; button
  sits below it), z-50. Bobbing float animation; on hover the marquee lights
  chase faster and the cabinet tilts toward the cursor slightly.
- **Modal**: AnimatePresence fade+scale in; staggered card entrance;
  backdrop click / ESC closes; body scroll locked while open.
- **Cards**: each booth-colored gradient, custom SVG art, name + tagline.
  Hover/focus: lifts `-translate-y-1.5` with `perspective` tilt
  (`rotateX(8deg)`), glow ring in booth color; tooltip slides up above the
  card with a one-line description of the game.
- **Reduced motion**: `settings.reduceMotion` disables bob/chase/spin
  flourishes; games still function (instant results where applicable).
- **Routing**: `/game/:id` (1-5) lazy-loaded `ArcadePage` shell — themed
  header in booth color, back-to-home link, the game centered. Invalid id →
  friendly redirect back to `/`.

## Games (all client-side, provably-local RNG)

1. **Plinko** — canvas, gravity + peg bounces, 8 multiplier buckets; ball
   trail; landing bucket flashes.
2. **Coin Flip** — pick a side; coin flips with real `rotateY` 3D
   (`preserve-3d`, two faces), ~1.8s ease-out, result stamp + streak count.
3. **Mini Slots** — three reels spin then stop left→right; symbol match
   payout table displayed.
4. **Hi-Lo** — current card shown, guess next higher/lower; card flip reveal;
   run streak tracked; ace-high deck.
5. **Wheel Spin** — SVG wheel, eased spin to random segment, pointer tick at
   top, prize text.

## Files

```
src/lib/games.ts                     metadata (id, name, color, blurb, tooltip)
src/components/arcade/ArcadeButton.tsx
src/components/arcade/ArcadeModal.tsx  (includes GameCard)
src/components/arcade/GameArt.tsx      five bespoke SVG artworks
src/pages/ArcadePage.tsx               /game/:id shell
src/components/arcade/games/Plinko.tsx
src/components/arcade/games/CoinFlip.tsx
src/components/arcade/games/MiniSlots.tsx
src/components/arcade/games/HiLo.tsx
src/components/arcade/games/WheelSpin.tsx
App.tsx                                ArcadeButton mount + /game route (lazy)
PLAN.md                                this file
```

## Verification gates

`tsc -b` · `oxlint` (0 errors) · `vitest` (17+ green) · `vite build`.
Manual checklist: modal opens/closes via click, ESC, backdrop; keyboard focus
reachable; tooltips appear on hover AND focus; routes render; reduced-motion
path sane; no console errors in build output.

## Future work (needs owner approval)

- Wire minigames into LuckBucks economy (server-authoritative payouts).
- Daily arcade ticket system.
