import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATE_BORDERS, getNeighboringStates } from './seoDescription.js';

test('every border is listed from both sides', () => {
  for (const [state, borders] of Object.entries(STATE_BORDERS)) {
    for (const b of borders) {
      assert.ok(STATE_BORDERS[b], `${b} (border of ${state}) has no entry`);
      assert.ok(STATE_BORDERS[b].includes(state), `${b} does not list ${state}`);
    }
  }
});

test('covers all 50 states', () => {
  assert.equal(Object.keys(STATE_BORDERS).length, 50);
});

test('Montana links to its real neighbours', () => {
  assert.deepEqual(getNeighboringStates('montana').map((s) => s.slug), ['idaho', 'north-dakota', 'south-dakota', 'wyoming']);
});

test('Alaska falls back to its Census region', () => {
  const n = getNeighboringStates('alaska');
  assert.ok(n.length > 0 && !n.some((s) => s.slug === 'alaska'));
});
