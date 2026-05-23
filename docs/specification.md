# Especificacion del Juego

## Vision General

Juego single-player de cartas con mecanicas de autochess/autobattler. El jugador mejora su tablero durante una fase de tienda y despues combate automaticamente contra enemigos predefinidos. La partida termina con victoria al derrotar la ultima ronda definida o derrota al quedarse sin vida de jugador.

## Decisiones de Especificacion

- El oro no gastado se pierde al finalizar la fase de tienda.
- Las fusiones del MVP solo consideran cartas controladas por el jugador: mano y tablero.
- La tienda no cuenta como zona controlada para fusionar en MVP.
- MainMenu se omite en el primer vertical slice, pero el estado existe en la maquina de estados.
- El combate usa limite de turnos/acciones para evitar bucles infinitos.
- El jugador tendra vida de partida en MVP para que la derrota sea persistente entre rondas.
- La logica se implementara en TypeScript y sera testeable sin Phaser.

## Loop Principal

1. Crear partida con seed.
2. Inicializar jugador, ronda, oro, nivel de tienda y tienda.
3. Entrar en `ShopPhase`.
4. El jugador compra, vende, coloca, reordena, refresca, congela o sube nivel.
5. El jugador finaliza tienda.
6. Activar efectos de fin de turno de tienda.
7. Entrar en `CombatPreparation`.
8. Cargar enemigo de la ronda.
9. Activar efectos de inicio de combate.
10. Entrar en `CombatPhase`.
11. Resolver ataques automaticos hasta victoria, derrota o empate tecnico.
12. Entrar en `CombatResolution`.
13. Aplicar resultado.
14. Entrar en `RewardPhase` si corresponde.
15. Avanzar ronda o terminar en `Victory`/`GameOver`.

## Estados del Juego

- `Boot`: carga de datos y validacion inicial.
- `MainMenu`: menu futuro, omitible visualmente en MVP.
- `ShopPhase`: acciones de economia y tablero.
- `CombatPreparation`: clonado de tableros y aplicacion de efectos previos.
- `CombatPhase`: simulacion automatica.
- `CombatResolution`: calculo del resultado.
- `RewardPhase`: recompensas y avance.
- `GameOver`: derrota.
- `Victory`: victoria.

Transiciones invalidas deben rechazarse con errores de dominio o resultados tipados.

## Zonas de Cartas

- `shop`: oferta visible de cartas comprables.
- `hand`: cartas compradas no colocadas.
- `board`: cartas activas del jugador, maximo 7.
- `combatBoard`: copia temporal usada durante combate.
- `enemyBoard`: tablero de enemigo durante combate.
- `discard` opcional para logs/debug, no requerido visualmente.

## Sistema de Cartas

Cada definicion de carta incluye:

- `id`
- `name`
- `description`
- `tier`
- `attack`
- `health`
- `classes`
- `effects`
- `isUpgraded` solo en instancia, no en definicion base.
- `artKey`
- `playerText`

Cada instancia de carta incluye:

- `instanceId`
- `definitionId`
- `attack`
- `health`
- `maxHealth`
- `isUpgraded`
- `temporaryEffects`
- `status`

## Clases

Clases MVP:

- `beast`: Bestias.
- `mech`: Maquinas.
- `arcane`: Arcanos.
- `undead`: No-muertos.
- `elemental`: Elementales.
- Neutral: lista de clases vacia.

Una carta puede tener 0, 1 o 2 clases. Las cartas neutrales no activan sinergias.

## Sinergias

Las sinergias se definen como datos con:

- ID.
- Clase.
- Condicion.
- Timing.
- Efecto.
- Texto visible.

Version MVP:

- Bestias: si controlas 3+ Bestias al inicio de combate, una Bestia aliada aleatoria gana +2 ataque.
- Maquinas: si controlas 3+ Maquinas al inicio de combate, la Maquina aliada con menos vida gana +0/+3.
- Arcanos: si controlas 3+ Arcanos al inicio de combate, inflige 2 de dano a un enemigo aleatorio.
- No-muertos: si controlas 3+ No-muertos, el primer No-muerto aliado que muere invoca una ficha 1/1.
- Elementales: si controlas 3+ Elementales al fin de turno de tienda, un Elemental aliado aleatorio gana +1/+1 permanente.

## Sistema de Efectos

Estructura de efecto:

- `type`
- `trigger`
- `targeting`
- `amount` o payload especifico.
- `upgradedOverride` opcional.

Triggers MVP:

- `onBuy`
- `onSell`
- `onPlay`
- `onDeath`
- `onCombatStart`
- `onShopTurnEnd`
- `passive`
- `onAttack`

Etiquetas visibles de mecanicas:

| Trigger interno | Etiqueta visible | Descripcion visible |
| --- | --- | --- |
| `onBuy` | `[Compra]` | Un efecto al comprar la carta. |
| `onSell` | `[Venta]` | Un efecto al vender la carta. |
| `onPlay` | `[Jugar]` | Un efecto al poner la carta de la mano a la mesa. |
| `onDeath` | `[Muerte]` | Un efecto al morir en combate. |
| `onCombatStart` | `[Inicio Combate]` | Un efecto al principio de combate. |
| `onShopTurnEnd` | `[Fin Tienda]` | Un efecto al final del turno de tienda. |

Los textos de cartas deben usar siempre estas etiquetas entre corchetes para las mecanicas anteriores. Los nombres antiguos `Grito de compra`, `Venta`, `Jugar carta`, `Ultimo aliento`, `Inicio de combate` y `Fin de Tienda` quedan reemplazados en UI y documentacion visible.

Efectos MVP:

- `taunt`: prioridad como objetivo.
- `doubleAttack`: la carta ataca dos veces en su turno.
- `deathrattle`: ejecuta payload al morir.
- `battlecryBuy`: ejecuta payload al comprar.
- `combatStart`: ejecuta payload al empezar combate.
- `shopTurnEnd`: ejecuta payload al finalizar tienda.
- `randomDamage`: inflige dano a objetivo aleatorio valido.
- `statBuff`: aumenta ataque y/o vida.

Si un efecto no encuentra objetivo valido, no hace nada y registra evento en el log.

## Sistema de Tienda

Acciones:

- Comprar carta por 3 oro.
- Vender carta por 1 oro.
- Refrescar tienda por 1 oro.
- Congelar/descongelar tienda por 0 oro.
- Subir nivel pagando coste actual.
- Mover cartas entre mano y tablero.
- Reordenar tablero.
- Finalizar fase.

Reglas:

- La tienda muestra cartas aleatorias cuyo nivel sea menor o igual al nivel de tienda.
- La cantidad inicial de slots de tienda para MVP es 3.
- La tienda congelada conserva las mismas cartas al iniciar la siguiente ronda.
- Al comprar se elimina la carta del slot de tienda.
- No se puede comprar sin oro suficiente ni si la mano esta llena.
- Limite de mano MVP: 10 cartas.
- No se puede colocar una carta si el tablero tiene 7 cartas.
- Cada turno reduce en 1 el coste restante de subir tienda, hasta un minimo de 0.
- La UI debe mostrar el coste actual de subir tienda junto al boton de subida.

Interacciones de tienda y tablero:

- Las cartas no se activan por click.
- Arrastrar desde tienda a mano compra la carta.
- Arrastrar desde mano a tablero coloca la carta.
- Arrastrar desde tablero a tienda vende la carta.
- Arrastrar cartas dentro del tablero permite recolocarlas en la posicion deseada.
- Las posiciones visuales de la antigua pagina de Mano se sustituyen por posiciones de Tablero.

## Sistema de Economia

Oro inicial por ronda:

| Ronda | Oro |
| --- | --- |
| 1 | 3 |
| 2 | 4 |
| 3 | 5 |
| 4 | 6 |
| 5 | 7 |
| 6 | 8 |
| 7 | 9 |
| 8+ | 10 |

Costes:

| Accion | Coste |
| --- | --- |
| Comprar | 3 |
| Vender | -1 |
| Refrescar | 1 |
| Congelar | 0 |

Coste de subir tienda:

| Nivel actual | Nuevo nivel | Coste |
| --- | --- | --- |
| 1 | 2 | 5 |
| 2 | 3 | 7 |
| 3 | 4 | 8 |
| 4 | 5 | 9 |
| 5 | 6 | 10 |

El oro restante se descarta al finalizar tienda.
El coste pendiente de subir tienda se reduce en 1 al comienzo de cada turno de tienda. La reduccion se aplica por nivel actual y no puede dejar el coste por debajo de 0.

## Sistema de Niveles

- Nivel maximo de tienda: 6.
- Una tienda de nivel N puede ofrecer cartas de niveles 1..N.
- El coste de subida de tienda baja 1 oro por turno de tienda.
- No hay probabilidades ponderadas por nivel en el primer vertical slice; se puede anadir en balance.

## Sistema de Fusiones

Reglas:

- Al tener 3 copias con el mismo `definitionId` en mano y/o tablero, se fusionan automaticamente.
- Las 3 copias se consumen.
- Se crea una carta mejorada con doble ataque base y doble vida base.
- Para MVP, buffs temporales no se conservan.
- Buffs permanentes se conservan solo si se define explicitamente en una tarea futura; por defecto no.
- La carta mejorada se coloca preferentemente en la zona donde estaba la primera copia detectada.
- Si la fusion involucra tablero y no hay espacio, la carta fusionada reemplaza una de las copias consumidas.
- Los efectos mejorados solo cambian si `upgradedOverride` existe en datos.

## Sistema de Combate

Reglas:

- Cada bando tiene maximo 7 cartas.
- Se usan copias de combate para no danar permanentemente las cartas del jugador.
- El orden de ataque es de izquierda a derecha.
- Los bandos alternan ataques.
- El primer atacante para MVP es el jugador.
- Si el atacante actual murio, se salta.
- Cada ataque selecciona un objetivo enemigo aleatorio valido.
- Si hay enemigos con Provocar, solo esos son objetivos validos.
- Ataque doble ejecuta dos ataques consecutivos si el atacante sigue vivo y existen objetivos.
- El dano es simultaneo: atacante y defensor se infligen dano igual a su ataque.
- Una carta con vida menor o igual a 0 muere y se elimina del tablero de combate.
- `[Muerte]` se resuelve al morir.
- El combate termina si un tablero queda vacio.
- Empate tecnico si ambos tableros quedan vacios o se alcanza el limite.

Limite de seguridad:

- Maximo 200 acciones de ataque o efecto encadenado por combate en MVP.
- Al superar el limite, resultado `draw`.

Resultados:

- `win`: enemigo sin cartas y jugador con al menos una carta.
- `loss`: jugador sin cartas y enemigo con al menos una carta.
- `draw`: ambos sin cartas o limite alcanzado.

## Sistema de Enemigos

Cada enemigo incluye:

- `id`
- `name`
- `round`
- `cards`
- `difficulty`
- `reward`
- `description`

Los enemigos se cargan por ronda. No toman decisiones durante combate.

## Progresion por Rondas

MVP recomendado:

- 6 rondas totales.
- Rondas 1-2: enemigos faciles de nivel 1.
- Rondas 3-4: enemigos con primeras sinergias.
- Ronda 5: enemigo mixto con cartas de nivel 2-3.
- Ronda 6: jefe MVP.

Vida del jugador:

- Vida inicial: 20.
- Perder combate: -3 vida en rondas 1-2, -5 vida en rondas 3-4, -7 vida en rondas 5+.
- Empate: sin dano.
- Llegar a vida 0: `GameOver`.
- Superar ronda final: `Victory`.

## HUD

Tienda:

- Fase en grande arriba en el centro, usando nombre real visible y no el nombre del enum. Por ejemplo, `ShopPhase` se muestra como `Fase de compra`.
- Ronda justo debajo de la fase.
- Vida abajo a la izquierda, con icono de corazon, vida restante y vida total.
- Oro abajo a la derecha, con el numero de oro y hasta 10 monedas. Las monedas disponibles se muestran amarillas y las gastadas o no disponibles grises. Si el jugador tiene mas de 10 oro, se muestran 10 monedas amarillas y el numero conserva el valor real.
- Nivel de tienda abajo en el centro.
- Botones: refrescar, congelar, subir tienda, finalizar.
- Los botones de tienda son mas delgados y estan alineados horizontalmente arriba a la derecha de la tienda.
- El boton de subir tienda indica el oro que cuesta subir.
- Oferta de tienda.
- Mano.
- Tablero.

Tabla de informacion de combate:

- Se muestra fuera del area principal de juego, a la derecha.
- No debe restar espacio a la tienda ni al tablero principal.

Combate:

- Tablero del jugador.
- Tablero enemigo.
- Carta atacante y objetivo.
- Vida actual de cartas.
- Log o texto breve de eventos.
- Resultado al terminar.

Resultado:

- Victoria, derrota o empate.
- Dano recibido si aplica.
- Boton para continuar.

## Presentacion de Cartas

Todas las cartas visibles deben tener tamano fijo, ser completamente cuadradas y usar bordes suavizados. El contenido textual se muestra en este orden:

```text
[${Tier}]
${NombreCarta}
${DescripcionCarta}
${AtaqueCarta} ${VidaCarta}
```

El fondo base de las cartas se mantiene como esta actualmente. Si una carta es una fusion de 3 cartas, se muestra dorada. Si una carta esta en una tienda congelada, su fondo se muestra azulado claro. Si una carta es dorada y ademas esta congelada en tienda, debe mantener lectura de carta dorada con tinte azul-dorado.

El borde de la carta debe ser mas grueso y usar color segun tipo:

| Tipo | Color de borde |
| --- | --- |
| Neutral | Gris |
| Bestia | Verde |
| Maquina | Amarillo |
| Arcano | Azul |
| No muerto | Negro claro |
| Elemental | Rojo |

Si una carta tiene dos tipos, la UI debe definir una prioridad o representacion consistente antes de implementarse.

## Casos Limite

- Comprar sin oro suficiente: accion rechazada.
- Comprar con mano llena: accion rechazada.
- Colocar en tablero lleno: accion rechazada.
- Refrescar sin oro: accion rechazada.
- Subir tienda al nivel 6: accion rechazada.
- Vender carta inexistente: accion rechazada.
- Finalizar tienda sin cartas en tablero: permitido, pero combate probablemente perdido.
- Efecto aleatorio sin objetivos: no-op con log.
- Provocar multiple: objetivo aleatorio entre cartas con Provocar.
- Ataque doble con objetivo muerto tras primer ataque: recalcular objetivo para segundo ataque.
- Muerte simultanea: resolver muertes de ambos bandos antes del siguiente ataque.
- Fusion tras comprar: aplicar `[Compra]` primero, luego evaluar fusion para MVP.

## Historias de Usuario

- Como jugador, quiero comprar cartas de una tienda aleatoria para mejorar mi tablero.
- Como jugador, quiero vender cartas para recuperar oro y cambiar estrategia.
- Como jugador, quiero ordenar mi tablero para controlar el orden de ataque.
- Como jugador, quiero congelar la tienda para comprar cartas utiles en la siguiente ronda.
- Como jugador, quiero subir el nivel de tienda para acceder a cartas mejores.
- Como jugador, quiero que 3 copias se fusionen automaticamente para sentir progresion.
- Como jugador, quiero ver el combate automatico para entender si mi composicion funciona.
- Como disenador, quiero anadir cartas editando datos sin tocar la escena principal.
- Como desarrollador, quiero reproducir combates por seed para depurar bugs.

## Criterios de Aceptacion Globales

- Se puede iniciar una partida nueva y jugar hasta victoria o derrota.
- La tienda respeta nivel, oro, congelacion y refresco.
- El tablero respeta el limite de 7 cartas.
- El combate se resuelve sin input del jugador.
- Con la misma seed y decisiones, el resultado es identico.
- Existen tests automatizados para los sistemas centrales.
- Los datos iniciales incluyen suficientes cartas y enemigos para 6 rondas.
