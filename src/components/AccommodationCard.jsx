// esse componente tem lógica visual própria (estado de selecionado/não selecionado) e é reutilizado duas vezes via map
// é puramente apresentação → não tem estado próprio
// ele recebe isSelected como prop e deixa o pai decidir o que fazer quando for clicado, via onSelect
// padrão → props de dados (accom, isSelected) + props de comportamento (onSelect) 
// separar os dois tipos torna o contrato de componente mais legível 

export default function AccommodationCard({ accom, isSelected, onSelect }) {
  const icon = accom.id === 'suite_jardim' ? '🌿' : '🏡'

  return (
    <button
      className={`accom-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(accom.id)}
      // aria-pressed é o atributo semântico correto para botões que
      // representam um estado ligado/desligado — melhora acessibilidade.
      aria-pressed={isSelected}
    >
      <span className="accom-icon">{icon}</span>

      <div className="accom-info">
        <strong>{accom.name}</strong>
        <span>R$ {accom.baseRate}/noite · até {accom.maxGuests} adultos</span>
        <span>Mín. {accom.minNights} noites · Limpeza R$ {accom.cleaningFee}</span>
      </div>

      {isSelected && <span className="check-badge" aria-hidden="true">✓</span>}
    </button>
  )
}