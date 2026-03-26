const assert = require('assert');
const { projectBalancesAndExpenses, findRetirementYear, computeRequiredAssetsFromMonthlyExpense } = require('./dist/calc/projections');

function almostEqual(a, b, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

try {
  // Test 1
  let entries = projectBalancesAndExpenses({ currentBalance: 0, annualRate: 0, monthlyContribution: 100, years: 1 });
  assert(entries.length === 2, 'expected 2 entries for years=1');
  let y1 = entries[1];
  assert(Math.round(y1.balance) === 1200, `expected ~1200 got ${y1.balance}`);

  // Test 2
  entries = projectBalancesAndExpenses({ currentBalance: 1000, annualRate: 0.12, monthlyContribution: 0, years: 1 });
  y1 = entries[1];
  assert(Math.round(y1.balance) >= 1126, `expected >=1126 got ${y1.balance}`);

  // Test 3
  entries = projectBalancesAndExpenses({ currentBalance: 0, annualRate: 0, monthlyContribution: 0, years: 5, currentMonthlyExpense: 1000, inflationRate: 0.02, withdrawalMultiple: 25 });
  const year5 = entries[5];
  const expectedAnnualExpense = 1000 * 12 * Math.pow(1.02, 5);
  assert(Math.round(year5.annualExpense) === Math.round(expectedAnnualExpense));
  assert(Math.round(year5.requiredAssets) === Math.round(expectedAnnualExpense * 25));

  // Test 4
  entries = projectBalancesAndExpenses({ currentBalance: 100000, annualRate: 0.05, monthlyContribution: 1500, years: 30, currentMonthlyExpense: 2000, inflationRate: 0.02, withdrawalMultiple: 25 });
  const res = findRetirementYear(entries);
  assert(typeof res.year !== 'undefined', 'expected retirement year to be found');
  assert(res.entry.balance >= res.entry.requiredAssets, 'entry.balance should be >= requiredAssets');

  console.log('All tests passed');
  process.exit(0);
} catch (err) {
  console.error('Test failure:', err.message);
  process.exit(1);
}
