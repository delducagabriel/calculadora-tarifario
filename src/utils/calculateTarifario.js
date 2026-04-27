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

function isWeekend(date) {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 = domingo, 6 = sábado
}

function getNightDates(checkIn, checkOut) {
    const nights = [];
    const current = new Date(checkIn)

    while (current < checkOut) {
        nights.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }

    return nights
}

export function calculateTarifario(accommodationId, checkIn, checkOut, adults) {

    if (!accommodationId || !ACCOMMODATIONS[accommodationId]) {
        return { error: 'Selecione uma acomodação válida.' }
    }

    if (!checkIn || !checkOut) {
        return { error: 'Selecione datas de check-in e check-out.' }
    }

    const accom = ACCOMMODATIONS[accommodationId]
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

    const extraAdults = Math.max(0, adults - accom.maxGuests) 
    const extraGuestSubtotal = extraAdults * accom.extraGuestFee * numNights

    const taxableSubtotal = dailySubtotal + extraGuestSubtotal
    const hasLongStayDiscount = numNights > 7
    const discountAmount = hasLongStayDiscount ? taxableSubtotal * 0.1 : 0

    const total = taxableSubtotal - discountAmount + accom.cleaningFee

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
