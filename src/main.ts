import '@fontsource-variable/instrument-sans'
import './styles/base.css'
import './styles/app.css'
import { brl, brlRound, schedule, type System } from './lib/loan'
import { countTo, initMotion } from './motion'

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const num = (id: string) => parseFloat($<HTMLInputElement>(id).value) || 0

let system: System = 'price'
let expanded = false
const PREVIEW_ROWS = 12

const W = 800
const H = 300
const PAD = { l: 84, r: 8, t: 12, b: 28 }

function path(values: number[], max: number): string {
  if (!values.length) return ''
  const x = (i: number) => PAD.l + (values.length === 1 ? 0 : (i / (values.length - 1)) * (W - PAD.l - PAD.r))
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b)
  return values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
}

function drawChart(sac: number[], price: number[], months: number) {
  const max = Math.max(...sac, ...price, 1)
  $('line-sac').setAttribute('d', path(sac, max))
  $('line-price').setAttribute('d', path(price, max))
  const ticks = [0, 0.5, 1]
  $('grid').innerHTML =
    ticks
      .map((t) => {
        const y = PAD.t + (1 - t) * (H - PAD.t - PAD.b)
        return `<line class="gl" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y}" y2="${y}" /><text x="${PAD.l - 8}" y="${y + 4}" text-anchor="end">${brlRound(max * t)}</text>`
      })
      .join('') +
    `<text x="${PAD.l}" y="${H - 6}">mês 1</text><text x="${W - PAD.r}" y="${H - 6}" text-anchor="end">mês ${months}</text>`
}

function table() {
  const s = schedule(system, financed(), num('rate'), num('months'))
  const rows = expanded ? s.rows : s.rows.slice(0, PREVIEW_ROWS)
  $('amort').innerHTML =
    '<thead><tr><th scope="col">Parcela</th><th scope="col">Valor</th><th scope="col">Juros</th><th scope="col">Amortização</th><th scope="col">Saldo devedor</th></tr></thead><tbody>' +
    rows
      .map(
        (r) =>
          `<tr><td>${r.n}</td><td>${brl(r.payment)}</td><td>${brl(r.interest)}</td><td>${brl(r.amortization)}</td><td>${brl(r.balance)}</td></tr>`,
      )
      .join('') +
    '</tbody>'
  const more = $('more')
  more.hidden = s.rows.length <= PREVIEW_ROWS
  more.textContent = expanded ? 'Mostrar só as 12 primeiras' : `Ver todas as ${s.rows.length} parcelas`
}

function financed() {
  return Math.max(0, num('value') - num('down'))
}

function update() {
  const pv = financed()
  const rate = num('rate')
  const months = num('months')
  $('rate-out').textContent = `${rate.toFixed(1).replace('.', ',')}%`
  $('months-out').textContent = `${months} meses`

  countTo($('financed'), pv, brlRound)
  const down = num('down')
  const value = num('value')
  $('financed-sub').textContent = value
    ? down > value
      ? 'A entrada é maior que o valor do bem.'
      : `Entrada de ${((down / value) * 100).toFixed(0)}% do valor do bem.`
    : ''

  const price = schedule('price', pv, rate, months)
  const sac = schedule('sac', pv, rate, months)
  const sacCheaper = sac.totalInterest < price.totalInterest

  const card = (name: string, s: typeof price, best: boolean) => `
    <div class="sys ${best ? 'best' : ''}">
      <h3>${name}${best ? '<span class="tag">menos juros</span>' : ''}</h3>
      <dl>
        <div><dt>1ª parcela</dt><dd>${brl(s.firstPayment)}</dd></div>
        <div><dt>Última parcela</dt><dd>${brl(s.lastPayment)}</dd></div>
        <div><dt>Juros totais</dt><dd>${brlRound(s.totalInterest)}</dd></div>
        <div><dt>Total pago</dt><dd>${brlRound(s.totalPaid)}</dd></div>
      </dl>
    </div>`
  $('cmp').innerHTML = pv && months ? card('SAC', sac, sacCheaper) + card('Price', price, !sacCheaper) : ''

  drawChart(sac.rows.map((r) => r.payment), price.rows.map((r) => r.payment), months)
  table()
}

function setSystem(s: System) {
  system = s
  expanded = false
  $('tab-price').setAttribute('aria-pressed', String(s === 'price'))
  $('tab-sac').setAttribute('aria-pressed', String(s === 'sac'))
  table()
}

;['value', 'down', 'rate', 'months'].forEach((id) => $(id).addEventListener('input', update))
$('tab-price').addEventListener('click', () => setSystem('price'))
$('tab-sac').addEventListener('click', () => setSystem('sac'))
$('more').addEventListener('click', () => {
  expanded = !expanded
  table()
})

update()
initMotion()
