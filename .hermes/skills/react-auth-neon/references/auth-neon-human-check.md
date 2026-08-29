# Human Check Pill — 6-Digit Bot Gate (2026-08-29)

**Commit:** e42bd80
**File:** `src/components/app/AuthModal.tsx`
**Replaces:** Neon "Require email verification" email code (user disabled it, wants client-side bot check).

## UX
After valid Sign Up submit, a bottom pill animates in (`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-[24px]`). It shows a CODE chip with a random 6-digit `captchaCode` (e.g. 482917) and 6 input boxes. User must type the code exactly.

## GSAP Motion
- **Pill enter:** `gsap.fromTo(pill, {y:80,opacity:0,scale:0.96}, {y:0,opacity:1,scale:1, duration:0.5, ease:"back.out(1.4)"})`
- **Per-box loader sweep:** each box has an absolute gradient div `linear-gradient(90deg, transparent, rgba(16,185,129,0.95) 50%, transparent)` at `xPercent:-100`. On digit entry: `gsap.set → gsap.to {xPercent:100, duration:0.55, ease:power2.inOut, onComplete: opacity 0}` plus border flash green.
- **Success:** all 6 loaders stagger `delay i*0.04 duration 0.45`, pill pulse `scale 1.02 yoyo`.
- **Mismatch:** `captchaError` red text, pill shake `gsap.fromTo(pill,{x:0},{x:-8,duration:0.07,repeat:5,yoyo:true})`, boxes red border flash, inputs cleared after 700ms.
- **Auto-advance:** focus next input on entry, Backspace/ArrowLeft/Right navigation, paste handler for 6 digits.

## Error Budget (red vs green)
- **Red (`error` state):** only real failures — already exists, network/fetch, weak password, invalid email, rate limit. Rendered as red alert box inside modal `bg-red-500/10 border-red-500/30`.
- **Green (`info` state):** soft-success like `needsVerification` (`token:null` when email verification still ON). Rendered as emerald popup `fixed top-6 left-1/2` via `AnimatePresence` + `m.div` with dismiss ✕, not red. This reserves red for actionable errors.

## Code Sketch
```ts
const genCode = () => Math.floor(100000+Math.random()*900000).toString();
const [captchaCode, setCaptchaCode] = useState("");
const [captchaInput, setCaptchaInput] = useState<string[]>(["","","","","",""]);
const [showCaptcha, setShowCaptcha] = useState(false);
const [pendingSignup, setPendingSignup] = useState<{email:string;name:string;password:string}|null>(null);
// handleSubmit: if signup → genCode(), setShowCaptcha(true), store pending, return
// handleCaptchaChange: triggerLoader(idx), check combined===captchaCode → success else mismatch
```

## Verification
- `npm run build` passes (dist/index-CjhfeSII.js, 382kB gzip)
- `npm run lint` only pre-existing warnings
- Manual: Sign Up → pill appears → type code → green sweeps → account created → onLogin
