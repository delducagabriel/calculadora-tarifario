// esse componente tem uma responsabilidade dupla: controlar a quantidade e exibir o hint de hóspede extra quando o número ultrapassa a capacidade
// a lógica do hint vive aqui porque é puramente visual, não afeta o cálculo 

export default function AdultsCounter({ adults, selectedAccom, onChange }) {

    // lógica derivada → calculamos o hint a partir das props
    // não guardamos isso em estado, é informação derivada de adults e selectedAccom, que já são props
    // guardar em estado seria redundância e fonte de bugs (dois estados que precisam ficar em sync)

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

                {/* aria-live faz o leitor de tela anunciar a mudança de valor
                    sem o usuário precisar focar no elemento */}
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