import { describe, expect, it } from 'vitest'
import { monthlyRate, pricePayment, schedule } from './loan'

describe('loan', () => {
  it('converte taxa anual efetiva em mensal', () => {
    expect(monthlyRate(12.6825)).toBeCloseTo(0.01, 5)
    expect(monthlyRate(0)).toBe(0)
    expect(monthlyRate(NaN)).toBe(0)
  })

  it('parcela Price conhecida: 100 mil, 1% a.m., 12 meses', () => {
    expect(pricePayment(100000, 0.01, 12)).toBeCloseTo(8884.88, 2)
  })

  it('Price com taxa zero divide o valor igualmente', () => {
    expect(pricePayment(12000, 0, 12)).toBe(1000)
  })

  it('Price: parcelas iguais, saldo final zero e amortização soma o principal', () => {
    const s = schedule('price', 100000, 12.6825, 12)
    expect(s.rows).toHaveLength(12)
    expect(s.firstPayment).toBeCloseTo(s.lastPayment, 6)
    expect(s.rows[11].balance).toBe(0)
    expect(s.rows.reduce((a, r) => a + r.amortization, 0)).toBeCloseTo(100000, 4)
  })

  it('SAC: amortização constante e parcelas decrescentes', () => {
    const s = schedule('sac', 100000, 12.6825, 12)
    expect(s.rows[0].amortization).toBeCloseTo(8333.33, 2)
    expect(s.firstPayment).toBeCloseTo(9333.33, 2)
    expect(s.lastPayment).toBeCloseTo(8416.67, 2)
    expect(s.rows[1].payment).toBeLessThan(s.rows[0].payment)
  })

  it('SAC: juros totais = i × PV × (n + 1) ÷ 2', () => {
    const s = schedule('sac', 100000, 12.6825, 12)
    expect(s.totalInterest).toBeCloseTo(6500, 1)
  })

  it('SAC paga menos juros que Price no mesmo prazo', () => {
    const a = schedule('sac', 200000, 11, 240)
    const b = schedule('price', 200000, 11, 240)
    expect(a.totalInterest).toBeLessThan(b.totalInterest)
    expect(a.firstPayment).toBeGreaterThan(b.firstPayment)
  })

  it('entradas inválidas geram cronograma vazio', () => {
    expect(schedule('price', 0, 10, 12).rows).toHaveLength(0)
    expect(schedule('sac', 1000, 10, 0).totalPaid).toBe(0)
  })
})
