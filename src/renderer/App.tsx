import React, { useState } from 'react'
import InputForm from './components/InputForm'
import ProjectionChart from './components/ProjectionChart'
import { projectBalancesAndExpenses, findRetirementYear } from "@/calc/projections";

export default function App() {
  const [entries, setEntries] = useState<any[] | null>(null)

  function handleRun(opts: any) {
    const withdrawalMultiple = opts.withdrawalRate ? 1 / Math.max(0.0001, opts.withdrawalRate) : 25
    const res = projectBalancesAndExpenses({ ...opts, withdrawalMultiple })
    setEntries(res)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Endeavor — Retirement Projection</h1>
      <InputForm onRun={handleRun} />
      {entries && (
        <div style={{ marginTop: 20 }}>
          <ProjectionChart entries={entries} retirement={findRetirementYear(entries)} />
          <div style={{ marginTop: 10 }}>
            {(() => {
              const r = findRetirementYear(entries)
              if (r.year !== undefined && r.requiredAssets !== undefined) {
                return (
                  <div>
                    Estimated retirement year: <b>{r.year.toFixed(1)}</b> (required assets: ${r.requiredAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                    {r.worstCaseYear !== undefined && r.worstCaseRequiredAssets !== undefined && (
                      <div>
                        Worst-case retirement year: <b>{r.worstCaseYear.toFixed(1)}</b> (required assets: ${r.worstCaseRequiredAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                      </div>
                    )}
                  </div>
                )
              }
              return <div>Retirement not reached in projection horizon</div>
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
