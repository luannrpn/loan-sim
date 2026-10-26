export interface Row {
  n: number
  payment: number
  interest: number
  amortization: number
  balance: number
}

export interface Schedule {
  rows: Row[]
  totalPaid: number
  totalInterest: number
  firstPayment: number
  lastPayment: number
}

export type System = 'price' | 'sac'

/** Taxa mensal equivalente a uma taxa anual efetiva (em %). */
export function monthlyRate(annualPct: number): number {
  const a = Math.max(0, Number.isFinite(annualPct) ? annualPct : 0) / 100
  return Math.pow(1 + a, 1 / 12) - 1
}

/** Parcela fixa da Tabela Price. */
export function pricePayment(pv: number, i: number, n: number): number {
  if (n <= 0) return 0
  if (i === 0) return pv / n
  return (pv * i) / (1 - Math.pow(1 + i, -n))
}

function summarize(rows: Row[]): Schedule {
  const totalPaid = rows.reduce((s, r) => s + r.payment, 0)
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0)
  return {
    rows,
    totalPaid,
    totalInterest,
    firstPayment: rows[0]?.payment ?? 0,
    lastPayment: rows[rows.length - 1]?.payment ?? 0,
  }
}

export function schedule(system: System, pv: number, annualPct: number, months: number): Schedule {
  const value = Math.max(0, pv || 0)
  const n = Math.max(0, Math.round(months || 0))
  const i = monthlyRate(annualPct)
  const rows: Row[] = []
  if (!value || !n) return summarize(rows)

  const pmt = pricePayment(value, i, n)
  const fixedAmort = value / n
  let balance = value

  for (let k = 1; k <= n; k++) {
    const interest = balance * i
    const amortization = system === 'price' ? pmt - interest : fixedAmort
    const payment = system === 'price' ? pmt : fixedAmort + interest
    balance = k === n ? 0 : Math.max(0, balance - amortization)
    rows.push({ n: k, payment, interest, amortization, balance })
  }
  return summarize(rows)
}

export const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

export const brlRound = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
