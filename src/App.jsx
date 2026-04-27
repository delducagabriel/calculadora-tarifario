import { useState, useCallback } from 'react'
import { calculateTarifario, ACCOMMODATIONS } from './utils/calculateTarifario'
import AccommodationCard from './components/AccommodationCard'
import DatePicker from './components/DatePicker'
import AdultsCounter from './components/AdultsCounter'
import ResultPanel from './components/ResultPanel'
import ErrorBanner from './components/ErrorBanner'

export default function App() {

    const [selectedAccom, setSelectedAccom] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [adults, setAdults] = useState(1) 
    const [result, setResult] = useState(null) 
    const [error, setError] = useState('') 
    const [loading, setLoading] = useState(false)      
    
    const handleCalculate = useCallback(() => {
        setError('') 
        setResult(null) 
        setLoading(true)
        setTimeout(() => {
            const output = calculateTarifario(
                selectedAccom,
                checkIn,
                checkOut,
                Number(adults)
            )

            if (output.error) {
                setError(output.error)
            } else {
                setResult(output)   
            }

            setLoading(false) 
        }, 500) 
    }, [selectedAccom, checkIn, checkOut, adults])

    const handleReset = () => {
        setSelectedAccom('')
        setCheckIn('')
        setCheckOut('')
        setAdults(1)
        setResult(null)
        setError('')
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>Calculadora de Tarifas</h1>
                <p>Desafio Técnico • Hospedin</p>
            </header>

            <main className="app-main">

        <section className="form-section">
          <span className="section-label">Escolha a acomodação</span>
          <div className="accom-grid">
            {Object.values(ACCOMMODATIONS).map((accom) => (
              <AccommodationCard
                key={accom.id}
                accom={accom}
                isSelected={selectedAccom === accom.id}
                onSelect={setSelectedAccom}
              />
            ))}
          </div>
        </section>

        <DatePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
        />

        <AdultsCounter
          adults={adults}
          selectedAccom={selectedAccom ? ACCOMMODATIONS[selectedAccom] : null}
          onChange={setAdults}
        />

        <div className="actions">
          <button
            className="btn-calculate"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading
              ? <span className="spinner" aria-label="Calculando…" />
              : 'Calcular valor da estadia'
            }
          </button>

          {(result || error) && (
            <button className="btn-reset" onClick={handleReset}>
              Nova consulta
            </button>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
        {result && <ResultPanel result={result} />}

      </main>
    </div>
  )
}

