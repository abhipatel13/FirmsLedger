import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEmployeeCount, bucketKeyFor, formatEmployeeLabel, EMPLOYEE_BUCKETS } from './employeeCount.js';

test('parseEmployeeCount extracts the first number, stripping commas', () => {
  assert.equal(parseEmployeeCount('11-50'), 11);
  assert.equal(parseEmployeeCount('1,276'), 1276);
  assert.equal(parseEmployeeCount('1,569-5,000'), 1569);
  assert.equal(parseEmployeeCount('1000+'), 1000);
  assert.equal(parseEmployeeCount('10-49'), 10);
  assert.equal(parseEmployeeCount(''), null);
  assert.equal(parseEmployeeCount(null), null);
  assert.equal(parseEmployeeCount('n/a'), null);
});

test('bucketKeyFor maps numbers to the correct inclusive bucket', () => {
  assert.equal(bucketKeyFor(1), '1-10');
  assert.equal(bucketKeyFor(10), '1-10');
  assert.equal(bucketKeyFor(11), '11-50');
  assert.equal(bucketKeyFor(50), '11-50');
  assert.equal(bucketKeyFor(51), '51-200');
  assert.equal(bucketKeyFor(200), '51-200');
  assert.equal(bucketKeyFor(201), '200+');
  assert.equal(bucketKeyFor(50000), '200+');
  assert.equal(bucketKeyFor(null), null);
});

test('formatEmployeeLabel renders a clean bucket label from messy raw text', () => {
  assert.equal(formatEmployeeLabel('1,569-5,000'), '200+ Employees');
  assert.equal(formatEmployeeLabel('11-50'), '11-50 Employees');
  assert.equal(formatEmployeeLabel(''), null);
  assert.equal(formatEmployeeLabel(null), null);
});

test('EMPLOYEE_BUCKETS has exactly the 4 expected buckets in order', () => {
  assert.deepEqual(EMPLOYEE_BUCKETS.map((b) => b.key), ['1-10', '11-50', '51-200', '200+']);
});
