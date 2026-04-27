/* 
Dados das Acomodações
Centraliza os dados aqui, junto com a lógica de cálculo do tarifário. Em um sistema maior, isso viria de um banco de dados ou de uma API, mas hardcodar é a escolha certa já que não há complexidade que necessita de uma chamada externa.
*/

export const ACCOMMODATIONS = {
    suite_jardim: {
        id: 'suite_jardim',
        name: 'Suíte Jardim',
        baseRate: 300,
        cleaningFee: 80,
        minNights: 2, 
        maxGuests: 2,
        extraGuestFee: 50,
    },
    chale_familia: {
        id: 'chale_familia',
        name: 'Chalé Família',
        baseRate: 450,
        cleaningFee: 100,
        minNights: 2,
        maxGuests: 4, 
        extraGuestFee: 50,
    },
}

// exportamos ACCOMMODATIONS separadamente da função de cálculo, o componente de seleção de acomocação vai precisar desses dados pra renderizar as opções, mas não vai precisar da lógica de cálculo, então exportar separado evita acoplamento desnecessário.

// agora as duas funções auxiliares internas são privadas - não exportadas - porque só existem pra servir a função de cálculo do tarifário

function isWeekend(date) {
    const day = date.getDay()
    return day === 0 || day === 6 // domingo ou sábado 
}

// gera o array de noites entre check-in e check-out
// conceito importante > check-in 01/08, check-out 03/08 = 2 noites
// o array é [01/08, 02/08], o dia 03/08 não é incluído porque o hóspede já saiu
// iteramos com um objeto Date mutável, em vez de gerar índices numéricos porque precisamos da data real para verificar se é fim de semana ou não

function getNightDates(checkIn, checkOut) {
    const nights = [];
    const current = new Date(checkIn)

    while (current < checkOut) {
        nights.push(new Date(current)) // adiciona uma cópia da data atual - não a referência mutável
        current.setDate(current.getDate() + 1) // avança para a próxima noite
    }

    return nights
}

// o detalhe do new Date(current) dentro do push é sútil mas crítico
// date é um objeto - se voce fizer nights.push(current) , todos os elementos do array vão apontar para o mesmo objeto na memória, e vocÊ vai ter um array cheio de datas iguais
// copiar com new Date(current) garante que cada elemento do array seja uma data independente, representando a noite correta

// agora a função principal
// retorna um objeito com o breakdown completo do calculo
// ou { error : string } em caso de input inválido 
// decisão de design aqui é retornar { error } - um objeto - em vez de lançar uma exceção, mais simples
// erros de validação são fluxo esperado, não excepcional. lançar exceção aqui para controle de fluxo é um antipattern 
// exceções devem representar falhas inesperadas no sistema, não erros de input do usuário

export function calculateTarifario(accommodationId, checkIn, checkOut, adults) {
    // bloco 1 - validação de input
    // validamos na ordem do mais estrutural para o mais semântico
    // se o id da acomodação for inválido, não faz sentido continuar
    // se as datas estão ausentes, não faz sentido comparar se são válidas

    if (!accommodationId || !ACCOMMODATIONS[accommodationId]) {
        return { error: 'Selecione uma acomodação válida.' }
    }

    if (!checkIn || !checkOut) {
        return { error: 'Selecione datas de check-in e check-out.' }
    }

    const accom = ACCOMMODATIONS[accommodationId]

    // armadilha clássica do js: new Date('2025-08-01') interpreta a string como UTC, o que pode gerar uma data inválida dependendo do fuso horário do usuário como em fusos negativos (ex: Brasil), a data pode ser interpretada como 31/07/2025, o que quebra toda a lógica de cálculo.
    // ao forçar T12:00:00, ancoramos ao meio-dia local, seguro em qualquer fuso horário do mundo
    const cin = new Date(checkIn + 'T12:00:00')
    const cout = new Date(checkOut + 'T12:00:00')

    if (cout <= cin) {
        return { error: 'A data de check-out deve ser posterior ao check-in.' }
    }

    const nightDates = getNightDates(cin, cout)
    const numNights = nightDates.length

    if (numNights < accom.minNights) {
        return { error: `A estadia mínima para esta acomodação é de ${accom.minNights} noites.` }
    }

    if (!adults || adults < 1) {
        return { error: 'Informe ao menos 1 adulto.' }
    }

    // bloco 2 - calculo do tarifário
    // aqui está a decisão técnica mais importante do projeto: iteramos noite a noite em vez de fazer (numNights * baseRate)
    // porque o acréscimo de fim de semana não é sobre o valor total, é sobre cada noite individualmente
    // a única forma de saber quantas noites são sábado/domingo é avaliando cada data real

    // complexidade: o(n) onde n = número de noites
    // para estadias reais (máximo algumas centenas de noites), isso é computacionalmente trivial, e a clareza do código é muito melhor do que tentar fazer uma fórmula complexa para calcular o número de fins de semana

    let weekdayNights = 0
    let weekendNights = 0
    let dailySubtotal = 0

    for (const date of nightDates) {
        if (isWeekend(date)) {
            weekendNights++
            dailySubtotal += accom.baseRate * 1.2 // +20% para fins de semana
        } else {
            weekdayNights++
            dailySubtotal += accom.baseRate
        }
    }

    // bloco 3 - cálculo de taxas adicionais
    const extraAdults = Math.max(0, adults - accom.maxGuests) // só conta adultos extras além do limite da acomodação
    // Math.max garante que não tenhamos um número negativo de adultos extras, o que poderia acontecer se o usuário inserir um número menor do que maxGuests
    // se adults=2 e maxGuests=2, extraAdults = 0
    const extraGuestSubtotal = extraAdults * accom.extraGuestFee * numNights

    // bloco 4 - desconto de longa estadia
    // deicsão explícita: o desconto incide sobre diárias + adicionais, mas não sobre a taxa de limpeza, porque a limpeza é um custo fixo que o hotel tem independentemente do número de noites
    const taxableSubtotal = dailySubtotal + extraGuestSubtotal
    const hasLongStayDiscount = numNights > 7
    const discountAmount = hasLongStayDiscount ? taxableSubtotal * 0.1 : 0

    const total = taxableSubtotal - discountAmount + accom.cleaningFee

    // bloco 5 - retorno rico 
    // retornamos todos os componentes do cálculo, não só o total
    // porque a UI precisa mostrar um breakdown detalhado pro usuário
    // se retornássemos só { total }, o componente teria que recalcular as partes, duplicando a lógica de negócio na camada de apresentação
    // o componente recebe dados prontos e só decide como exibi-los

    return {
        accommodation: accom.name,
        numNights,
        weekdayNights,
        weekendNights,
        baseRate: accom.baseRate,
        dailySubtotal,
        extraAdults,
        extraGuestFee: accom.extraGuestFee,
        extraGuestSubtotal,
        taxableSubtotal,
        hasLongStayDiscount,
        discountAmount,
        cleaningFee: accom.cleaningFee,
        total,
        adults,
        maxGuests: accom.maxGuests,
    }
}

