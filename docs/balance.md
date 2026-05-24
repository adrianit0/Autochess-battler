# Balance MVP

## Politica

Este documento registra valores numericos y cambios de balance. Todo cambio que afecte economia, estadisticas de cartas, enemigos, dano de derrota o progresion debe actualizarse aqui.

## Valores Iniciales

Economia:

| Valor | Numero |
| --- | --- |
| Coste de compra | 3 |
| Oro por venta | 1 |
| Coste de refresco | 1 |
| Coste de congelar | 0 |
| Reduccion de coste de subida por turno | 1 |
| Oro maximo por ronda | 10 |
| Slots de tienda MVP | 3 |
| Limite de mano MVP | 10 |
| Limite de tablero | 7 |

Oro por ronda:

| Ronda | Oro inicial |
| --- | --- |
| 1 | 3 |
| 2 | 4 |
| 3 | 5 |
| 4 | 6 |
| 5 | 7 |
| 6 | 8 |
| 7 | 9 |
| 8+ | 10 |

Subida de tienda:

| Nivel actual | Coste |
| --- | --- |
| 1 | 5 |
| 2 | 7 |
| 3 | 8 |
| 4 | 9 |
| 5 | 10 |

El coste pendiente de subida baja 1 oro al inicio de cada turno de tienda hasta un minimo de 0. La reduccion se conserva por tramo de subida y debe verse reflejada en el coste mostrado por la UI.

Vida y dano:

| Valor | Numero |
| --- | --- |
| Vida inicial jugador | 20 |
| Dano por derrota rondas 1-2 | 3 |
| Dano por derrota rondas 3-4 | 5 |
| Dano por derrota rondas 5+ | 7 |
| Dano por empate | 0 |

## Curva de Cartas Inicial

Referencia de stats base por nivel:

| Nivel | Stats orientativas |
| --- | --- |
| 1 | 1/1 a 3/2 |
| 2 | 2/3 a 4/3 |
| 3 | 3/4 a 5/4 |
| 4 | 4/5 a 6/5 |
| 5 | 5/6 a 7/7 |
| 6 | 7/8 o efectos decisivos |

## Identidad de Clases

- Bestias: ataque e invocaciones.
- Maquinas: supervivencia, vida adicional y Provocar.
- Arcanos: dano aleatorio y efectos magicos.
- No-muertos: muerte, fichas y efectos `[Muerte]`.
- Elementales: escalado permanente de stats.

## Registro de Cambios

- 2026-05-22: valores iniciales definidos para documentacion base del MVP.
- 2026-05-22: revision inicial tras implementar core hasta `T-019`.
  - El loop es ganable con tablero fuerte scripted y perdible sin tablero, cubierto por tests de estado.
  - No se ajustan costes ni estadisticas todavia porque falta playtesting manual de UI.
  - Riesgo observado: las primeras rondas pueden castigar mucho si el jugador no compra/coloca cartas; se mantiene para preservar una condicion clara de derrota en MVP.
  - Siguiente revision recomendada: despues de jugar al menos 10 partidas manuales completas desde la UI.
- 2026-05-23: se implementa la reduccion de coste de subir tienda en 1 oro por turno de tienda, con coste restante por tramo y coste actual visible en UI.

## Checklist de Revision MVP

Estado actual:

| Criterio | Estado |
| --- | --- |
| Partida ganable con decisiones favorables | Cubierto por test scripted |
| Partida perdible con mala gestion | Cubierto por test de combate sin tablero |
| Costes centralizados en datos | Cumplido |
| Enemigos por ronda validados | Cumplido |
| Cartas y sinergias validadas | Cumplido |
| Playtesting manual suficiente | Pendiente |

Decision:

- El balance queda aceptado como balance tecnico inicial del MVP.
- No se considera balance de experiencia final hasta completar playtesting manual.
