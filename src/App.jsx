// orquestrador → ele define o estado e distribui para os filhos

import { useState, useCallback } from 'react'
import { calculateTarifario, ACCOMMODATIONS } from './utils/calculateTarifario'
import AccommodationCard from './components/AccommodationCard'
import DatePicker from './components/DatePicker'
import AdultsCounter from './components/AdultsCounter'
import ResultPanel from './components/ResultPanel'
import ErrorBanner from './components/ErrorBanner'

export default function App() {
    // estado global do formulário
    // cada campo do formulário é um estado separado em vez de um único objeto
    // trade-off: estados seaprados são mais verbosos mas evitam um problema sutil, se você usar um objeto, cada atualização precisa fazer spread do estado anterior para não perder os outros campos, com estados separados, cada setter é independente e mais legível, para formulários pequenos como este, a troca vale a pena 

    const [selectedAccom, setSelectedAccom] = useState('') // o id da acomodação selecionada, string vazia significa nenhuma selecionada
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [adults, setAdults] = useState(1) // default 1 adulto, faz sentido para a maioria dos casos, evita erro de input inicial

    // estado do resultado
    const [result, setResult] = useState(null) // null significa sem resultado, { error: string } para erro, ou { breakdown: object } para resultado válido
    const [error, setError] = useState('') // string de erro para validação de formulário, diferente do error do resultado que é do cálculo, esse é para erros de input antes de chamar o cálculo
    const [loading, setLoading] = useState(false) // estado de loading para simular chamada assíncrona, melhora UX

    // ação principal → hook importante → useCallback
    // useCallback memoriza a referência da função entre renders, sem ele handleCalculate seria recriada a cada re-render do componente, o que forcaria qualquer componente filho que a recebe como prop a também re-renderizar, mesmo que nada tenha mudado
    // o array de dependências declara: "recrie essa função só quando um desses valores mudar", é um contrato explícito com o react 
    // nesse projeto, o ganho é pequeno porque os filhos não estão memoizados, mas é a forma correta de escrever 
    const handleCalculate = useCallback(() => {
        setError('') // limpa erros anteriores
        setResult(null) // limpa resultado anterior
        setLoading(true) // inicia loading

        // o setTimeout não é gambiarra de loading, ele existe para separar duas responsabilidades: o cálculo (síncrono, instantâneo) e o feedback visual (que precisa de ao menos um frame para renderizar o spinner antes de bloquear a thread com o cálculo)
        // em prod, esse seria o lugar de uma chamada fetch() para uma API
        // o padrão fica igual → a unica diferença é await em vez de setTimeout, o que torna a função handleCalculate assíncrona, mas a lógica de estado e tratamento de resultado continua a mesma
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

            setLoading(false) // termina loading
        }, 500) // simula meio segundo de delay
    }, [selectedAccom, checkIn, checkOut, adults]) // dependências do useCallback

    // reset 
    // volta todos os estados para o valor inicial
    // não precisa de useCallback porque nao é passada como prop para nenhum filho, é só um chamado direto no onClick de um botão
    const handleReset = () => {
        setSelectedAccom('')
        setCheckIn('')
        setCheckOut('')
        setAdults(1)
        setResult(null)
        setError('')
    }

    // render
    return (
        <div className="app">
            <header className="app-header">
                <h1>Calculadora de Tarifas</h1>
                <p>Desafio Técnico • Hospedin</p>
            </header>

            <main className="app-main">

        {/* Seção 1: Acomodação
            Object.values() converte o objeto ACCOMMODATIONS em array
            para que possamos usar .map() — o jeito React de renderizar listas */}
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

        {/* Seção 2: Datas */}
        <DatePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
        />

        {/* Seção 3: Adultos */}
        <AdultsCounter
          adults={adults}
          selectedAccom={selectedAccom ? ACCOMMODATIONS[selectedAccom] : null}
          onChange={setAdults}
        />

        {/* Ações */}
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

        {/* Feedback — renderização condicional */}
        {error && <ErrorBanner message={error} />}
        {result && <ResultPanel result={result} />}

      </main>
    </div>
  )
}

