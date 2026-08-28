# Graph Report - website  (2026-08-28)

## Corpus Check
- Corpus is ~41,911 words - fits in a single context window. You may not need a graph.

## Summary
- 320 nodes · 419 edges · 37 communities (31 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 120 input · 85 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 21
- Community 22
- Community 23
- Community 24
- Community 26

## God Nodes (most connected - your core abstractions)
1. `react` - 21 edges
2. `compilerOptions` - 18 edges
3. `compilerOptions` - 15 edges
4. `useUser()` - 13 edges
5. `scripts` - 7 edges
6. `Breadcrumbs()` - 7 edges
7. `computeLuckStats()` - 7 edges
8. `ShareCardModal()` - 6 edges
9. `RARITY_COLORS` - 6 edges
10. `getRollHistory()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Project README` --documents--> `React + Vite`  [EXTRACTED]
  README.md → package.json
- `Landing HTML` --includes--> `RNG Game`  [EXTRACTED]
  index.html → src/components/game/RNGGame.tsx
- `AppShell()` --calls--> `useSettings()`  [EXTRACTED]
  src/App.tsx → src/lib/settings.ts
- `RollHistory()` --calls--> `getRollHistory()`  [EXTRACTED]
  src/components/RollHistory.tsx → src/lib/rollHistory.ts
- `ShareCardModal()` --calls--> `useUser()`  [EXTRACTED]
  src/components/ShareCardModal.tsx → src/lib/useUser.ts

## Import Cycles
- None detected.

## Communities (37 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (34): react, AppShell(), ArcadePage, CookiePolicy, Logout, pageTransition, pageVariants, Privacy (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (23): LuckPanel(), toneClass, RecentWins(), timeAgo(), RollHistory(), fmtCompact(), computeLuckStats(), DayBucket (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): autoprefixer, oxlint, devDependencies, autoprefixer, oxlint, @playwright/test, postcss, tailwindcss (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (26): bcryptjs, better-auth, drizzle-kit, drizzle-orm, framer-motion, gsap, @gsap/react, @neondatabase/serverless (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (24): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, dev, lint, preview, start (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.21
Nodes (6): App(), ErrorBoundary, Props, State, captureError(), initSentry()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (9): loadTemplate(), ShareCardModal(), ShareCardModalProps, rarityChancePercent(), downloadCanvas(), drawShareCard(), SHARE_TEMPLATES, ShareCardData (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (9): instructions, plugin, $schema, AGENTS.md, full-system-prompt.md, opencode-autotitle, opencode-command-inject, opencode-dynamic-context-pruning (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (6): db, sql, globalStats, leaderboard, userCosmetics, users

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): ARCADE, PLINKO_MULTS, SLOTS_SYMBOLS, SLOTS_TRIPLE_PAY, WHEEL_LABELS, WHEEL_MULTS

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): ABOUT_PARAGRAPHS, CONTACT_BLURB, FACTS, INTRO, SOCIALS, TAGLINE

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (5): DEFAULT_SETTINGS, Settings, SETTINGS_STORAGE_KEY, SettingsContext, SettingsContextValue

### Community 15 - "Community 15"
Cohesion: 0.60
Nodes (4): CompletionRing(), markReached(), MILESTONES, reached()

### Community 16 - "Community 16"
Cohesion: 0.70
Nodes (4): audio(), playRollStart(), playWin(), tone()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (3): Auth System, Convex Backend, CI Pipeline

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (3): GSAP Animations, Landing HTML, RNG Game

## Knowledge Gaps
- **140 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 0` to `Community 1`, `Community 7`, `Community 8`, `Community 10`, `Community 14`, `Community 15`, `Community 17`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 2` to `Community 3`, `Community 6`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06779661016949153 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._