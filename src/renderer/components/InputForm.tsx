import React, { useState } from 'react'

export default function InputForm({ onRun }: { onRun: (opts: any) => void }) {
  const [currentBalance, setCurrentBalance] = useState(100000)
  const [monthlyContribution, setMonthlyContribution] = useState(1500)
  const [annualRate, setAnnualRate] = useState(0.05)
  const [deviationPercent, setDeviationPercent] = useState(2)
  const [years, setYears] = useState(30)
  const [currentMonthlyExpense, setCurrentMonthlyExpense] = useState(2000)
  const [inflationRate, setInflationRate] = useState(0.02)
  const [deviationPercentInflation, setDeviationPercentInflation] = useState(1)
  const [withdrawalRate, setWithdrawalRate] = useState(0.04)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onRun({ currentBalance, monthlyContribution, annualRate, deviationPercent, years, currentMonthlyExpense, inflationRate, deviationPercentInflation, withdrawalRate })
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 800 }}>
      <label>Current balance
        <input type="number" value={currentBalance} onChange={e => setCurrentBalance(Number(e.target.value))} />
      </label>

      <label>Monthly contribution
        <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} />
      </label>

      <label>Annual return (decimal)
        <input step="0.01" type="number" value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))} />
      </label>

      <label>Deviation % (above/below return)
        <input step="0.01" type="number" value={deviationPercent} onChange={e => setDeviationPercent(Number(e.target.value))} />
      </label>

      <label>Projection years
        <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} />
      </label>

      <label>Current monthly expense
        <input type="number" value={currentMonthlyExpense} onChange={e => setCurrentMonthlyExpense(Number(e.target.value))} />
      </label>

      <label>Inflation deviation % (above/below inflation)
        <input step="0.01" type="number" value={deviationPercentInflation} onChange={e => setDeviationPercentInflation(Number(e.target.value))} />
      </label>

      <label>Withdrawal rate (decimal, e.g. 0.04 for 4%)
        <input step="0.005" type="number" value={withdrawalRate} onChange={e => setWithdrawalRate(Number(e.target.value))} />
      </label>

      <div style={{ gridColumn: '1 / -1' }}>
        <button type="submit">Run projection</button>
      </div>
    </form>
  )
}
