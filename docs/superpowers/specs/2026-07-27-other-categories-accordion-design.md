# Other Categories card: expand-in-place accordion + hydration flash fix

Date: 2026-07-27

## Problem

On category/state listing pages, the "Other Categories" sidebar card
(`src/components/listing/OtherCategoriesCard.jsx`) shows a list of all
manufacturing categories. Clicking any non-active category row navigates
immediately to that category's page. To see a category's subcategories, the
user has to land on that category's page first, scroll back down to the
card, and only then see the chips — the subcategories are never visible
in-place for a category the user hasn't navigated to yet.

Separately, the top filter bar's "All subcategories" `<Select>` trigger
(`src/components/listing/FilterBar.jsx`) visibly collapses to a bare chevron
icon for a brief moment during client hydration before snapping to its full
bordered/labelled size. Confirmed as a transient flash, not a persistent
layout bug.

## Desired behavior

**Other Categories accordion:**
- Clicking a category row that is *not* currently expanded expands it
  in-place (shows its subcategory chips) and does **not** navigate.
  Only one category is expanded at a time — expanding a new one collapses
  whichever was previously expanded.
- Clicking a category row that *is already* expanded navigates normally to
  that category's page (`/category` or `/category/state`), i.e. the
  existing `Link` behavior.
- The active/current category (the one matching the page being viewed)
  starts pre-expanded, same as today.
- Subcategory chips themselves always navigate directly to their
  specialization page, unchanged.
- The "View N more" chip-overflow toggle is unaffected.

**Filter bar hydration flash:**
- Give the "All subcategories" `SelectTrigger` explicit `minWidth`/
  `minHeight` inline so it reserves its final footprint on first paint,
  instead of rendering collapsed until Radix finishes mounting.

## Non-goals

- No category→industry / subcategory→specialization renaming (parked).
- No visual/style changes to the card or chips — only click semantics and
  the trigger's reserved size.
- No changes to the subcategory-hub page branch (which doesn't render this
  card today).

## Implementation notes

- `OtherCategoriesCard` becomes stateful over `expandedSlug` (already a
  client component, no new component needed).
- Category rows change from a plain `<Link>` to a `<Link>` with an `onClick`
  handler that conditionally calls `preventDefault()` based on whether
  `slug === expandedSlug`.
- `FilterBar`'s `SelectTrigger` gets `minWidth`/`minHeight` added to its
  existing inline `style` object.
