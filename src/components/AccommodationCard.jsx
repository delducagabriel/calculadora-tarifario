export default function AccommodationCard({ accom, isSelected, onSelect }) {
  const icon = accom.id === 'suite_jardim' ? '🌿' : '🏡'

  return (
    <button
      className={`accom-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(accom.id)}
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