/**
 * State groupings for the /locations page. Hardcoded, not DB-driven —
 * these are editorial tiers (major manufacturing hubs vs. everything else),
 * not something that needs to live in the states table for two short lists.
 */

export const TIER1_SLUGS = [
  'ohio', 'michigan', 'texas', 'california', 'illinois',
  'indiana', 'pennsylvania', 'wisconsin', 'north-carolina', 'tennessee',
];

export const TIER2_SLUGS = [
  'georgia', 'alabama', 'south-carolina', 'minnesota', 'connecticut',
  'missouri', 'kansas', 'new-york', 'new-jersey', 'iowa', 'kentucky',
  'virginia', 'oregon', 'washington', 'arizona', 'oklahoma',
  'mississippi', 'arkansas', 'utah', 'louisiana', 'florida',
];
