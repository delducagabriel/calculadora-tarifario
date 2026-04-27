//ResultRow é um componente interno, não exportado
// ele só existe para evitar repetição dentro desse arquivo, a decisão de não exportar é intencional
// se não há caso de uso fora desse contexto, export é criar uma API desnecessária

function ResultRow({ label, value, accent, muted, bold }) {
  const className = [
    'result-row',
    accent ? 'accent' : '',
    muted  ? 'muted'  : '',
    bold   ? 'bold'   : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

// formatação da moeda centralizada aqui, se a regra mudar, só precisa ser atualizada nesse lugar
const fmt = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ResultPanel({ result }) {
  return (
    <div className="result-panel">
      <h3 className="result-title">Resumo da Reserva</h3>

      <ResultRow label="Acomodação" value={result.accommodation} bold />
      <ResultRow label="Número de noites" value={result.numNights} />

      {/* Renderização condicional por tipo de noite:
          só exibimos a linha se houver noites daquele tipo.
          Evita linhas "Diárias (0× semana)" que confundem o usuário. */}
      {result.weekdayNights > 0 && (
        <ResultRow
          label={`Diárias (${result.weekdayNights}× semana)`}
          value={fmt(result.weekdayNights * result.baseRate)}
          muted
        />
      )}
      {result.weekendNights > 0 && (
        <ResultRow
          label={`Diárias (${result.weekendNights}× fim de semana +20%)`}
          value={fmt(result.weekendNights * result.baseRate * 1.2)}
          muted
        />
      )}

      <ResultRow label="Subtotal diárias" value={fmt(result.dailySubtotal)} />

      {result.extraAdults > 0 && (
        <ResultRow
          label={`Hóspede extra (${result.extraAdults}× R$${result.extraGuestFee}/noite)`}
          value={fmt(result.extraGuestSubtotal)}
          accent
        />
      )}

      {result.hasLongStayDiscount && (
        <ResultRow
          label="Desconto longa estadia (−10%)"
          value={`−${fmt(result.discountAmount)}`}
          accent
        />
      )}

      <div className="divider" />
      <ResultRow label="Taxa de limpeza" value={fmt(result.cleaningFee)} />
      <div className="divider" />
      <ResultRow label="Total final" value={fmt(result.total)} bold />
    </div>
  )
}