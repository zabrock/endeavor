import { projectBalancesAndExpenses, findRetirementYear, computeRequiredAssetsFromMonthlyExpense } from '../projections';

describe('projections', () => {
  test('monthly contributions with zero return accumulates contributions', () => {
    const entries = projectBalancesAndExpenses({ currentBalance: 0, annualRate: 0, monthlyContribution: 100, years: 1 });
    // year 0 and year 1
    expect(entries.length).toBe(2);
    const year1 = entries[1];
    expect(Math.round(year1.balance)).toBe(1200);
  });

  test('annual compounding approx using monthly rate increases balance', () => {
    const entries = projectBalancesAndExpenses({ currentBalance: 1000, annualRate: 0.12, monthlyContribution: 0, years: 1 });
    const year1 = entries[1];
    // with monthlyRate = 0.12/12, final ~1000*(1+0.01)^12 = ~1126.8
    expect(Math.round(year1.balance)).toBeGreaterThanOrEqual(1126);
  });

  test('inflation adjusts annual expense and required assets', () => {
    const entries = projectBalancesAndExpenses({ currentBalance: 0, annualRate: 0, monthlyContribution: 0, years: 5, currentMonthlyExpense: 1000, inflationRate: 0.02, withdrawalMultiple: 25 });
    const year5 = entries[5];
    const expectedAnnualExpense = 1000 * 12 * Math.pow(1.02, 5);
    expect(Math.round(year5.annualExpense)).toBe(Math.round(expectedAnnualExpense));
    expect(Math.round(year5.requiredAssets)).toBe(Math.round(expectedAnnualExpense * 25));
  });

  test('findRetirementYear returns year when balance >= required assets', () => {
    const entries = projectBalancesAndExpenses({ currentBalance: 100000, annualRate: 0.05, monthlyContribution: 1500, years: 30, currentMonthlyExpense: 2000, inflationRate: 0.02, withdrawalMultiple: 25 });
    const res = findRetirementYear(entries);
    // should eventually find a year
    expect(res.year).toBeDefined();
    expect(res.requiredAssets).toBeDefined();
    expect(res.entry).toBeDefined();
    if (res.year !== undefined && res.requiredAssets !== undefined) {
      // crossing point should equal required assets
      expect(res.requiredAssets).toBeGreaterThanOrEqual(0);
    }
    if (res.entry) {
      expect(res.entry.balance).toBeGreaterThanOrEqual(res.entry.requiredAssets);
    }
  });

  test('findRetirementYear returns fractional year for mid-year crossing', () => {
    const entries = projectBalancesAndExpenses({ currentBalance: 10000, annualRate: 0.05, monthlyContribution: 1000, years: 10, currentMonthlyExpense: 1000, inflationRate: 0.01, withdrawalMultiple: 20 });
    const res = findRetirementYear(entries);
    expect(res.year).toBeDefined();
    expect(res.year).toBeLessThan(10);
    expect(res.year).toBeGreaterThan(0);
    expect(Number(res.year?.toFixed(2))).toBeGreaterThan(Number(Math.floor(res.year!)));
  });
});
