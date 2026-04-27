# Calculadora de Tarifário

Aplicação React para cálculo de valores de estadias com tarifário completo. Permite selecionar uma acomodação, informar período e o número de adultos, e visualizar o breakdown completo do valor com: diárias, acréscimos de fim de semana, hóspedes extras, desconto de longa estadia e taxa de limpeza.  

## Como rodar 

**Pré-requisitos**: Node.js v18+

```bash
npm install        # instale as dependências
npm run dev        # inicie o servidor: http://localhost:5173
```

```bash
npm run build      # gera a build de produção → pasta dist/
npm run preview    # serve o build localmente
```

`npm run dev` é suficiente para rodar o projeto. Os dois comandos existem para fluxo de publicação: o `build` empacota e minifica o código para produção, e o `preview` permite conferir antes de fazer o deploy.


## Regras de negócio

| Acomodação    | Diária  | Limpeza | Mín. noites | Cap. máx. |
|---------------|---------|---------|-------------|-----------|
| Suíte Jardim  | R$ 300  | R$ 80   | 2           | 2 adultos |
| Chalé Família | R$ 450  | R$ 100  | 2           | 4 adultos |

- **Estadia Mínima**: todas as acomodações exigem um mínimo de 2 noites.
- **Fim de Semana**: noites de sábado e domingo sofrem um acréscimo de +20% sobre a diária base.
- **Hóspedes Extras**: caso o número de adultos exceda a capacidade máxima da acomodação, cobra-se R$50,00 por adulto extra por noite.
- **Desconto de Longa Estadia**: reservas com mais de 7 noites recebem um desconto de 10% (aplicado sobre o valor das diárias + extras, não incide sobre a taxa de limpeza).
- **Taxa de Limpeza**: valor fixo adicional ao final, independente da duração.

### Validações
- Check-out deve ser posterior ao check-in.
- Estadia abaixo do mínimo exibe mensagem clara via banner de erro (`ErrorBanner.jsx` com `role="alert"`)
- Acomodação e data são obrigatórios.
- Número de adultos deve ser ao menos 1.

## Estrutura

```
src/
├── components/
│   ├── AccommodationCard.jsx  ← card de seleção de acomodação
│   ├── AdultsCounter.jsx      ← contador com hint de hóspede extra
│   ├── DatePicker.jsx         ← campos de check-in e check-out
│   ├── ErrorBanner.jsx        ← exibição de erros de validação
│   └── ResultPanel.jsx        ← breakdown completo do cálculo
├── utils/
│   └── calculateTarifario.js  ← lógica de negócio, sem React
├── App.jsx                    ← orquestrador de estado
├── main.jsx                   ← entry point
└── index.css                  ← estilos com CSS custom properties
```

---

## Decisões Técnicas 

### Separação de Concerns (Lógica *vs* UI)

A regra de negócio foi isolada em um módulo puro (`utils/calculateTarifario.js`), sem dependência do React, ou seja, não acessa nenhum estado externo. Na prática, ela se torna agnóstica ao framework e é testável sem montar nenhum componente. 

```js
// sem jest.mock, sem render, sem fireEvent - JavaScript puro
const result = calculateTarifario('suite_jardim', '2025-08-01', '2025-08-03', 2)
assert(result.total === 760) // 2× R$300 + R$80 de limpeza
```

A função retorna um objeto rico com o "breakdown" do cálculo, e não apenas o total. Isso evita que a camada de UI (react) recalcule valores apenas para formatação, ela apenas consome o que a função retorna. Logo, cada camada tem uma responsabilidade única.

### Cálculo de Datas 

No cálculo de acréscimos de fim de semana, optei por iterar sobre cada noite da estadia ao invés de usar fórmula. A alternativa mais "simples" seria:

```js
// Errado pra esse problema
const total = numNights * baseRate * (hasWeekend ? 1.2 : 1)
```

O problema é que o acréscimo de fim de semana é **por noite**, não sobre o total. A complexidade passa de O(1) para O(n), onde n é o número de noites. Pra estadias reais, isso é trivialmente rápido, mas gera mais clareza e precisão. Iterar garante que o acréscimo seja aplicado corretamente no dia certo, facilitando futuras implementações de feriados, tarifas sazonais, etc. 

### Tratamento de Error 

Erros de validação como data inválida, mínimo não atingido, são o fluxo esperado, não exceções da aplicação. Por isso, a função de cálculo nunca lança exceções (`throw Error`), ela retorna um objeto: `{ error : 'Mensagem' }`. 

Tratar erros como dados permite que o componente de UI (`App.jsx`) decida se exibe um banner ou desabilita um botão, mantendo um fluxo de controle limpo. 

### Estado Separado

Cada campo do fomrulário tem seu próprio `useState` em vez de um objeto único. Pra quatro campos, essa abordagem é mais legível, cada setter é independente, sem necessidade de spread pra não sobrescrever os outros campos. 

### Timezones

O JavaScript nativo interpreta a data como UTC. Em fusos horários negativos, como o de Brasília, isso pode resultar em "um dia antes". A solução foi implementar o padrão `new Date(input + 'T12:00:00'), ancorando a data ao meio-dia local e prevenindo erros de deslocamento de dia. 

### Acessibilidade

O projeto foi desenvolvido pensando na inclusão:
- uso de `aria-live="polite"` no contador de adultos para leitores de tela anunciarem mudanças.
- uso de `role="alert"` no banner de error para leitura imediata.
- controle de foco e estados desabilitados visíveis. 

### O que ficou de fora e porque

| Funcionalidade | Decisão |
|---|---|
| Testes unitários | Estrutura pronta (função pura), mas Vitest não foi configurado para manter o escopo do desafio |
| TypeScript | O enunciado especifica JavaScript; TS seria a escolha em produção |
| useReducer | 4 campos de formulário não justificam a complexidade |
| React.memo | Sem profiling que indique problema de performance, memoização prematura é ruído |
| Persistência | Reserva é transitória, recarregar a página é o comportamento correto |

## Stack

- React 19 + Vite 8
- CSS puro com custom properties
- Zero dependências de UI
