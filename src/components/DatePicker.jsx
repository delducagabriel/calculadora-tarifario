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
                    min={checkIn || today()}
                    value={checkOut}
                    onChange={(e) => onCheckOutChange(e.target.value)}
                />
                </div>
            </div>
        </section>
    )
}

