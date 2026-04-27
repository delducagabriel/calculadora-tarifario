export default function AdultsCounter({ adults, selectedAccom, onChange }) {

    const isOverCapacity = selectedAccom && adults > selectedAccom.maxGuests
    const extraCount = isOverCapacity ? adults - selectedAccom.maxGuests : 0

    return (
        <section className="form-section">
            <span className="section-label">Número de adultos</span>

            <div className="adults-control">
                <button
                    className="qty-btn"
                    onClick={() => onChange(Math.max(1, adults - 1))}
                    aria-label="Diminuir número de adultos"
                >
                    -
                </button>

                <span className="qty-value" aria-live="polite">
                    {adults}
                </span>

                <button
                    className="qty-btn"
                    onClick={() => onChange(Math.min(10, adults + 1))}
                    aria-label="Aumentar número de adultos"
                >
                    +
                </button>
            </div>

            {isOverCapacity && (
                <p className="extra-hint" role="status">
                    {extraCount} adulto{extraCount > 1 ? 's' : ''} acima da capacidade:
                    R$ 50/adulto extra por noite será cobrado.
                </p>
            )}
        </section>
    )
}