import React from 'react'
import Plot from 'react-plotly.js'

export default function ProjectionChart({ entries, retirement }: { entries: any[], retirement: { year?: number, requiredAssets?: number, entry?: any, worstCaseYear?: number, worstCaseRequiredAssets?: number, worstCaseEntry?: any } }) {
  const years = entries.map(e => e.year)
  const balances = entries.map(e => e.balance)
  const required = entries.map(e => e.requiredAssets)

  // build high-resolution monthly series for smoother intersection visualization
  const monthlyX: number[] = []
  const monthlyBalances: number[] = []
  const monthlyLowBalances: number[] = []
  const monthlyHighBalances: number[] = []
  const monthlyRequired: number[] = []
  const monthlyLowRequired: number[] = []
  const monthlyHighRequired: number[] = []

  monthlyX.push(0)
  monthlyBalances.push(entries[0]?.balance ?? 0)
  monthlyLowBalances.push(entries[0]?.lowBalance ?? 0)
  monthlyHighBalances.push(entries[0]?.highBalance ?? 0)
  monthlyRequired.push(entries[0]?.requiredAssets ?? 0)
  monthlyLowRequired.push(entries[0]?.lowRequiredAssets ?? 0)
  monthlyHighRequired.push(entries[0]?.highRequiredAssets ?? 0)

  entries.forEach((e, index) => {
    if (e.monthlyBalances && e.monthlyLowBalances && e.monthlyHighBalances && e.monthlyRequired && e.monthlyLowRequired && e.monthlyHighRequired) {
      e.monthlyBalances.forEach((mb: number, m: number) => {
        monthlyX.push(index - 1 + (m + 1) / 12)
        monthlyBalances.push(mb)
        monthlyLowBalances.push(e.monthlyLowBalances[m])
        monthlyHighBalances.push(e.monthlyHighBalances[m])
        monthlyRequired.push(e.monthlyRequired[m])
        monthlyLowRequired.push(e.monthlyLowRequired[m])
        monthlyHighRequired.push(e.monthlyHighRequired[m])
      })
    }
  })

  const data = [
    { x: monthlyX, y: monthlyLowBalances, type: 'scatter', mode: 'lines', showlegend: false, line: { color: 'lightblue', width: 0 } },
    { x: monthlyX, y: monthlyHighBalances, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(0,100,255,0.4)', showlegend: false, line: { color: 'lightblue', width: 0 }, name: 'Balance Range' },
    { x: monthlyX, y: monthlyLowRequired, type: 'scatter', mode: 'lines', showlegend: false, line: { color: 'lightcoral', width: 0 } },
    { x: monthlyX, y: monthlyHighRequired, type: 'scatter', mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(255,100,100,0.3)', showlegend: false, line: { color: 'lightcoral', width: 0 }, name: 'Required Assets Range' },
    { x: monthlyX, y: monthlyBalances, type: 'scatter', mode: 'lines', name: 'Balance (Monthly)' },
    { x: monthlyX, y: monthlyRequired, type: 'scatter', mode: 'lines', name: 'Required Assets (Monthly)' },
    { x: years, y: balances, type: 'scatter', mode: 'markers', name: 'Balance (Year End)' },
    { x: years, y: required, type: 'scatter', mode: 'markers', name: 'Required Assets (Year End)' }
  ]

  if (retirement.year !== undefined && retirement.requiredAssets !== undefined) {
    data.push({
      x: [retirement.year],
      y: [retirement.requiredAssets],
      type: 'scatter',
      mode: 'markers',
      marker: { color: 'red', size: 10 },
      name: 'Retirement Point'
    })
  }

  if (retirement.worstCaseYear !== undefined && retirement.worstCaseRequiredAssets !== undefined) {
    data.push({
      x: [retirement.worstCaseYear],
      y: [retirement.worstCaseRequiredAssets],
      type: 'scatter',
      mode: 'markers',
      marker: { color: 'orange', size: 10 },
      name: 'Worst-Case Retirement Point'
    })
  }

  const annotation = retirement.year !== undefined && retirement.requiredAssets !== undefined ? [
    {
      x: retirement.year,
      y: retirement.requiredAssets,
      xref: 'x',
      yref: 'y',
      text: `Retire @ ${retirement.year.toFixed(2)}yr / $${retirement.requiredAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      showarrow: true,
      arrowhead: 2,
      ax: 40,
      ay: -40,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: 'red'
    }
  ] : []

  const worstCaseAnnotation = retirement.worstCaseYear !== undefined && retirement.worstCaseRequiredAssets !== undefined ? [
    {
      x: retirement.worstCaseYear,
      y: retirement.worstCaseRequiredAssets,
      xref: 'x',
      yref: 'y',
      text: `Worst-case @ ${retirement.worstCaseYear.toFixed(2)}yr / $${retirement.worstCaseRequiredAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      showarrow: true,
      arrowhead: 2,
      ax: -40,
      ay: -40,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: 'orange'
    }
  ] : []

  return (
    <Plot
      data={data}
      layout={{ width: 800, height: 420, title: 'Projection', annotations: [...annotation, ...worstCaseAnnotation] }}
    />
  )
}
