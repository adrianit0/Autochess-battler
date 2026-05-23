# Cartas MVP

## Proposito

Este documento lista cada carta creada para evaluacion de diseno, balance y claridad de texto visible. La fuente de verdad esta en `src/data/cards.ts`; este archivo resume los datos en formato revisable.

## Resumen

| Carta | Id | Tier | Stats | Clases | Texto visible |
| --- | --- | --- | --- | --- | --- |
| Mercenario | `card_neutral_sellsword` | 1 | 2/2 | Neutral | 2/2 neutral. |
| Rata feroz | `card_beast_rat` | 1 | 3/1 | Bestia | Bestia 3/1. |
| Guardia mecanico | `card_mech_guard` | 1 | 1/3 | Maquina | Provocar. |
| Chispa arcana | `card_arcane_spark` | 1 | 1/2 | Arcano | [Compra]: inflige 1 de dano aleatorio. |
| Llamahuesos | `card_undead_bonecaller` | 1 | 1/1 | No-muerto | [Muerte]: invoca un Esqueleto 1/1. |
| Guijarro viviente | `card_elemental_pebble` | 1 | 1/3 | Elemental | Elemental 1/3. |
| Esqueleto | `card_token_skeleton` | 1 | 1/1 | No-muerto | Ficha 1/1. |
| Alfa de manada | `card_beast_alpha` | 2 | 3/3 | Bestia | [Inicio Combate]: un aliado aleatorio gana +1 ataque. |
| Baluarte mecanico | `card_mech_bulwark` | 2 | 2/5 | Maquina | Provocar. |
| Duelista arcano | `card_arcane_duelist` | 2 | 2/3 | Arcano | Ataque doble. |
| Sepulturero | `card_undead_gravedigger` | 2 | 2/4 | No-muerto | [Fin Tienda]: gana +1 ataque permanente. |
| Avivador elemental | `card_elemental_kindler` | 2 | 2/3 | Elemental | [Compra]: un aliado aleatorio gana +1/+1. |
| Quimera ensamblada | `card_beast_mech_hybrid` | 3 | 4/4 | Bestia, Maquina | Bestia/Maquina 4/4. |
| Orbe vivo | `card_arcane_elemental_orb` | 3 | 3/5 | Arcano, Elemental | [Inicio Combate]: inflige 2 de dano aleatorio. |
| Retornado | `card_undead_revenant` | 3 | 4/5 | No-muerto | [Muerte]: inflige 2 de dano aleatorio. |

## Tier 1

### Mercenario

| Campo | Valor |
| --- | --- |
| Id | `card_neutral_sellsword` |
| Rol | Carta neutral base |
| Stats | 2 ataque / 2 vida |
| Clases | Ninguna |
| Efectos | Ninguno |
| Arte | `placeholder_neutral_sellsword` |
| Descripcion | Carta neutral simple con estadisticas equilibradas. |
| Texto visible | 2/2 neutral. |

Evaluacion inicial:

- Sirve como referencia de stats sin sinergia.
- No activa ninguna clase, asi que deberia ser peor que una carta tribal equivalente cuando el jugador ya busca sinergias.
- Riesgo: puede quedarse sin identidad si no existe una razon futura para comprar neutrales.

### Rata feroz

| Campo | Valor |
| --- | --- |
| Id | `card_beast_rat` |
| Rol | Bestia agresiva temprana |
| Stats | 3 ataque / 1 vida |
| Clases | Bestia |
| Efectos | Ninguno |
| Arte | `placeholder_beast_rat` |
| Descripcion | Bestia agresiva de bajo coste. |
| Texto visible | Bestia 3/1. |

Evaluacion inicial:

- Buen dano temprano, fragil ante intercambios.
- Encaja con identidad de Bestias centrada en ataque.
- Riesgo: si ataca primero puede intercambiar demasiado bien contra unidades de tier 1 con poca vida.

### Guardia mecanico

| Campo | Valor |
| --- | --- |
| Id | `card_mech_guard` |
| Rol | Tanque temprano |
| Stats | 1 ataque / 3 vida |
| Clases | Maquina |
| Efectos | `taunt`, pasivo, objetivo propio |
| Arte | `placeholder_mech_guard` |
| Descripcion | Maquina defensiva con Provocar. |
| Texto visible | Provocar. |

Evaluacion inicial:

- Define la identidad defensiva de Maquinas desde tier 1.
- Protege piezas fragiles y fuerza ataques enemigos.
- Riesgo: Provocar en tier 1 puede ser muy eficiente si se combina pronto con buffs permanentes.

### Chispa arcana

| Campo | Valor |
| --- | --- |
| Id | `card_arcane_spark` |
| Rol | Arcano con impacto al comprar |
| Stats | 1 ataque / 2 vida |
| Clases | Arcano |
| Efectos | `randomDamage`, `onBuy`, objetivo enemigo aleatorio, 1 dano |
| Arte | `placeholder_arcane_spark` |
| Descripcion | Arcano que hace dano al comprarlo. |
| Texto visible | [Compra]: inflige 1 de dano aleatorio. |

Evaluacion inicial:

- Introduce efectos fuera del combate normal.
- Stats bajos compensan el dano inmediato.
- Riesgo: el texto dice que dana un enemigo, pero en tienda puede no existir objetivo claro segun estado de partida.

### Llamahuesos

| Campo | Valor |
| --- | --- |
| Id | `card_undead_bonecaller` |
| Rol | No-muerto de muerte e invocacion |
| Stats | 1 ataque / 1 vida |
| Clases | No-muerto |
| Efectos | `summon`, `onDeath`, invoca `card_token_skeleton` |
| Arte | `placeholder_undead_bonecaller` |
| Descripcion | No-muerto que invoca un esqueleto al morir. |
| Texto visible | [Muerte]: invoca un Esqueleto 1/1. |

Evaluacion inicial:

- Da persistencia al tablero aunque tenga stats base bajos.
- Refuerza identidad de No-muertos con fichas y efectos `[Muerte]`.
- Riesgo: depende de que la invocacion tenga espacio; conviene evaluar casos con tablero lleno.

### Guijarro viviente

| Campo | Valor |
| --- | --- |
| Id | `card_elemental_pebble` |
| Rol | Elemental resistente temprano |
| Stats | 1 ataque / 3 vida |
| Clases | Elemental |
| Efectos | Ninguno |
| Arte | `placeholder_elemental_pebble` |
| Descripcion | Elemental basico resistente. |
| Texto visible | Elemental 1/3. |

Evaluacion inicial:

- Base defensiva simple para activar sinergias elementales.
- Similar al Guardia mecanico sin Provocar, asi que necesita valor por clase.
- Riesgo: puede sentirse redundante frente a `card_mech_guard`.

### Esqueleto

| Campo | Valor |
| --- | --- |
| Id | `card_token_skeleton` |
| Rol | Ficha invocada |
| Stats | 1 ataque / 1 vida |
| Clases | No-muerto |
| Efectos | Ninguno |
| Arte | `placeholder_token_skeleton` |
| Descripcion | Ficha invocada por efectos de No-muertos. |
| Texto visible | Ficha 1/1. |

Evaluacion inicial:

- No aparece en tienda porque `getCardsForShopTier` excluye ids `card_token_*`.
- Permite que No-muertos conserven presencia tras morir.
- Riesgo: al contar como No-muerto puede activar sinergias si las fichas permanecen en el conteo relevante.

## Tier 2

### Alfa de manada

| Campo | Valor |
| --- | --- |
| Id | `card_beast_alpha` |
| Rol | Bestia de soporte ofensivo |
| Stats | 3 ataque / 3 vida |
| Clases | Bestia |
| Efectos | `statBuff`, `onCombatStart`, aliado aleatorio, +1 ataque temporal |
| Arte | `placeholder_beast_alpha` |
| Descripcion | Bestia que mejora el ataque de un aliado al inicio del combate. |
| Texto visible | [Inicio Combate]: un aliado aleatorio gana +1 ataque. |

Evaluacion inicial:

- Buen cuerpo para tier 2 con efecto ofensivo adicional.
- Refuerza plan agresivo de Bestias.
- Riesgo: puede estar por encima de curva si el buff siempre impacta en una unidad relevante.

### Baluarte mecanico

| Campo | Valor |
| --- | --- |
| Id | `card_mech_bulwark` |
| Rol | Tanque principal de tier 2 |
| Stats | 2 ataque / 5 vida |
| Clases | Maquina |
| Efectos | `taunt`, pasivo, objetivo propio |
| Arte | `placeholder_mech_bulwark` |
| Descripcion | Maquina defensiva de nivel 2. |
| Texto visible | Provocar. |

Evaluacion inicial:

- Muy resistente para proteger piezas de escalado.
- Escala claramente desde `card_mech_guard`.
- Riesgo: 5 vida con Provocar puede alargar combates si el dano medio del tier 2 es bajo.

### Duelista arcano

| Campo | Valor |
| --- | --- |
| Id | `card_arcane_duelist` |
| Rol | Atacante arcano repetido |
| Stats | 2 ataque / 3 vida |
| Clases | Arcano |
| Efectos | `doubleAttack`, pasivo, objetivo propio |
| Arte | `placeholder_arcane_duelist` |
| Descripcion | Atacante arcano con ataque doble. |
| Texto visible | Ataque doble. |

Evaluacion inicial:

- Efecto fuerte si sobrevive al primer intercambio.
- Stats moderados para compensar el doble ataque.
- Riesgo: cualquier buff de ataque aumenta mucho su valor real.

### Sepulturero

| Campo | Valor |
| --- | --- |
| Id | `card_undead_gravedigger` |
| Rol | Escalado permanente de No-muertos |
| Stats | 2 ataque / 4 vida |
| Clases | No-muerto |
| Efectos | `statBuff`, `onShopTurnEnd`, propio, +1 ataque permanente |
| Arte | `placeholder_undead_gravedigger` |
| Descripcion | No-muerto que crece cuando termina la tienda. |
| Texto visible | [Fin Tienda]: gana +1 ataque permanente. |

Evaluacion inicial:

- Premia comprarlo pronto y mantenerlo varias rondas.
- Da a No-muertos una via de escalado que no depende solo de fichas.
- Riesgo: puede crecer sin coste ni decision si permanece en tablero durante muchas rondas.

### Avivador elemental

| Campo | Valor |
| --- | --- |
| Id | `card_elemental_kindler` |
| Rol | Buff permanente al comprar |
| Stats | 2 ataque / 3 vida |
| Clases | Elemental |
| Efectos | `statBuff`, `onBuy`, aliado aleatorio, +1/+1 permanente |
| Arte | `placeholder_elemental_kindler` |
| Descripcion | Elemental que mejora a otro elemental. |
| Texto visible | [Compra]: un aliado aleatorio gana +1/+1. |

Evaluacion inicial:

- Introduce identidad elemental de crecimiento permanente.
- Buen incentivo para secuenciar compras con tablero existente.
- Riesgo: texto y descripcion sugieren Elemental, pero el efecto actual elige cualquier aliado aleatorio.

## Tier 3

### Quimera ensamblada

| Campo | Valor |
| --- | --- |
| Id | `card_beast_mech_hybrid` |
| Rol | Carta de doble clase sin efecto |
| Stats | 4 ataque / 4 vida |
| Clases | Bestia, Maquina |
| Efectos | Ninguno |
| Arte | `placeholder_beast_mech_hybrid` |
| Descripcion | Carta de doble clase para validar sinergias mixtas. |
| Texto visible | Bestia/Maquina 4/4. |

Evaluacion inicial:

- Facilita combinaciones de sinergias Bestia y Maquina.
- Cuerpo simple y estable para tier 3.
- Riesgo: puede ser demasiado plana si las sinergias no compensan la falta de efecto propio.

### Orbe vivo

| Campo | Valor |
| --- | --- |
| Id | `card_arcane_elemental_orb` |
| Rol | Doble clase con dano inicial |
| Stats | 3 ataque / 5 vida |
| Clases | Arcano, Elemental |
| Efectos | `randomDamage`, `onCombatStart`, enemigo aleatorio, 2 dano |
| Arte | `placeholder_arcane_elemental_orb` |
| Descripcion | Arcano y Elemental con dano aleatorio al inicio del combate. |
| Texto visible | [Inicio Combate]: inflige 2 de dano aleatorio. |

Evaluacion inicial:

- Buena mezcla de cuerpo resistente y valor antes de ataques.
- Activa dos clases relevantes para composiciones mixtas.
- Riesgo: el dano aleatorio puede decidir combates antes de que el jugador entienda por que.

### Retornado

| Campo | Valor |
| --- | --- |
| Id | `card_undead_revenant` |
| Rol | No-muerto resistente con efecto `[Muerte]` |
| Stats | 4 ataque / 5 vida |
| Clases | No-muerto |
| Efectos | `randomDamage`, `onDeath`, enemigo aleatorio, 2 dano |
| Arte | `placeholder_undead_revenant` |
| Descripcion | No-muerto resistente con efecto `[Muerte]` ofensivo. |
| Texto visible | [Muerte]: inflige 2 de dano aleatorio. |

Evaluacion inicial:

- Cuerpo fuerte que castiga al rival cuando muere.
- Buen cierre de curva inicial para No-muertos.
- Riesgo: 4/5 mas 2 dano al morir puede superar a otras opciones de tier 3 sin requerir condicion.

## Notas Globales de Evaluacion

Distribucion actual:

| Categoria | Cantidad |
| --- | --- |
| Cartas totales | 15 |
| Cartas comprables | 14 |
| Fichas | 1 |
| Tier 1 | 7, incluyendo 1 ficha |
| Tier 2 | 5 |
| Tier 3 | 3 |
| Tier 4-6 | 0 |

Cobertura de clases:

| Clase | Cartas |
| --- | --- |
| Bestia | Rata feroz, Alfa de manada, Quimera ensamblada |
| Maquina | Guardia mecanico, Baluarte mecanico, Quimera ensamblada |
| Arcano | Chispa arcana, Duelista arcano, Orbe vivo |
| No-muerto | Llamahuesos, Esqueleto, Sepulturero, Retornado |
| Elemental | Guijarro viviente, Avivador elemental, Orbe vivo |
| Neutral | Mercenario |

Puntos a revisar en playtest:

- Claridad de objetivos aleatorios: asegurar que el log de combate explica quien recibio dano o buff.
- Diferencia entre Maquina y Elemental defensivo en tier 1: `card_mech_guard` tiene Provocar y `card_elemental_pebble` no.
- Potencia de buffs permanentes: `card_undead_gravedigger` y `card_elemental_kindler` pueden escalar sin limite duro visible.
- Coherencia de `card_elemental_kindler`: el nombre sugiere apoyar elementales, pero el efecto actual mejora cualquier aliado.
- Valor de doble clase: Quimera ensamblada y Orbe vivo pueden activar dos sinergias con una sola plaza de tablero.

## Checklist de Revision por Carta

| Carta | Identidad clara | Texto claro | Riesgo principal |
| --- | --- | --- | --- |
| Mercenario | Media | Alta | Falta de razon para comprarlo tarde |
| Rata feroz | Alta | Alta | Demasiado dano si ataca primero |
| Guardia mecanico | Alta | Alta | Provocar muy eficiente con buffs |
| Chispa arcana | Alta | Media | Objetivo de `onBuy` poco evidente |
| Llamahuesos | Alta | Alta | Invocacion con tablero lleno |
| Guijarro viviente | Media | Alta | Redundancia con Maquina defensiva |
| Esqueleto | Alta | Alta | Conteo de sinergia por fichas |
| Alfa de manada | Alta | Alta | Buff siempre util |
| Baluarte mecanico | Alta | Alta | Combates demasiado largos |
| Duelista arcano | Alta | Alta | Escala mucho con ataque |
| Sepulturero | Alta | Alta | Escalado permanente pasivo |
| Avivador elemental | Media | Media | Buff no limitado a elementales |
| Quimera ensamblada | Media | Alta | Dependencia de sinergias externas |
| Orbe vivo | Alta | Alta | Dano inicial decisivo y aleatorio |
| Retornado | Alta | Alta | Cuerpo y efecto `[Muerte]` muy eficientes |
