# Tareas

## Estado

Estados validos: `pending`, `in_progress`, `done`, `blocked`.

Nota de verificacion: en PowerShell puede ser necesario usar `npm.cmd` en vez de `npm` si la execution policy bloquea `npm.ps1`.

## T-001 - Migrar infraestructura a TypeScript/Vite/Vitest

- Estado: `done`
- Objetivo: reemplazar la entrada webpack/JS por una base TypeScript con Vite y Vitest.
- Archivos afectados: `package.json`, `index.html`, `src/main.ts`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`.
- Descripcion: configurar build, dev server y test runner manteniendo una aplicacion web local simple.
- Criterios de aceptacion: `npm run build` genera build; `npm test` ejecuta Vitest; la app muestra una pantalla placeholder.
- Tests requeridos: test smoke inicial.
- Dependencias: ninguna.
- Verificacion: `npm.cmd test` y `npm.cmd run build` pasan.

## T-002 - Definir tipos de dominio base

- Estado: `done`
- Objetivo: crear tipos para cartas, efectos, clases, zonas, jugador, enemigo y partida.
- Archivos afectados: `src/core/types.ts`.
- Descripcion: modelar datos e instancias sin logica de presentacion.
- Criterios de aceptacion: los tipos permiten representar cartas base, instancias y estado de partida.
- Tests requeridos: compilacion TypeScript.
- Dependencias: `T-001`.

## T-003 - Implementar RNG determinista

- Estado: `done`
- Objetivo: crear servicio RNG seeded.
- Archivos afectados: `src/core/rng/rng.ts`, `src/core/rng/rng.test.ts`.
- Descripcion: implementar API para enteros, floats, elegir elemento y barajar.
- Criterios de aceptacion: misma seed produce misma secuencia; seeds distintas producen secuencias distintas.
- Tests requeridos: determinismo, rango de enteros, eleccion de arrays.
- Dependencias: `T-001`.

## T-004 - Crear datos iniciales de balance

- Estado: `done`
- Objetivo: definir costes, oro por ronda, limites y progresion.
- Archivos afectados: `src/data/balance.ts`, `docs/balance.md`.
- Descripcion: centralizar valores numericos del MVP.
- Criterios de aceptacion: economia y tienda consumen valores desde datos.
- Tests requeridos: validacion de tabla de oro y costes de tienda.
- Dependencias: `T-002`.

## T-005 - Crear catalogo inicial de cartas

- Estado: `done`
- Objetivo: definir cartas MVP suficientes para niveles 1-3 inicialmente.
- Archivos afectados: `src/data/cards.ts`.
- Descripcion: incluir cartas neutrales y de las 5 clases con efectos simples.
- Criterios de aceptacion: cada carta tiene ID unico, nivel valido, stats validas y texto visible.
- Tests requeridos: validacion de catalogo.
- Dependencias: `T-002`.

## T-006 - Crear factory de instancias de cartas

- Estado: `done`
- Objetivo: convertir definiciones en instancias jugables.
- Archivos afectados: `src/core/cards/card-factory.ts`, `src/core/cards/card-factory.test.ts`.
- Descripcion: generar `instanceId`, stats actuales y estado inicial.
- Criterios de aceptacion: cada instancia es independiente y referencia su definicion.
- Tests requeridos: independencia de instancias y stats iniciales.
- Dependencias: `T-002`, `T-005`.

## T-007 - Implementar economia

- Estado: `done`
- Objetivo: manejar oro por ronda, compra, venta, refresco y subida de tienda.
- Archivos afectados: `src/core/economy/economy.ts`, `src/core/economy/economy.test.ts`.
- Descripcion: funciones puras para validar y aplicar costes.
- Criterios de aceptacion: no permite oro negativo; descarta oro al final de ronda.
- Tests requeridos: oro por ronda, compra sin oro, venta, refresco, subida de nivel.
- Dependencias: `T-004`.

## T-008 - Implementar tienda

- Estado: `done`
- Objetivo: generar oferta por nivel y soportar refresco/congelacion.
- Archivos afectados: `src/core/shop/shop.ts`, `src/core/shop/shop.test.ts`.
- Descripcion: usar RNG central y catalogo de cartas filtrado por nivel.
- Criterios de aceptacion: tienda respeta nivel; congelar conserva oferta; refrescar cambia usando RNG.
- Tests requeridos: generacion por nivel, determinismo, congelacion, slot comprado.
- Dependencias: `T-003`, `T-005`, `T-006`, `T-007`.

## T-009 - Implementar zonas de jugador

- Estado: `done`
- Objetivo: comprar a mano, mover a tablero, devolver a mano, vender y reordenar.
- Archivos afectados: `src/core/player/player-board.ts`, `src/core/player/player-board.test.ts`.
- Descripcion: aplicar limites de mano y tablero.
- Criterios de aceptacion: no permite tablero >7 ni mano >10; reordenar conserva cartas.
- Tests requeridos: mover, vender, reordenar, limites.
- Dependencias: `T-006`, `T-007`.

## T-010 - Implementar fusiones

- Estado: `done`
- Objetivo: fusionar automaticamente 3 copias en mano/tablero.
- Archivos afectados: `src/core/cards/fusion.ts`, `src/core/cards/fusion.test.ts`.
- Descripcion: detectar copias por `definitionId` y crear version mejorada.
- Criterios de aceptacion: consume 3 copias; crea carta mejorada con doble stats base; respeta zona de reemplazo.
- Tests requeridos: mano, tablero, mixto mano-tablero, no fusionar solo 2.
- Dependencias: `T-006`, `T-009`.

## T-011 - Implementar motor de efectos MVP

- Estado: `done`
- Objetivo: ejecutar efectos data-driven basicos.
- Archivos afectados: `src/core/effects/effect-engine.ts`, `src/core/effects/effect-engine.test.ts`.
- Descripcion: soportar buff, dano aleatorio, invocacion simple, triggers y no-op sin objetivos.
- Criterios de aceptacion: los efectos se ejecutan desde payloads tipados y generan eventos de log.
- Tests requeridos: cada tipo de efecto MVP y caso sin objetivos.
- Dependencias: `T-003`, `T-006`.

## T-012 - Implementar combate basico

- Estado: `done`
- Objetivo: resolver combate automatico sin UI.
- Archivos afectados: `src/core/combat/combat.ts`, `src/core/combat/combat.test.ts`.
- Descripcion: alternar bandos, atacar izquierda a derecha, elegir objetivos y resolver muertes.
- Criterios de aceptacion: produce resultado y log determinista.
- Tests requeridos: victoria, derrota, empate, provocar, ataque doble, muerte simultanea.
- Dependencias: `T-003`, `T-006`, `T-011`.

## T-013 - Implementar sinergias MVP

- Estado: `done`
- Objetivo: activar sinergias de las 5 clases.
- Archivos afectados: `src/data/synergies.ts`, `src/core/synergies/synergy-engine.ts`, `src/core/synergies/synergy-engine.test.ts`.
- Descripcion: contar clases y ejecutar efectos asociados.
- Criterios de aceptacion: cada sinergia se activa con 3+ cartas de clase y no con neutrales.
- Tests requeridos: una prueba por clase, cartas duales, neutrales.
- Dependencias: `T-011`, `T-012`.

## T-014 - Crear enemigos MVP

- Estado: `done`
- Objetivo: definir enemigos para 6 rondas.
- Archivos afectados: `src/data/enemies.ts`.
- Descripcion: configurar tableros enemigos con dificultad progresiva.
- Criterios de aceptacion: cada ronda tiene enemigo valido con maximo 7 cartas.
- Tests requeridos: validacion de enemigos y referencias a cartas existentes.
- Dependencias: `T-005`.

## T-015 - Implementar maquina de estados de partida

- Estado: `done`
- Objetivo: conectar tienda, combate, resolucion y progresion.
- Archivos afectados: `src/core/state/game-state.ts`, `src/core/state/game-state.test.ts`.
- Descripcion: transiciones validas y acciones principales de jugador.
- Criterios de aceptacion: se puede simular una partida completa por funciones de core.
- Tests requeridos: flujo ronda 1, derrota, victoria, transicion invalida.
- Dependencias: `T-007`, `T-008`, `T-009`, `T-010`, `T-012`, `T-014`.

## T-016 - Crear presentacion Phaser inicial

- Estado: `done`
- Objetivo: mostrar una escena principal con datos reales del core.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/main.ts`.
- Descripcion: renderizar HUD, tienda, mano, tablero y botones basicos.
- Criterios de aceptacion: el jugador puede ejecutar acciones de tienda desde UI.
- Tests requeridos: smoke manual; build.
- Dependencias: `T-015`.

## T-017 - Mostrar combate y resultado

- Estado: `done`
- Objetivo: visualizar resolucion de combate y resultado de ronda.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/ui/*`.
- Descripcion: reproducir eventos del log de combate con animaciones simples o pasos visibles.
- Criterios de aceptacion: se ve atacante, objetivo, dano, muertes y resultado.
- Tests requeridos: build; prueba manual de ronda completa.
- Dependencias: `T-016`.

## T-018 - Pulir validacion de datos

- Estado: `done`
- Objetivo: detectar errores de catalogo, enemigos, sinergias y balance.
- Archivos afectados: `src/data/validate-data.ts`, `src/data/validate-data.test.ts`.
- Descripcion: validar IDs, niveles, stats, referencias y limites.
- Criterios de aceptacion: datos invalidos fallan en tests con mensaje claro.
- Tests requeridos: validacion positiva y casos negativos representativos.
- Dependencias: `T-005`, `T-013`, `T-014`.

## T-019 - Prueba de partida completa determinista

- Estado: `done`
- Objetivo: cubrir una partida simulada con seed fija.
- Archivos afectados: `src/core/state/full-game.test.ts`.
- Descripcion: ejecutar decisiones scripted y validar resultado estable.
- Criterios de aceptacion: misma seed y acciones producen mismo resultado y logs equivalentes.
- Tests requeridos: partida scripted.
- Dependencias: `T-015`.

## T-020 - Revision de balance MVP

- Estado: `done`
- Objetivo: ajustar numeros despues de jugar el loop completo.
- Archivos afectados: `src/data/balance.ts`, `src/data/cards.ts`, `src/data/enemies.ts`, `docs/balance.md`.
- Descripcion: revisar dificultad, costes y estadisticas.
- Criterios de aceptacion: partida ganable con decisiones razonables y perdible con mala gestion.
- Tests requeridos: actualizar snapshots o expectativas afectadas.
- Dependencias: `T-017`, `T-019`.

## T-021 - Renombrar mecanicas visibles de cartas

- Estado: `pending`
- Objetivo: sustituir nombres antiguos de mecanicas por etiquetas visibles entre corchetes.
- Archivos afectados: `src/core/types.ts`, `src/data/cards.ts`, `src/data/synergies.ts`, `src/data/validate-data.ts`, `src/presentation/scenes/GameScene.ts`, tests afectados.
- Descripcion: mantener triggers internos tipados, anadir si falta soporte para `onSell` y `onPlay`, y mostrar textos de carta con las etiquetas `[Compra]`, `[Venta]`, `[Jugar]`, `[Muerte]`, `[Inicio Combate]` y `[Fin Tienda]`.
- Criterios de aceptacion: ninguna carta visible usa `Grito de compra`, `Venta`, `Jugar carta`, `Ultimo aliento`, `Inicio de combate` ni `Fin de Tienda`; los textos usan las etiquetas definidas en `docs/specification.md`.
- Tests requeridos: validacion de catalogo para etiquetas visibles; tests de efectos afectados por `onSell` y `onPlay` si se implementan en esta tarea.
- Dependencias: `T-011`, `T-018`.

## T-022 - Redisenar cartas visuales con formato cuadrado

- Estado: `pending`
- Objetivo: hacer que todas las cartas visibles tengan tamano fijo, formato cuadrado, bordes suavizados y layout textual uniforme.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/ui/*`, estilos o helpers de renderizado de cartas.
- Descripcion: crear o ajustar componente visual de carta para mostrar exactamente `[${Tier}]`, nombre, descripcion, ataque y vida en lineas separadas. Mantener el fondo base actual, mostrar fusiones de 3 cartas con fondo dorado y aplicar borde grueso por tipo.
- Criterios de aceptacion: tienda, mano, tablero, combate y cualquier previsualizacion usan el mismo formato cuadrado; las cartas fusionadas se distinguen en dorado; el borde usa gris para Neutral, verde para Bestia, amarillo para Maquina, azul para Arcano, negro claro para No muerto y rojo para Elemental.
- Tests requeridos: build; prueba visual manual en tienda, mano, tablero y carta fusionada; test unitario o snapshot si existe capa de UI testeable.
- Dependencias: `T-010`, `T-016`, `T-021`.

## T-023 - Sustituir posiciones de Mano por Tablero

- Estado: `pending`
- Objetivo: reemplazar la pagina o layout de posiciones de Mano por posiciones de Tablero.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/ui/*`, constantes de layout.
- Descripcion: retirar la dependencia visual de posiciones de mano como vista principal de colocacion y usar posiciones de tablero para las cartas activas. La mano debe seguir existiendo como zona, pero la colocacion y orden relevante deben comunicarse desde el tablero.
- Criterios de aceptacion: la UI no muestra una pagina de posiciones de Mano como superficie de colocacion principal; las posiciones configurables y reordenables corresponden al Tablero.
- Tests requeridos: build; prueba manual de compra, colocacion y reordenacion.
- Dependencias: `T-016`.

## T-024 - Implementar drag and drop entre tienda, mano y tablero

- Estado: `pending`
- Objetivo: sustituir interacciones por click con arrastre de cartas.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/input/*`, `src/presentation/ui/*`, tests afectados.
- Descripcion: permitir comprar arrastrando de tienda a mano, colocar arrastrando de mano a tablero, vender arrastrando de tablero a tienda y mover cartas dentro del tablero para recolocarlas donde quiera el jugador.
- Criterios de aceptacion: las acciones principales de cartas ya no dependen del click; los drops invalidos devuelven la carta a su origen sin cambiar estado; el tablero permite reordenar cartas mediante arrastre.
- Tests requeridos: build; pruebas manuales de comprar, colocar, vender, reordenar y drops invalidos; tests de core existentes deben seguir pasando.
- Dependencias: `T-009`, `T-016`, `T-023`.

## T-025 - Reorganizar controles e informacion de tienda

- Estado: `pending`
- Objetivo: ajustar HUD y controles de tienda segun el nuevo layout.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/ui/*`, estilos o constantes de layout.
- Descripcion: mostrar fase grande arriba al centro con nombre legible, ronda debajo, vida abajo a la izquierda con corazon y vida actual/total, oro abajo a la derecha con numero y hasta 10 monedas amarillas o grises, tier de tienda abajo al centro, y botones Refrescar, Congelar, Subir Tienda y Finalizar mas delgados y alineados horizontalmente arriba a la derecha de la tienda.
- Criterios de aceptacion: `ShopPhase` se muestra como `Fase de compra` y los demas estados usan nombres reales; el boton de subir tienda indica coste actual; las monedas muestran maximo 10 iconos aunque el oro real sea mayor; los botones no invaden tienda, mano ni tablero.
- Tests requeridos: build; prueba visual manual en fase de compra, combate y resolucion.
- Dependencias: `T-016`, `T-017`.

## T-026 - Aplicar reduccion del coste de subir tienda por turno

- Estado: `pending`
- Objetivo: reducir en 1 oro el coste de subir tienda en cada turno.
- Archivos afectados: `src/data/balance.ts`, `src/core/economy/economy.ts`, `src/core/state/game-state.ts`, tests afectados.
- Descripcion: almacenar el coste restante de subida por nivel o calcularlo desde turnos transcurridos, aplicar reduccion al comenzar cada fase de tienda y mostrar el valor actualizado en UI.
- Criterios de aceptacion: el coste baja 1 por turno hasta minimo 0; subir tienda consume el coste actual; al subir de nivel se usa el coste base del nuevo tramo con sus reducciones correspondientes; la UI muestra el coste real.
- Tests requeridos: economia de reduccion por turno, coste minimo 0, subida consumiendo coste actual, regresion de flujo de rondas.
- Dependencias: `T-007`, `T-015`, `T-025`.

## T-027 - Mostrar congelacion de tienda sobre las cartas

- Estado: `pending`
- Objetivo: indicar visualmente que una tienda esta congelada cambiando el fondo de sus cartas.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/ui/*`, estilos o helpers de renderizado de cartas.
- Descripcion: cuando la tienda esta congelada, las cartas de tienda usan fondo azulado claro. Si una carta de tienda congelada tambien es dorada, usar una lectura azul-dorada que conserve ambas senales.
- Criterios de aceptacion: congelar cambia inmediatamente el aspecto de las cartas de tienda; descongelar o avanzar con tienda no congelada restaura el fondo normal; las cartas doradas congeladas se distinguen de doradas normales y congeladas normales.
- Tests requeridos: build; prueba visual manual de congelar, descongelar y comprar tras congelar.
- Dependencias: `T-008`, `T-022`, `T-025`.

## T-028 - Mover tabla de informacion de combate fuera del area de juego

- Estado: `pending`
- Objetivo: colocar la informacion de combate a la derecha del juego para no restar espacio a tienda ni tablero.
- Archivos afectados: `src/presentation/scenes/GameScene.ts`, `src/presentation/ui/*`, constantes de layout.
- Descripcion: separar la tabla o panel de informacion de combate del area principal de juego y anclarlo a la derecha en un layout que no reduzca el espacio de tienda, mano ni tablero.
- Criterios de aceptacion: el panel de combate esta fuera del area principal; no tapa cartas ni botones; mantiene legibles atacante, objetivo, dano, muertes, log breve y resultado.
- Tests requeridos: build; prueba visual manual durante combate y resultado.
- Dependencias: `T-017`, `T-025`.
