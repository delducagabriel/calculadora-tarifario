// aqui vive a única lógica de UI que não pertence ao cálculo → quando o usuário muda o check-in para uma data posterior ao check-out, limpamos o check-out automaticamente para evitar estado inválido silencioso
// conceito: derived state vs estado explícito 
// poderiamos guardar um estado de erro de data aqui dentro, mas preferi tratar isso na função de cálculo (um lugar só)
// aqui apenas será feito o guard de UX: impedir que o usuáiro chege num estado inválido antes de clicar em calcular

const today = () => new Date().toISOString().split('T')[0]

export default function DatePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}) {
  function handleCheckInChange(e) {
    const newCheckIn = e.target.value
    if (newCheckIn && newCheckIn < today()) {
        onCheckInChange(today())
    } else {
        onCheckInChange(newCheckIn)
    }
    
    // guard de ux: se o novo check-in é igual ou posterior ao check-out atual, limpamos o check-out pra forçar ao usuário escolher um check-out válido
    // alternativa seria corrigir automaticamente (checkOut = newCheckIn + 1 dia), mas isso tira a autonomia do usuário
    if (checkOut && newCheckIn >= checkOut) {
        onCheckOutChange('')
    }
    }

    return (
        <section className="form-section">
            <span className="section-label">Período da estadia</span>

            <div className="date-grid">
                <div className="field">
                <label htmlFor="checkin">Check-in</label>
                <input
                    id="checkin"
                    type="date"
                    min={today()}
                    value={checkIn}
                    onChange={handleCheckInChange}
                />
                </div>

                <div className="field">
                <label htmlFor="checkout">Check-out</label>
                <input
                    id="checkout"
                    type="date"
                    // min dinâmico: o check-out nunca pode ser antes do check-in
                    min={checkIn || today()}
                    value={checkOut}
                    onChange={(e) => onCheckOutChange(e.target.value)}
                />
                </div>
            </div>
        </section>
    )
}

