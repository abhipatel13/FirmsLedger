# DirectoryHub Premium Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the live landing page (`src/views/DirectoryHub.jsx`, rendered at `/` via `app/page.jsx`) and the shared chrome (`src/Layout.jsx` nav + footer) to read as a premium, enterprise-grade B2B platform (Stripe/Linear/Vercel/Apple-adjacent) instead of a generic Tailwind template — while keeping every section, its order, and all functionality (state picker, category toggle, links, forms) exactly as they are today. This is a visual/CSS-and-JSX-only change: no new routes, no new npm dependencies, no layout restructuring, no content changes.

**Architecture:** Three sequential tasks touching three files. Task 1 lands the new color tokens and reusable utility classes/animations in `src/index.css` first, because Tasks 2 and 3 consume them. Tasks 2 and 3 touch disjoint files (`Layout.jsx` vs `DirectoryHub.jsx`) and do not depend on each other, but are run sequentially per this skill's no-parallel-implementer rule.

**Tech Stack:** Next.js 15 App Router, React 18 client components, Tailwind CSS (utility classes) + inline `style={{}}` objects (Layout.jsx's existing pattern), `lucide-react` icons, no animation library — count-up and fade-up are hand-rolled with `IntersectionObserver`/`requestAnimationFrame`.

## Global Constraints

- **No new npm dependencies.** No animation libraries, no icon packs beyond the already-imported `lucide-react`.
- **No layout changes.** Every section in `DirectoryHub.jsx` stays in its current order with its current content, data, and interactive behavior (state picker `useState`, `showAllCategories` toggle, all `href`s). Every nav/footer link and interactive behavior in `Layout.jsx` (mega-menu, mobile menu, scroll-close) stays functionally identical.
- **Color tokens (exact values — use verbatim, do not approximate):**
  - `--navy: #0F172A` (replaces old `#1A2E4A`; keep the old value available as `--navy-mid: #1A2E4A` for gradient stops where a mid-tone is wanted)
  - `--navy-dark: #070D18`
  - `--gold: #D4A017` (replaces old `#F5A623`)
  - `--gold-light: #E8B84B`
  - `--gold-dark: #A87A0F`
  - `--bg-page: #FAFAF8` (base background)
  - `--bg-surface: #FFFFFF`
  - `--bg-surface-alt: #F5F1EA` (secondary/warm surface, used for categories-adjacent alternating sections)
  - `--bg-cream: #F7F5F0` (light neutral, trust section)
  - `--text-primary: #111827`
  - `--text-secondary: #6B7280`
  - Any Tailwind `orange-500`/`orange-600`/`blue-*` utility class currently used for brand accents (glows, badges, icon tints, buttons) must be replaced — either with the new CSS custom properties via inline `style`, or new Tailwind-safe utility classes added in Task 1 (see Task 1). Do not leave any `orange-*`/`blue-*` brand-accent classes in place after Tasks 2–3; incidental slate/gray utility classes are untouched.
- **Section background rhythm (DirectoryHub.jsx, top to bottom) — exact assignment:**
  1. Hero → `--bg-page` (`#FAFAF8`, off-white)
  2. Categories → `--bg-surface` (`#FFFFFF`, white)
  3. Trust ("Why trust our listings") → `--bg-cream` (`#F7F5F0`, light neutral)
  4. Bold Statement ("Zero Paid Rankings") → deep navy gradient, `linear-gradient(160deg, #0F172A, #070D18)` (replaces current `#211F1C` near-black)
  5. How It Works → `--bg-surface` (`#FFFFFF`, white)
  6. States panel → `--bg-surface-alt` (`#F5F1EA`, warm neutral)
  7. CTA band → same deep navy gradient as the Statement section, for visual consistency between the two dark sections
  - Footer (`Layout.jsx`) → near-black, `#0B0F17` (currently `#F8FAFC` light gray — this is an intentional darkening called out in the brief's section-rhythm list)
- **Motion budget — do not exceed this:** card hover (`translateY(-4px)` + shadow bump, ~250ms ease), button hover (background/shadow transition + `scale(1.02)`, ~200ms), section fade-up on scroll (one shared `IntersectionObserver` hook, opacity 0→1 + `translateY(16px)→0`, ~500ms, triggers once per section), hero stat count-up (one `requestAnimationFrame` loop per stat, ~1200ms, triggers once on scroll-into-view), nav link underline (CSS `::after` width transition on hover). No parallax, no 3D transforms, no blur-heavy glassmorphism, no looping/ambient animation beyond the two `float`/`dotPulse` keyframes already defined in `index.css` (leave those keyframes as-is, unused unless a task explicitly calls for them).
- **No automated test suite exists in this repo.** Verification is `npm run lint`, `npm run build`, and a manual visual check via `npm run dev` (start the dev server, load `/`, confirm no console errors, confirm hero/cards/dark-section/nav render and interactive bits — state picker, category "view more" toggle, mega-menu, mobile menu — still work).

---

### Task 1: Design tokens, utilities, and animation primitives in `src/index.css`

**Files:**
- Modify: `src/index.css` (full file currently 308 lines)

**Interfaces:**
- Produces: updated `:root` custom properties (see Global Constraints color list above — replace the existing `/* FirmsLedger design tokens */` block's `--navy`, `--gold`, `--gold-light`, `--gold-dark` values in place, add the new `--navy-dark`, `--navy-mid`, `--bg-page`, `--bg-surface`, `--bg-surface-alt`, `--bg-cream`, `--text-primary`, `--text-secondary` alongside them); new utility classes `.text-gold`, `.bg-gold`, `.border-gold`, `.text-navy`, `.bg-navy` (simple color utilities so `DirectoryHub.jsx`/`Layout.jsx` can stop using mismatched `orange-*`/`blue-*` Tailwind classes for brand color); new `.card-premium` class (border/shadow/hover-lift, built on top of the existing `.card-hover` pattern but adding a soft ambient shadow at rest and a stronger one on hover); new `.grid-texture` and `.noise-texture` background-image utilities (blueprint dot/line grid and a low-opacity SVG-`feTurbulence` noise overlay, both via `background-image`, no image assets); new `.link-underline` utility (animated underline via `background-size` transition on a `background-image: linear-gradient` underline, not `text-decoration`, so the transition is smooth); new `.btn-scale` utility (`transform: scale(1.02)` + shadow on `:hover`, `transition: transform 200ms ease, box-shadow 200ms ease`).
- Consumed by: Task 2 (`Layout.jsx`) and Task 3 (`DirectoryHub.jsx`), both read these class names and custom properties by name — do not rename anything from this list without updating this plan.

This task does not touch any `.jsx` file. It only prepares the shared vocabulary the other two tasks apply.

- [ ] **Step 1: Replace/extend the `:root` design tokens block**

Find the existing block starting at `/* ── FirmsLedger design tokens ───────────────────────────────── */` (currently around line 100). Replace the `/* Brand */` sub-block's four lines (`--navy`, `--navy-dark`, `--navy-mid`, `--gold`, `--gold-light`, `--gold-dark`) and add the new background/text tokens. End state for that `:root` block:

```css
:root {
  /* Brand */
  --navy:      #0F172A;
  --navy-dark: #070D18;
  --navy-mid:  #1A2E4A;
  --gold:      #D4A017;
  --gold-light:#E8B84B;
  --gold-dark: #A87A0F;
  --star-color:#D4A017;
  --max-width: 1380px;

  /* Backgrounds — premium palette */
  --bg-page:        #FAFAF8;
  --bg-surface:      #ffffff;
  --bg-surface-alt:  #F5F1EA;
  --bg-cream:        #F7F5F0;

  /* Text */
  --text-primary:   #111827;
  --text-body:      #334155;
  --text-secondary: #6B7280;
  --text-muted:     #64748b;
  --text-caption:   #94a3b8;

  /* Surface scale — white → light gray (kept for pages not in this redesign) */
  --surface-page:   #ffffff;
  --surface-alt:    #f8fafc;
  --surface-subtle: #f1f5f9;
  --surface-raised: #e2e8f0;

  /* Border */
  --border-light:  #e2e8f0;
  --border-normal: #cbd5e1;
}
```

Keep every other existing custom property in that block (`--surface-*`, `--border-*` etc.) — they're used elsewhere in the app outside this redesign's scope. Only the values shown above change; nothing is deleted except the literal old `--navy`/`--gold`/etc. lines being replaced by the new ones with the same names.

- [ ] **Step 2: Add brand color utility classes**

After the `:root` block (and after the existing `/* Typography scale */` comment, before `/* Animations */`), add:

```css
/* ── Brand color utilities ───────────────────────────────────── */
.text-gold  { color: var(--gold); }
.bg-gold    { background-color: var(--gold); }
.border-gold{ border-color: var(--gold); }
.text-navy  { color: var(--navy); }
.bg-navy    { background-color: var(--navy); }
```

- [ ] **Step 3: Add `.card-premium` hover treatment**

After the existing `.card-hover` block (currently ~line 171-179), add a stronger variant used for the hero stat cards and the dark-section-adjacent cards that need more visual weight:

```css
/* ── Card: premium (stronger shadow, border tint, lift) ─────── */
.card-premium {
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.10);
  transition: box-shadow 250ms ease, transform 250ms ease, border-color 250ms ease;
}
.card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.06), 0 20px 40px -16px rgba(15, 23, 42, 0.18);
  border-color: rgba(212, 160, 23, 0.35);
}
```

- [ ] **Step 4: Add grid/noise texture utilities**

Add near the existing `.dot-grid` class (~line 304):

```css
/* ── Blueprint grid texture (hero, dark statement section) ──── */
.grid-texture {
  background-image:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 48px 48px;
}
.grid-texture-dark {
  background-image:
    linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ── Noise overlay (SVG feTurbulence, no image asset) ────────── */
.noise-texture {
  position: relative;
}
.noise-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 5: Add link-underline and button-scale utilities**

```css
/* ── Animated link underline ─────────────────────────────────── */
.link-underline {
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-size: 0% 1px;
  transition: background-size 250ms ease;
}
.link-underline:hover {
  background-size: 100% 1px;
}

/* ── Button: subtle scale + shadow on hover ──────────────────── */
.btn-scale {
  transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
}
.btn-scale:hover {
  transform: scale(1.02);
}
```

- [ ] **Step 6: Update `.text-gradient` and `.btn-gradient` to the new gold**

The existing `.text-gradient` (~line 212) and `.btn-gradient` (~line 182) classes hard-code the old gold hex values. Update them to the new gold:

```css
.text-gradient {
  background: linear-gradient(135deg, #D4A017, #E8B84B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

```css
.btn-gradient {
  background: linear-gradient(135deg, #D4A017 0%, #E8B84B 100%);
  color: #0F172A;
  font-weight: 600;
  transition: all 0.18s ease;
}
.btn-gradient:hover {
  background: linear-gradient(135deg, #A87A0F 0%, #D4A017 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(212, 160, 23, 0.32);
}
```

**Report file:** write your full report to `.superpowers/sdd/task-1-report.md` in the repo root (create the `.superpowers/sdd/` directory if it doesn't exist).

**Verification:** `npm run lint` and `npm run build` must both pass (no JSX changed, so build should be a no-op sanity check that CSS is syntactically valid and nothing else broke).

---

### Task 2: Navbar + footer polish in `src/Layout.jsx`

**Files:**
- Modify: `src/Layout.jsx` (full file currently 550 lines)

**Depends on:** Task 1 (`--navy`, `--gold`, `--gold-dark`, `.btn-scale`, `.link-underline` must exist in `src/index.css` before this task starts).

**Interfaces:**
- No prop/export signature changes. `Layout({ children })` stays identical. All existing `href`s, `onClick` handlers (`setMobileOpen`, `setBrowseOpen`, click-outside/scroll-close effects), and the `NAV_CATEGORIES`/`FOOTER_*` data arrays stay untouched — this task is pure styling of the existing markup.

This task restyles the header (taller, sticky-blur-on-scroll, stronger CTA) and darkens the footer, per Global Constraints' section-rhythm assignment (footer → `#0B0F17`).

- [ ] **Step 1: Track scroll state for the navbar blur/shadow**

Add a `scrolled` state and a scroll listener alongside the existing `useEffect` in the component (near the existing `onScroll` that closes the mega-menu, ~line 75):

```jsx
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  function onScroll() {
    setBrowseOpen(false);
    setScrolled(window.scrollY > 8);
  }
  document.addEventListener('mousedown', onClickOutside);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    document.removeEventListener('mousedown', onClickOutside);
    window.removeEventListener('scroll', onScroll);
  };
}, []);
```

(Merge this into the existing effect rather than adding a second one — there is already exactly one `useEffect` with `onClickOutside`/`onScroll`; extend it as shown, don't duplicate the listener registration.)

- [ ] **Step 2: Header height, sticky blur, and shadow-on-scroll**

Change the `<header>` style object (currently `height: 64`, opaque white, static border) to:

```jsx
<header style={{
  backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : '#ffffff',
  backdropFilter: scrolled ? 'blur(8px)' : 'none',
  WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'none',
  borderBottom: scrolled ? '1px solid rgba(15,23,42,0.08)' : '1px solid #e2e8f0',
  boxShadow: scrolled ? '0 4px 20px -8px rgba(15,23,42,0.10)' : 'none',
  position: 'sticky',
  top: 0,
  zIndex: 50,
  height: 72,
  transition: 'background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
}}>
```

- [ ] **Step 3: Logo size for the taller header**

Bump the logo `height` from `44` to `48` in the logo `<img>` (keeps proportion with the new 72px header).

- [ ] **Step 4: Stronger CTA button**

The "List Your Company" desktop `<Link>` (~line 282) currently uses `#F5A623`/`#D48E1A` inline colors with hover handlers that mutate `e.currentTarget.style`. Update the hex values to the new gold tokens and add the scale interaction. Replace the color values (`backgroundColor: '#F5A623'` → `'#D4A017'`, hover `backgroundColor: '#D48E1A'` → `'#A87A0F'`, `color: '#1A2E4A'` → `'#0F172A'`) and extend the existing `onMouseEnter`/`onMouseLeave` handlers to also set `e.currentTarget.style.transform = 'scale(1.02)'` / `'scale(1)'`, keeping the existing `boxShadow` mutation logic (just update its rgba color from `245,166,35` to `212,160,23`). Do the same hex swap in the mobile CTA button (~line 419) and the mega-menu "Browse all categories" link's hover text color (`#1A2E4A` → `#0F172A`, ~line 219).

- [ ] **Step 5: Contact/search link hover — add underline utility where text-only**

No structural change needed here; skip if the existing padded-pill hover treatment already reads as polished — do not over-engineer link-underline onto icon-only or pill-background nav items. (This step exists to explicitly confirm: `.link-underline` from Task 1 is for footer text links in Step 7, not the nav pills.)

- [ ] **Step 6: Footer background — near-black**

Change the `<footer>` style (~line 447) `backgroundColor` from `'#f8fafc'` to `'#0B0F17'`, and `borderTop` from `'1px solid #e2e8f0'` to `'1px solid rgba(255,255,255,0.08)'`. Update all footer text colors for contrast against the dark background:
- Brand tagline (`fontSize: 15, fontWeight: 600, color: '#0f172a'`, ~line 456) → `color: '#F9FAFB'`
- Brand description (`color: '#64748b'`, ~line 459) → `color: '#9CA3AF'`
- `FooterCol` heading (`color: '#0f172a'`, ~line 531) → `color: '#F9FAFB'`
- `FooterCol` link default (`color: '#64748b'`, ~line 539) → `color: '#9CA3AF'`, hover (`color: '#0f172a'`, ~line 540) → `color: '#D4A017'` (gold on hover — this is the one place gold-as-interactive-accent belongs in the footer)
- Bottom bar copyright/links (`color: '#94a3b8'`, ~lines 489-498) → `color: '#6B7280'` default, hover → `color: '#D4A017'`
- Bottom bar border (`borderTop: '1px solid #e2e8f0'`, ~line 481) → `'1px solid rgba(255,255,255,0.08)'`

Add `className="link-underline"` to the four `FooterCol` link `<Link>` elements (the `.map` in the `FooterCol` function) and the two bottom-bar `Link`s (`Terms of Service`, `Privacy Policy`), since these are the plain text links Step 5 deferred to here.

**Report file:** write your full report to `.superpowers/sdd/task-2-report.md`.

**Verification:** `npm run lint` and `npm run build` must pass. Manually confirm (describe what you observed, since there's no automated test): mega-menu still opens/closes on click and click-outside, mobile menu still opens/closes, all links still present with correct `href`s (diff against the original file to confirm no `href` was touched), footer is legibly readable (light text on `#0B0F17`, not low-contrast gray-on-dark-gray).

---

### Task 3: Hero, cards, section rhythm, and micro-interactions in `src/views/DirectoryHub.jsx`

**Files:**
- Modify: `src/views/DirectoryHub.jsx` (full file currently 520 lines)

**Depends on:** Task 1 (`--navy`, `--gold` family, `.card-premium`, `.grid-texture`/`.grid-texture-dark`, `.noise-texture`, `.link-underline`, `.btn-scale`, updated `.text-gradient`/`.btn-gradient` must exist in `src/index.css`).

**Interfaces:**
- No prop/export signature changes. `DirectoryHub()` takes no props and stays a default export with no signature change. `CATEGORIES`, `US_STATES`, `STATS`, `TRUST_STATS` data arrays are read-only reference data — their **values** (labels, slugs, icons) do not change, only how they're styled/rendered. `selectedState`, `showAllCategories` state and their setters keep the same names and behavior.
- Produces: two new small local pieces this task adds — an `AnimatedCounter` component (renders a number that counts up from 0 when scrolled into view, used only by the hero `STATS` cards) and a `useFadeInOnScroll` hook (returns a ref + a boolean class-toggle, applied once per major `<section>`). Both are file-local (defined in this file, not exported), since no other file needs them.

- [ ] **Step 1: Add the `useFadeInOnScroll` hook and `AnimatedCounter` component**

Add these above the `DirectoryHub` component (after the inline icon components `BoltIcon`/`GearIcon`, before `SectionEyebrow`):

```jsx
function useFadeInOnScroll() {
  const ref = React.useRef(null);
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function AnimatedCounter({ value, duration = 1200 }) {
  const ref = React.useRef(null);
  const [display, setDisplay] = useState('0');
  const [started, setStarted] = useState(false);

  const numericMatch = String(value).match(/[\d.]+/);
  const numericTarget = numericMatch ? parseFloat(numericMatch[0]) : null;
  const prefix = numericMatch ? value.slice(0, numericMatch.index) : '';
  const suffix = numericMatch ? value.slice(numericMatch.index + numericMatch[0].length) : '';

  React.useEffect(() => {
    const node = ref.current;
    if (!node || numericTarget === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTime = performance.now();
          function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(numericTarget * eased).toString());
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [numericTarget, duration, started]);

  if (numericTarget === null) {
    return <span ref={ref}>{value}</span>;
  }
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}
```

- [ ] **Step 2: Hero section — background, spacing, texture**

Change the hero `<section>` (currently `className="bg-white border-b border-slate-200 py-20 sm:py-24 lg:py-32"`) to use the off-white page background, tighten vertical padding slightly (per brief: "reduce empty white space") and add the blueprint grid + a faint radial gradient for depth:

```jsx
<section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20 lg:py-24" style={{ backgroundColor: 'var(--bg-page)' }}>
  <div className="grid-texture-dark absolute inset-0 opacity-40 pointer-events-none" />
  <div className="absolute -top-40 -left-20 w-[520px] h-[520px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.08), transparent 70%)' }} />
  <div className="absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(15,23,42,0.05), transparent 70%)' }} />
  <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8">
```

(Close the extra wrapping `<div>`s this adds at the end of the hero section — the existing structure already ends the section with two closing `</div></section>`; add one more `</div>` before those to close the new `relative` wrapper. Verify balanced tags with the diff before committing.)

- [ ] **Step 3: Hero badge, heading, paragraph spacing**

In the left column, increase the spacing rhythm between badge → heading → paragraph → trust-row (brief: "increase spacing between badge, heading, paragraph, CTA"). Change `mb-7` on the `<Badge>` to `mb-8`, change the `<h1>`'s `mb-5` to `mb-6` and bump its size slightly (`text-[64px]` → `text-[68px]` at `lg`), change the `<p>`'s `mb-8` to `mb-10` and its `leading-relaxed` stays but add `text-[17px]` (from plain `text-lg`) for a touch more presence. Recolor the `<h1>`'s inline navy span from `text-[#1A2E4A]` to `text-[#0F172A]`. Also swap the badge's blue accent (`bg-blue-50 border-blue-200 text-blue-800`, `bg-blue-600` dot) for a navy/gold treatment: `className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8 font-semibold text-[11px] tracking-wider uppercase"` with `style={{ backgroundColor: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.12)', color: '#0F172A' }}`, and the dot `style={{ backgroundColor: 'var(--gold)' }}` instead of `bg-blue-600`.

- [ ] **Step 4: Hero trust-row icons — gold accent**

The four trust-row items (`CheckCircle`/`Shield`/`Star`/`Package` icons, currently `text-[#F5A623]`) — update to `text-[#D4A017]` (or just remove the hard-coded hex and use the new `.text-gold` utility class from Task 1: `className="w-3.5 h-3.5 text-gold flex-shrink-0"`).

- [ ] **Step 5: Hero stat cards — premium treatment + count-up**

Replace the stats `<Card>` mapping (currently flat `bg-[#FAF7F1] border-slate-200 rounded-xl px-6 py-5 shadow-none`) with the premium card class and `AnimatedCounter`:

```jsx
{STATS.map(({ value, label }) => (
  <Card key={label} className="card-premium rounded-xl px-6 py-5" style={{ backgroundColor: 'var(--bg-surface)' }}>
    <div className="text-3xl font-bold leading-none mb-1 tracking-tight tabular-nums" style={{ color: '#111827' }}>
      <AnimatedCounter value={value} />
    </div>
    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
  </Card>
))}
```

Keep the existing ambient gold blur (`absolute -inset-8 rounded-full bg-[#F5A623]/10 blur-3xl`) but update its color to `bg-[#D4A017]/10`.

- [ ] **Step 6: Category cards — `.card-premium` + animated arrow**

The category `<Card>` mapping (~line 278) currently uses `hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg`. Replace the className with `"card-premium bg-white rounded-2xl p-0 flex flex-col h-full overflow-hidden"` (drop the manual `hover:` utilities now that `.card-premium` owns the hover treatment). The "View all states" link's `ArrowRight` already has `group-hover:translate-x-0.5` — keep that, it already satisfies "animated arrow." Change the top accent bar's color logic: it currently uses each category's Tailwind `dot` class (fine, keep) — no change needed there. Change the section background (~line 264, currently `bg-[#FAF7F1]`) to `style={{ backgroundColor: 'var(--bg-surface)' }}` per the section-rhythm constraint (Categories = white) and remove the now-redundant `bg-[#FAF7F1]` className.

- [ ] **Step 7: Trust section — background + card polish**

Section background (~line 325, currently `bg-white`) → `style={{ backgroundColor: 'var(--bg-cream)' }}` per section-rhythm (Trust = light neutral). The `TRUST_STATS` cards (~line 339, currently `bg-[#FAF7F1]`) → change to `className="card-premium rounded-2xl p-5 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}` so the white cards sit visibly on the cream section background.

- [ ] **Step 8: Bold Statement section — the centerpiece**

Replace the section's background/effects (~line 352, currently `bg-[#211F1C]` with one blur glow) with the deep navy gradient, grid texture, noise, and a stronger radial glow, and bump the typography size per the brief ("larger typography," "stronger spacing"):

```jsx
<section className="grid-texture noise-texture py-24 sm:py-28 lg:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.12), transparent 70%)' }} />
  <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
    <h2 className="text-[40px] sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02]" style={{ color: 'var(--gold)' }}>
      Zero Paid Rankings.
    </h2>
    <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
      Every company on this list earned its spot through real reviews — nothing else.
    </p>
  </div>
</section>
```

- [ ] **Step 9: How It Works section — background + card polish**

Section background (~line 365, currently `bg-[#FAF7F1]`) → per section-rhythm (Process = white): `style={{ backgroundColor: 'var(--bg-surface)' }}`, remove `bg-[#FAF7F1]` className, keep `border-t border-slate-200`. The three step `<Card>`s (~line 380, currently `bg-white ... shadow-none`) → `className="card-premium rounded-2xl p-7"` (drop `shadow-none` and the plain `bg-white`, letting `.card-premium` own both background-implicit-white via the Card component's default and the shadow).

- [ ] **Step 10: States panel — background**

Section background (~line 393, currently `bg-white`) → per section-rhythm (States = warm neutral): `style={{ backgroundColor: 'var(--bg-surface-alt)' }}`. Inside, the state-list `ScrollArea` currently has `bg-[#FAF7F1]` (~line 411) — change to `style={{ backgroundColor: 'var(--bg-cream)' }}` so it still reads as a distinct inset panel against the new warmer section background. No other structural change — the active-state gold-left-border treatment (`border-l-[#F5A623]`, ~line 424) updates to `border-l-[#D4A017]`.

- [ ] **Step 11: CTA band — match the Statement section's navy treatment**

Replace the CTA section's background (~line 478, currently `bg-[#1A2E4A]` with two blur orbs in `orange-500`/`indigo-500`) with the same gradient family as Step 8, for the two dark sections to read as one system:

```jsx
<section className="grid-texture py-20 sm:py-24 lg:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
  <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.10), transparent 70%)' }} />
```

Remove the old `linear-gradient(#fff 1px,...)` inline grid `<div>` (now redundant with the `.grid-texture` className). Update the gold CTA button's hex values (`bg-[#F5A623] hover:bg-[#D48E1A]`, box-shadow `rgba(245,166,35,...)`) to the new gold (`bg-[#D4A017] hover:bg-[#A87A0F]`, box-shadow `rgba(212,160,23,...)`) and add `className="... btn-scale"` to it.

- [ ] **Step 12: Fade-up on scroll for each major section**

Apply `useFadeInOnScroll` to each of the 7 major `<section>` elements (hero, categories, trust, statement, how-it-works, states, CTA). For each, wire the hook's ref onto the section and toggle a class based on `visible`:

```jsx
const [heroRef, heroVisible] = useFadeInOnScroll();
// ...one per section, named for its section (categoriesRef, trustRef, statementRef, howRef, statesRef, ctaRef)
```

Add `ref={sectionRef}` and a conditional className fragment to each `<section>` tag: `` className={`... transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} ``. **Exception:** do NOT apply this to the hero section — the hero must render fully visible immediately (no fade-in on initial load; users should see the "strongest section on the page" instantly, not wait on a scroll-triggered fade). Apply it only to the 6 sections below the fold.

- [ ] **Step 13: Section-level link underline accents**

The "View all states" (category cards), "See all manufacturers in {state}" (states panel), and "Contact Us" (CTA band) inline text links already have `group-hover:translate-x-0.5` arrow motion — leave those as-is (that's the "animated arrow" requirement, already satisfied, do not stack `.link-underline` on top of them or it becomes two competing hover effects). Do not add `.link-underline` anywhere in this file — it's reserved for the footer's plain link lists per Task 2, where there's no arrow icon to carry the hover affordance.

**Report file:** write your full report to `.superpowers/sdd/task-3-report.md`.

**Verification:** `npm run lint` and `npm run build` must pass. Manually run `npm run dev`, load `/`, and confirm: hero renders with visible grid texture and radial glows (not a plain flat background), the 4 stat numbers count up once on load/scroll-into-view and land on the correct final value (compare against the `STATS` array's `value` strings), category cards lift on hover, the "Zero Paid Rankings" section is dark navy (not near-black) with visible (subtle) grid+noise texture, the state picker (`selectedState`) still switches the right-panel category list correctly, the "View more categories" toggle (`showAllCategories`) still works, and no layout shift/overlap was introduced (compare section order against `git diff` — only styling/className/style attributes and the two new local helpers should differ, no JSX elements added/removed/reordered besides what each step explicitly specifies).
