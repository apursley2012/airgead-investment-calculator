/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: calculator.test.mjs Regression tests for browser calculation,     |
  |          storage, and CSV helpers.                                         |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/
import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { calculateCompoundInterest } from '../js/lib/calculator.js';
import {
  saveCurrentCalculation,
  getCurrentCalculation,
  getSavedPlans,
  setSavedPlans,
  createSavedPlanId,
  SAVED_PLANS_STORAGE_KEY
} from '../js/lib/plan-storage.js';
import { downloadCsv } from '../js/lib/csv-export.js';

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => { values.set(key, value); }
};
afterEach(() => values.clear());

test('deposit precedes monthly interest', () => {
  const rows = calculateCompoundInterest({
    startingBalance: 0, monthlyDeposit: 100, annualRate: 12, years: 1
  });
  assert.equal(rows.length, 2);
  assert.equal(rows[1].withDeposits, 1280.93);
  assert.equal(rows[1].withoutDeposits, 0);
  assert.equal(rows[1].totalDeposits, 1200);
});

test('zero years and negative inputs normalize safely', () => {
  const rows = calculateCompoundInterest({
    startingBalance: -5, monthlyDeposit: -2, annualRate: -3, years: 0
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].withDeposits, 0);
});

test('years capped at 80', () => {
  assert.equal(calculateCompoundInterest({
    startingBalance: 1, monthlyDeposit: 0, annualRate: 0, years: 999
  }).length, 81);
});

test('current calculation persists and rejects corrupt JSON', () => {
  const inputs = { startingBalance: 0, monthlyDeposit: 0, annualRate: 0, years: 0 };
  const results = calculateCompoundInterest(inputs);
  assert.equal(saveCurrentCalculation(inputs, results), true);
  assert.deepEqual(getCurrentCalculation().results, results);
  values.set('airgead_current_calc', '{invalid');
  assert.equal(getCurrentCalculation(), null);
});

test('saved plans filter invalid records', () => {
  const inputs = { startingBalance: 0, monthlyDeposit: 0, annualRate: 0, years: 0 };
  const data = { inputs, results: calculateCompoundInterest(inputs) };
  const good = { id: 'one', name: 'Plan', date: '2026-01-01', data };
  assert.equal(setSavedPlans([good, { id: 4 }]), false);
  assert.equal(values.has('airgead_saved_plans'), false);
  // Older browser data may still contain invalid entries; preserve valid ones.
  values.set('airgead_saved_plans', JSON.stringify([good, { id: 4 }]));
  assert.deepEqual(getSavedPlans(), [good]);
  values.set('airgead_saved_plans', 'not-json');
  assert.deepEqual(getSavedPlans(), []);
});

test('CSV protects formulas including leading whitespace and preserves ordinary cells', async () => {
  let blob;
  let revoked = false;
  const originalURL = globalThis.URL;
  const originalDocument = globalThis.document;
  globalThis.URL = {
    createObjectURL: item => { blob = item; return 'blob:example'; },
    revokeObjectURL: () => { revoked = true; }
  };
  globalThis.document = {
    body: { appendChild: () => { } },
    createElement: () => ({ click() { }, remove() { } })
  };
  try {
    downloadCsv('report.csv', [
      ['=SUM(1,1)', '\t+1', '\r-2', '\n@X', ' regular', 'a"b']
    ]);
    const csv = await blob.text();
    assert.match(csv, /"'=SUM\(1,1\)"/);
    assert.ok(csv.includes('"\'\t+1"'));
    assert.ok(csv.includes('"\'\r-2"'));
    assert.ok(csv.includes('"\'\n@X"'));
    assert.ok(csv.includes('" regular"'));
    assert.ok(csv.includes('"a""b"'));
    assert.equal(revoked, true);
  } finally {
    globalThis.URL = originalURL;
    globalThis.document = originalDocument;
  }
});

test('saved-plan IDs remain unique when saves share a timestamp', () => {
  assert.equal(createSavedPlanId([], 12345), '12345');
  assert.equal(createSavedPlanId([{ id: '12345' }], 12345), '12346');
  assert.equal(
    createSavedPlanId([{ id: '12345' }, { id: '12346' }], 12345),
    '12347'
  );
});

test('unrepresentable projections are rejected rather than stored as invalid results', () => {
  assert.throws(
    () => calculateCompoundInterest({
      startingBalance: 5000, monthlyDeposit: 250, annualRate: 1000000, years: 20
    }),
    RangeError
  );
  assert.throws(
    () => calculateCompoundInterest({
      startingBalance: 1e307, monthlyDeposit: 1, annualRate: 0, years: 1
    }),
    RangeError
  );
});

test('twenty-year totals preserve the original C++ investment results', () => {
  const rows = calculateCompoundInterest({
    startingBalance: 5000, monthlyDeposit: 250, annualRate: 5, years: 20
  });
  assert.equal(rows.length, 21);
  assert.deepEqual(rows.at(-1), {
    year: 20,
    withDeposits: 116749.78,
    withoutDeposits: 13563.2,
    totalDeposits: 65000,
    interestEarned: 51749.78,
    withDepositsYearlyInterest: 5614.89,
    withoutDepositsYearlyInterest: 660.14
  });
});


test('malformed numeric inputs fail clearly without changing valid-value clamping', () => {
  const base = {
    startingBalance: '1000', monthlyDeposit: '100',
    annualRate: '5', years: '10'
  };
  for (const inputs of [
    { ...base, startingBalance: '' },
    { ...base, monthlyDeposit: '25abc' },
    { ...base, annualRate: null },
    { ...base, years: '1.5' },
    { ...base, years: '2 years' },
    { ...base, startingBalance: '0x10' },
    { ...base, annualRate: Infinity }
  ]) {
    assert.throws(() => calculateCompoundInterest(inputs), RangeError);
  }
  assert.throws(() => calculateCompoundInterest(null), RangeError);
  assert.equal(calculateCompoundInterest(base).length, 11);
});

test('currency values beyond reliable cent precision are rejected', () => {
  assert.throws(
    () => calculateCompoundInterest({
      startingBalance: 1e15, monthlyDeposit: 0,
      annualRate: 0, years: 1
    }),
    RangeError
  );
});

test('stored calculation rejects malformed rows and mismatched year counts', () => {
  const inputs = {
    startingBalance: 1000, monthlyDeposit: 100,
    annualRate: 5, years: 1
  };
  const results = calculateCompoundInterest(inputs);
  const corrupted = [
    { inputs, results: [{ ...results[0], year: 3 }, results[1]] },
    { inputs, results: results.slice(0, 1) },
    { inputs, results: [{ ...results[0], totalDeposits: '1000' }, results[1]] },
    { inputs: { ...inputs, years: 'bad' }, results }
  ];
  for (const data of corrupted) {
    values.set('airgead_current_calc', JSON.stringify(data));
    assert.equal(getCurrentCalculation(), null);
  }
});

test('saved plans reject corrupted dates, invalid names, and duplicate IDs', () => {
  const inputs = {
    startingBalance: 1000, monthlyDeposit: 100,
    annualRate: 5, years: 1
  };
  const data = { inputs, results: calculateCompoundInterest(inputs) };
  const good = { id: 'same', name: 'Savings', date: '2026-01-01', data };
  const corruptPlans = [
    good, { ...good }, { ...good, id: 'different', date: 'not-a-date' },
    { ...good, id: 'another', name: '' }
  ];
  assert.equal(setSavedPlans(corruptPlans), false);
  values.set('airgead_saved_plans', JSON.stringify(corruptPlans));
  assert.deepEqual(getSavedPlans(), [good]);
});

test('tampered financial totals are rejected from current and saved records', () => {
  const inputs = { startingBalance: 1000, monthlyDeposit: 100, annualRate: 5, years: 1 };
  const results = calculateCompoundInterest(inputs);
  const modified = results.map(row => ({ ...row }));
  modified[1].interestEarned += 500;
  assert.equal(saveCurrentCalculation(inputs, modified), false);
  assert.equal(values.has('airgead_current_calc'), false);

  values.set('airgead_current_calc', JSON.stringify({ inputs, results: modified }));
  assert.equal(getCurrentCalculation(), null);

  const record = {
    id: 'valid', name: 'Accurate', date: '2026-05-01',
    data: { inputs, results }
  };
  const tampered = {
    ...record, id: 'tampered',
    data: { inputs, results: modified }
  };
  assert.equal(setSavedPlans([record, tampered]), false);
  values.set('airgead_saved_plans', JSON.stringify([record, tampered]));
  assert.deepEqual(getSavedPlans(), [record]);
});

test('persisting invalid or duplicate plan records fails without overwriting storage', () => {
  const inputs = { startingBalance: 5000, monthlyDeposit: 250, annualRate: 5, years: 20 };
  const data = { inputs, results: calculateCompoundInterest(inputs) };
  const plan = { id: 'first', name: 'Example', date: '2026-05-01', data };
  assert.equal(setSavedPlans([plan]), true);
  const unchanged = values.get('airgead_saved_plans');
  assert.equal(setSavedPlans([plan, plan]), false);
  assert.equal(setSavedPlans('not an array'), false);
  assert.equal(values.get('airgead_saved_plans'), unchanged);
});

test('loaded data must match the calculated year-zero and yearly rows', () => {
  const inputs = { startingBalance: 500, monthlyDeposit: 50, annualRate: 2, years: 2 };
  const rows = calculateCompoundInterest(inputs);
  const changed = structuredClone(rows);
  changed[0].withoutDeposits += 1;
  values.set('airgead_current_calc', JSON.stringify({ inputs, results: changed }));
  assert.equal(getCurrentCalculation(), null);
  const missingInterest = structuredClone(rows);
  delete missingInterest[1].withDepositsYearlyInterest;
  values.set('airgead_current_calc', JSON.stringify({ inputs, results: missingInterest }));
  assert.equal(getCurrentCalculation(), null);
});

test('CSV treats Unicode whitespace before formula operators as text', async () => {
  let blob;
  const originalURL = globalThis.URL;
  const originalDocument = globalThis.document;
  globalThis.URL = {
    createObjectURL: item => { blob = item; return 'blob:example'; },
    revokeObjectURL: () => { }
  };
  globalThis.document = {
    body: { appendChild: () => { } },
    createElement: () => ({ click() { }, remove() { } })
  };
  try {
    downloadCsv('example.csv', [['\uFEFF=1+1', '\u00a0@cmd', 'ordinary']]);
    const text = await blob.text();
    assert.ok(text.includes('"\'\uFEFF=1+1"'));
    assert.ok(text.includes('"\'\u00a0@cmd"'));
    assert.ok(text.includes('"ordinary"'));
  } finally {
    globalThis.URL = originalURL;
    globalThis.document = originalDocument;
  }
});

test('unavailable browser storage fails safely without exposing stored data', () => {
  const inputs = { startingBalance: 1000, monthlyDeposit: 100, annualRate: 5, years: 1 };
  const results = calculateCompoundInterest(inputs);
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;

  localStorage.setItem = () => { throw new Error('Storage quota exceeded'); };
  localStorage.getItem = () => { throw new Error('Storage access denied'); };
  try {
    assert.equal(saveCurrentCalculation(inputs, results), false);
    assert.equal(setSavedPlans([]), false);
    assert.equal(getCurrentCalculation(), null);
    assert.deepEqual(getSavedPlans(), []);
  } finally {
    localStorage.setItem = originalSetItem;
    localStorage.getItem = originalGetItem;
  }
});

test('stored input values cannot hide negative balances or clamped years', () => {
  const normalized = { startingBalance: 1000, monthlyDeposit: 25, annualRate: 5, years: 80 };
  const withHiddenYear = { ...normalized, years: 999 };
  const withHiddenNegative = { ...normalized, monthlyDeposit: -25 };
  assert.equal(
    saveCurrentCalculation(withHiddenYear, calculateCompoundInterest(withHiddenYear)),
    false
  );
  assert.equal(
    saveCurrentCalculation(withHiddenNegative, calculateCompoundInterest(withHiddenNegative)),
    false
  );
  assert.equal(saveCurrentCalculation(normalized, calculateCompoundInterest(normalized)), true);
});


test('zero interest separates contributions from earned interest across years', () => {
  const rows = calculateCompoundInterest({
    startingBalance: 500, monthlyDeposit: 25, annualRate: 0, years: 3
  });
  assert.equal(rows.length, 4);
  for (const row of rows) {
    assert.equal(row.withDeposits, 500 + row.year * 12 * 25);
    assert.equal(row.withoutDeposits, 500);
    assert.equal(row.totalDeposits, row.withDeposits);
    assert.equal(row.interestEarned, 0);
    assert.equal(row.withDepositsYearlyInterest, 0);
    assert.equal(row.withoutDepositsYearlyInterest, 0);
  }
});

test('zero monthly deposits give identical projections and no additional principal', () => {
  const rows = calculateCompoundInterest({
    startingBalance: 1234.56, monthlyDeposit: 0,
    annualRate: 5.25, years: 7
  });
  assert.equal(rows.length, 8);
  for (const row of rows) {
    assert.equal(row.withDeposits, row.withoutDeposits);
    assert.equal(row.withDepositsYearlyInterest, row.withoutDepositsYearlyInterest);
    assert.equal(row.totalDeposits, 1234.56);
  }
});

test('financial inputs reject missing, fractional, and non-finite values', () => {
  const base = {
    startingBalance: 100, monthlyDeposit: 10, annualRate: 1, years: 1
  };
  for (const inputs of [
    { ...base, startingBalance: undefined },
    { ...base, annualRate: NaN },
    { ...base, monthlyDeposit: '12,5' },
    { ...base, years: 1.1 },
    { ...base, years: Infinity },
    { ...base, startingBalance: {} }
  ]) {
    assert.throws(() => calculateCompoundInterest(inputs), RangeError);
  }
});

test('saved plans retain Unicode names and reject tampered annual results', () => {
  const inputs = {
    startingBalance: 150, monthlyDeposit: 15,
    annualRate: 3, years: 2
  };
  const results = calculateCompoundInterest(inputs);
  const plan = {
    id: 'unicode-1', name: 'Épargne 日本語 😊',
    date: '2026-10-01T12:00:00.000Z',
    data: { inputs, results }
  };
  assert.equal(setSavedPlans([plan]), true);
  assert.deepEqual(getSavedPlans(), [plan]);
  const tampered = structuredClone(results);
  tampered[2].withoutDepositsYearlyInterest += 1;
  values.set('airgead_saved_plans',
    JSON.stringify([{ ...plan, data: { inputs, results: tampered } }]));
  assert.deepEqual(getSavedPlans(), []);
});

test('CSV export escapes commas, quotes, newlines, and empty cells', async () => {
  let blob;
  let removed = false;
  let revoked = false;
  const oldURL = globalThis.URL;
  const oldDocument = globalThis.document;
  globalThis.URL = {
    createObjectURL: item => { blob = item; return 'blob:csv-test'; },
    revokeObjectURL: () => { revoked = true; }
  };
  globalThis.document = {
    body: { appendChild: () => { } },
    createElement: () => ({
      click() { },
      remove() { removed = true; }
    })
  };
  try {
    downloadCsv('results.csv', [
      ['Year', 'Notes', 'Amount'],
      [1, 'a,b', 10],
      [2, 'quote "here"', ''],
      [3, 'line\nbreak', 'é']
    ]);
    const csv = await blob.text();
    assert.equal(csv,
      '"Year","Notes","Amount"\n' +
      '"1","a,b","10"\n' +
      '"2","quote ""here""",""\n' +
      '"3","line\nbreak","é"');
    assert.equal(removed, true);
    assert.equal(revoked, true);
  } finally {
    globalThis.URL = oldURL;
    globalThis.document = oldDocument;
  }
});

test('saved-plan storage key stays consistent with persisted records', () => {
  assert.equal(SAVED_PLANS_STORAGE_KEY, 'airgead_saved_plans');
  const inputs = {
    startingBalance: 1000, monthlyDeposit: 100, annualRate: 5, years: 1
  };
  const results = calculateCompoundInterest(inputs);
  const plan = {
    id: 'storage-key-check',
    name: 'Storage key check',
    date: '2026-11-05T00:00:00.000Z',
    data: { inputs, results }
  };
  assert.equal(setSavedPlans([plan]), true);
  assert.ok(values.has(SAVED_PLANS_STORAGE_KEY));
  assert.deepEqual(getSavedPlans(), [plan]);
});
