export type Frequency = 'monthly' | 'yearly' | 'none';

export interface ProjectionOptions {
  currentBalance: number;
  annualRate: number; // e.g., 0.06 for 6%
  monthlyContribution?: number; // currency per month
  annualContribution?: number; // alternative to monthly
  years: number; // projection horizon in years
  currentMonthlyExpense?: number; // currency per month
  inflationRate?: number; // e.g., 0.02 for 2%
  withdrawalMultiple?: number; // e.g., 25 means 4% rule
  deviationPercent?: number; // e.g., 2 for ±2% on return
  deviationPercentInflation?: number; // e.g., 1 for ±1% on inflation
}

export interface YearEntry {
  year: number; // 0 = now, 1 = end of year 1, ...
  balance: number;
  lowBalance?: number;
  highBalance?: number;
  contributions: number;
  interest: number;
  annualExpense: number; // projected annual expense at this year
  requiredAssets: number; // annualExpense * withdrawalMultiple
  lowRequiredAssets?: number;
  highRequiredAssets?: number;
  monthlyBalances?: number[]; // balances at end of each month within this year
  monthlyLowBalances?: number[]; // low balances at end of each month
  monthlyHighBalances?: number[]; // high balances at end of each month
  monthlyRequired?: number[]; // required assets at each month end in this year
  monthlyLowRequired?: number[];
  monthlyHighRequired?: number[];
}

export function projectBalancesAndExpenses(opts: ProjectionOptions): YearEntry[] {
  const years = Math.max(0, Math.floor(opts.years));
  const annualRate = opts.annualRate || 0;
  const deviationPercent = opts.deviationPercent || 0;
  const lowRate = annualRate - (deviationPercent / 100);
  const highRate = annualRate + (deviationPercent / 100);
  const inflation = opts.inflationRate || 0;
  const deviationPercentInflation = opts.deviationPercentInflation || 0;
  const lowInflation = inflation - (deviationPercentInflation / 100);
  const highInflation = inflation + (deviationPercentInflation / 100);
  const monthlyContribution = (typeof opts.monthlyContribution === 'number')
    ? opts.monthlyContribution
    : (opts.annualContribution ? opts.annualContribution / 12 : 0);
  const withdrawalMultiple = opts.withdrawalMultiple || 25;

  const monthlyRate = annualRate / 12;
  const monthlyLowRate = lowRate / 12;
  const monthlyHighRate = highRate / 12;
  const entries: YearEntry[] = [];

  let balance = Math.max(0, opts.currentBalance || 0);
  let lowBalance = balance;
  let highBalance = balance;

  for (let y = 0; y <= years; y++) {
    // compute projected annual expense at start of year y
    const annualExpense = (opts.currentMonthlyExpense || 0) * 12 * Math.pow(1 + inflation, y);
    const lowAnnualExpense = (opts.currentMonthlyExpense || 0) * 12 * Math.pow(1 + lowInflation, y);
    const highAnnualExpense = (opts.currentMonthlyExpense || 0) * 12 * Math.pow(1 + highInflation, y);
    const requiredAssets = annualExpense * withdrawalMultiple;
    const lowRequiredAssets = lowAnnualExpense * withdrawalMultiple;
    const highRequiredAssets = highAnnualExpense * withdrawalMultiple;

    if (y === 0) {
      entries.push({ year: 0, balance, lowBalance, highBalance, contributions: 0, interest: 0, annualExpense, requiredAssets, lowRequiredAssets, highRequiredAssets });
      continue;
    }

    let contributionsThisYear = 0;
    let interestThisYear = 0;
    const monthlyBalances: number[] = [];
    const monthlyLowBalances: number[] = [];
    const monthlyHighBalances: number[] = [];
    const monthlyRequired: number[] = [];
    const monthlyLowRequired: number[] = [];
    const monthlyHighRequired: number[] = [];

    // simulate monthly contributions and monthly compounding for the year
    for (let m = 0; m < 12; m++) {
      const contribution = monthlyContribution;
      contributionsThisYear += contribution;

      // Base balance
      balance += contribution;
      const interest = balance * monthlyRate;
      interestThisYear += interest;
      balance += interest;
      monthlyBalances.push(balance);

      // Low balance
      lowBalance += contribution;
      const lowInterest = lowBalance * monthlyLowRate;
      lowBalance += lowInterest;
      monthlyLowBalances.push(lowBalance);

      // High balance
      highBalance += contribution;
      const highInterest = highBalance * monthlyHighRate;
      highBalance += highInterest;
      monthlyHighBalances.push(highBalance);

      const monthFraction = (y - 1) + (m + 1) / 12;
      const monthExpense = (opts.currentMonthlyExpense || 0) * 12 * Math.pow(1 + inflation, monthFraction);
      const lowMonthExpense = (opts.currentMonthlyExpense || 0) * 12 * Math.pow(1 + lowInflation, monthFraction);
      const highMonthExpense = (opts.currentMonthlyExpense || 0) * 12 * Math.pow(1 + highInflation, monthFraction);
      monthlyRequired.push(monthExpense * withdrawalMultiple);
      monthlyLowRequired.push(lowMonthExpense * withdrawalMultiple);
      monthlyHighRequired.push(highMonthExpense * withdrawalMultiple);
    }

    entries.push({ year: y, balance, lowBalance, highBalance, contributions: contributionsThisYear, interest: interestThisYear, annualExpense, requiredAssets, lowRequiredAssets, highRequiredAssets, monthlyBalances, monthlyLowBalances, monthlyHighBalances, monthlyRequired, monthlyLowRequired, monthlyHighRequired });
  }

  return entries;
}

export interface RetirementResult {
  year?: number; // exact year (can be fractional)
  requiredAssets?: number; // exact required assets at intersection
  entry?: YearEntry;
  worstCaseYear?: number;
  worstCaseRequiredAssets?: number;
  worstCaseEntry?: YearEntry;
}

export function findRetirementYear(entries: YearEntry[]): RetirementResult {
  if (!entries || entries.length === 0) {
    return {};
  }

  // Helper function to find intersection between balance series and required series
  const findIntersection = (entries: YearEntry[], getBalance: (e: YearEntry, m?: number) => number, getRequired: (e: YearEntry, m?: number) => number): { year?: number, requiredAssets?: number, entry?: YearEntry } => {
    let prevBalance = getBalance(entries[0]);
    let prevRequired = getRequired(entries[0]);
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      // If monthly balances are available, check month-by-month for an earlier crossing
      if (e.monthlyBalances && e.monthlyRequired && e.monthlyBalances.length > 0) {
        for (var m = 0; m < e.monthlyBalances.length; m++) {
          var monthFraction = (i - 1) + (m + 1) / 12;
          var currentBalance = getBalance(e, m);
          var currentRequired = getRequired(e, m);

          if (currentBalance >= currentRequired) {
            if (prevBalance < prevRequired) {
              var balanceDelta = currentBalance - prevBalance;
              var requiredDelta = currentRequired - prevRequired;
              var t = 0;
              var denom = balanceDelta - requiredDelta;
              if (denom !== 0) {
                t = (prevRequired - prevBalance) / denom;
                t = Math.max(0, Math.min(1, t));
              }
              const exactYear = (i - 1) + (m / 12) + t / 12;
              const exactRequired = prevRequired + t * requiredDelta;
              return { year: exactYear, requiredAssets: exactRequired, entry: e };
            }
            return { year: monthFraction, requiredAssets: currentRequired, entry: e };
          }
          prevBalance = currentBalance;
          prevRequired = currentRequired;
        }
      }

      if (getBalance(e) >= getRequired(e)) {
        return { year: e.year, requiredAssets: getRequired(e), entry: e };
      }

      prevBalance = getBalance(e);
      prevRequired = getRequired(e);
    }
    return {};
  };

  // Base case: balance vs requiredAssets
  const base = findIntersection(entries, (e, m) => m !== undefined ? e.monthlyBalances![m] : e.balance, (e, m) => m !== undefined ? e.monthlyRequired![m] : e.requiredAssets);

  // Worst case: lowBalance vs highRequiredAssets
  const worstCase = findIntersection(entries, (e, m) => m !== undefined ? e.monthlyLowBalances![m] : e.lowBalance!, (e, m) => m !== undefined ? e.monthlyHighRequired![m] : e.highRequiredAssets!);

  return { ...base, worstCaseYear: worstCase.year, worstCaseRequiredAssets: worstCase.requiredAssets, worstCaseEntry: worstCase.entry };
}

export function computeRequiredAssetsFromMonthlyExpense(monthlyExpense: number, inflationRate: number, yearsAhead: number, withdrawalMultiple = 25) {
  const annualExpense = monthlyExpense * 12 * Math.pow(1 + inflationRate, yearsAhead);
  return annualExpense * withdrawalMultiple;
}
