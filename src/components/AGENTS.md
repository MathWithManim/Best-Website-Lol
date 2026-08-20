# COMPONENTS

UI layer: 25 React components + page-level views. All follow default-export arrow function pattern with local `interface XxxProps`.

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Auth flow UI | `AuthModal.tsx` | Login/signup with error-string sniffing, savedAccounts localStorage |
| RNG game UI | `RNGGame.tsx` | Slot-machine reel, setTimeout spin loop, useRef interval |
| Rarity display | `RarityGrid.tsx` | Locked/unlocked grid, imports from `src/lib/rarities.ts` |
| Stats/sell UI | `RarityStatsModal.tsx` | Imports `RARITY_COLORS` from rarities.ts, sell buttons with `sellButtonProps` helper |
| Leaderboard view | `Leaderboard.tsx` | Imports from `src/lib/rarities.ts`, DiceBear avatar, medal styling |
| Theme provider | `CosmeticThemeProvider.tsx` | CSS-var override (`--app-bg/--app-primary/--app-accent`), typed `CosmeticTheme` |
| Auth context | `UserProvider.tsx` | `useUser()` hook, `"skip"` query gate, typed `User` interface |
| Navbar | `Navbar.tsx` | Mobile menu, localStorage read in render |
| Dark mode | `DarkModeToggle.tsx` | `document.documentElement` class toggle |

## CONVENTIONS

- **Component pattern**: Default export arrow function, local `interface XxxProps`
- **Constants centralized**: `src/lib/rarities.ts` exports `RARITIES`, `RARITY_COLORS`, `RARITY_VALUES`, `RARITY_INDEX`
- **Convex imports**: `import { api } from '../../convex/_generated/api'`
- **Hook usage**: useState dominates (no useReducer, no useMemo); useCallback only for prop-drilled handlers; useRef for intervals
- **Dark mode**: Every element gets literal hex pairs `dark:bg-[#1a120b] dark:text-[#f4d5ad]` — no shared utility

## ANTI-PATTERNS

1. **No hooks/ directory**: Custom hooks (`useUser`) co-located with providers, not in a dedicated folder
