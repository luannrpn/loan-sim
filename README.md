# Loan Sim

Simulador de financiamento que compara os sistemas de amortização **SAC** e **Tabela Price**: primeira e última parcela, juros totais, total pago, gráfico das parcelas ao longo do tempo e tabela de amortização completa.

**Demo:** https://luannrpn.github.io/loan-sim/

## Fórmulas

- Taxa mensal equivalente: `i = (1 + taxa anual)^(1/12) − 1`
- **Price:** parcela fixa `PMT = PV × i ÷ (1 − (1 + i)^−n)`; amortização = `PMT − juros`.
- **SAC:** amortização fixa `PV ÷ n`; parcela = amortização + juros sobre o saldo.
- Juros do mês = saldo devedor × `i`.

Verificação nos testes: no SAC, juros totais = `i × PV × (n + 1) ÷ 2`.

Simulação educativa: não inclui seguros, tarifas nem o CET do banco.

## Rodar localmente

```bash
npm install
npm run dev
npm test
npm run build
```

## Tecnologias

Vite, TypeScript, GSAP + ScrollTrigger, Lenis e [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) (`@fontsource-variable/instrument-sans`, licença OFL).

## Autoria

Autor: **Luann Neves** ([@luannrpn](https://github.com/luannrpn)). Veja [AUTHORS.md](AUTHORS.md), [LICENSE](LICENSE) (MIT) e [CITATION.cff](CITATION.cff).
