// Run: node src/lib/stateNeighbors.test.mjs
import assert from 'node:assert/strict';
import { STATE_NEIGHBORS, getBorderingStates } from './stateNeighbors.js';
import { ALL_US_STATES } from './usStates.js';

assert.deepEqual(Object.keys(STATE_NEIGHBORS).sort(), ALL_US_STATES.map((s) => s.slug).sort());
for (const [state, list] of Object.entries(STATE_NEIGHBORS)) {
  for (const n of list) assert.ok(STATE_NEIGHBORS[n]?.includes(state), `${state} -> ${n} is not mutual`);
}
assert.deepEqual(getBorderingStates('texas').map((s) => s.name), ['Arkansas', 'Louisiana', 'New Mexico', 'Oklahoma']);
assert.deepEqual(getBorderingStates('montana').map((s) => s.slug), ['idaho', 'north-dakota', 'south-dakota', 'wyoming']);
assert.deepEqual(getBorderingStates('hawaii'), []);
assert.deepEqual(getBorderingStates('nowhere'), []);
console.log('ok: state neighbors');
