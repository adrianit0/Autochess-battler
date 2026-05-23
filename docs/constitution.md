# Constitucion del Proyecto

## Proposito

Este documento define las reglas base para desarrollar el MVP de un juego de cartas con mecanicas de autochess/autobattler. Cualquier especificacion, tarea o cambio de codigo debe ser compatible con esta constitucion.

## Principios de Diseno

1. **Claridad antes que profundidad**: cada sistema debe ser comprensible para el jugador sin depender de excepciones ocultas.
2. **Simulacion determinista**: la logica de tienda, combate y efectos debe poder reproducirse con la misma seed.
3. **Data-driven primero**: cartas, enemigos, sinergias, costes y balance deben vivir en datos configurables siempre que sea razonable.
4. **Combate legible**: el jugador debe poder entender por que una carta ataco, a quien golpeo, cuanto dano hizo y por que murio.
5. **MVP pequeno y completo**: se prioriza un loop jugable completo por encima de volumen de contenido.
6. **Separacion estricta entre logica y presentacion**: el juego debe poder simularse sin renderizado.

## Reglas Innegociables

- No usar RNG global ni llamadas aleatorias fuera del servicio centralizado de RNG.
- La simulacion de combate no puede depender de animaciones, Phaser, DOM ni timers reales.
- Ningun sistema de UI debe modificar directamente datos internos sin pasar por acciones o servicios de dominio.
- Cada carta debe tener un ID estable y unico.
- Cada enemigo debe estar definido por datos y no por logica hardcodeada en escenas.
- Las reglas del MVP tienen prioridad sobre inspiraciones externas.
- Las pruebas automatizadas deben poder ejecutar core game logic sin navegador.

## Alcance Inicial

El proyecto implementara una partida single-player por rondas contra enemigos predefinidos. El jugador compra, vende, fusiona, ordena cartas y finaliza la tienda. Despues se ejecuta un combate automatico y se avanza de ronda hasta victoria o derrota.

## MVP

Incluido en MVP:

- Una pantalla principal con vista de tienda, combate y resultado.
- Estado de partida nuevo desde cero.
- Economia basica: oro por ronda, compra, venta, refresco y subida de tienda.
- Tienda con cartas aleatorias segun nivel.
- Congelar tienda.
- Tablero de jugador con maximo 7 cartas.
- Mano de jugador para cartas compradas antes de colocarlas.
- Enemigos predefinidos por ronda.
- Combate automatico determinista.
- Provocar, ataque doble, `[Muerte]`, `[Compra]`, `[Inicio Combate]`, `[Fin Tienda]`, dano aleatorio y mejora de estadisticas.
- Fusiones automaticas de 3 copias controladas por el jugador en mano y tablero.
- Cinco clases provisionales: Bestias, Maquinas, Arcanos, No-muertos y Elementales.
- Sinergias simples data-driven.
- Tests del core: RNG, tienda, economia, fusiones, combate, efectos y estados.

Fuera del MVP:

- Multijugador.
- Matchmaking.
- IA enemiga dinamica.
- Construccion de mazos.
- Persistencia compleja.
- Coleccion permanente.
- Audio avanzado.
- Animaciones complejas.
- Tutorial completo.
- Monetizacion.
- Localizacion multiidioma.
- Editor visual de cartas.

## Criterios de Calidad

- El loop principal debe poder completarse sin errores bloqueantes.
- Cada accion visible debe tener feedback minimo.
- Los estados imposibles deben bloquearse por logica de dominio, no solo por UI.
- Los errores de datos deben fallar temprano durante validacion o tests.
- El combate debe generar un log legible para depuracion y tests.
- El proyecto debe compilar sin errores y los tests deben pasar antes de ampliar contenido.

## Criterios de Mantenibilidad

- Los sistemas compartidos deben tener interfaces pequenas y explicitas.
- Los datos de balance no deben mezclarse con renderizado.
- Los efectos deben ser componibles y no requerir subclases por carta.
- Las nuevas cartas deben poder anadirse principalmente editando datos.
- Las escenas de presentacion deben consumir snapshots o view models del core.
- Los nombres deben expresar dominio de juego, no detalles accidentales de UI.

## Reglas de Arquitectura

Capas obligatorias:

- `src/core`: logica pura de cartas, combate, tienda, economia, efectos, sinergias, RNG y estados.
- `src/data`: definiciones de cartas, enemigos, sinergias, balance y configuracion.
- `src/presentation`: escenas, UI, animaciones e input.
- `src/persistence`: guardado, carga y configuracion local.
- `src/tests` o tests junto a modulos: pruebas automatizadas del core.

Dependencias permitidas:

- `presentation` puede depender de `core` y `data`.
- `core` no puede depender de `presentation`, DOM, Phaser ni APIs de navegador.
- `data` no puede depender de `presentation`.
- `persistence` puede serializar/deserializar snapshots definidos por `core`.

Decision tecnica inicial:

- El repositorio actual es una plantilla HTML/webpack con `js/app.js` vacio.
- Para el MVP se migrara de forma controlada a TypeScript, Vite, Phaser 3 y Vitest, salvo que una restriccion futura indique lo contrario.
- La migracion debe preservar una entrada web simple y no introducir frameworks UI innecesarios.

## Convenciones de Nombres

- IDs de cartas: `card_<clase_o_tipo>_<nombre_slug>`, por ejemplo `card_beast_rat`.
- IDs de enemigos: `enemy_r<numero>_<nombre_slug>`, por ejemplo `enemy_r01_scrap_pack`.
- IDs de efectos: `effect_<tipo>_<detalle>`, por ejemplo `effect_buff_adjacent_attack`.
- IDs de sinergias: `synergy_<class_slug>`, por ejemplo `synergy_beasts`.
- Tipos TypeScript: `PascalCase`.
- Funciones y variables: `camelCase`.
- Constantes de datos exportadas: `camelCase` salvo tablas globales con `UPPER_SNAKE_CASE` si son inmutables.
- Archivos de modulos: `kebab-case.ts`.
- Tests: `*.test.ts`.

## Reglas para Nuevas Cartas

Una carta nueva requiere:

- ID unico.
- Nombre visible.
- Texto visible para jugador.
- Nivel entre 1 y 6.
- Ataque y vida base positivos.
- Entre 0 y 2 clases.
- Lista de efectos, aunque este vacia.
- Placeholder visual valido.
- Justificacion de balance si supera claramente la media de su nivel.
- Al menos un test si introduce un efecto o interaccion nueva.

## Reglas para Nuevos Efectos

Un efecto nuevo requiere:

- Tipo de trigger o timing explicito.
- Payload tipado.
- Reglas de seleccion de objetivo.
- Interaccion con RNG documentada si aplica.
- Comportamiento definido cuando no hay objetivos validos.
- Test unitario del ejecutor de efecto.
- Entrada de texto visible si modifica lo que el jugador debe entender.

## Reglas para Nuevas Sinergias

Una sinergia nueva requiere:

- Clase asociada.
- Condicion de activacion.
- Momento de evaluacion.
- Efecto aplicado.
- Regla para cartas con dos clases.
- Comportamiento definido para cartas neutrales.
- Datos editables sin reescribir el motor comun.

## Reglas para Pruebas Automatizadas

- Todo modulo de `core` debe tener tests para el comportamiento principal.
- Los tests que usen aleatoriedad deben fijar seed.
- No se aceptan tests que dependan de orden aleatorio no especificado.
- El combate debe tener tests de victoria, derrota, empate tecnico, provocar y ataque doble.
- La tienda debe tener tests de generacion por nivel, refresco, congelacion y compra sin oro.
- Las fusiones deben probar mano, tablero y combinacion mano-tablero.
- Los tests de UI pueden ser posteriores al core, pero no sustituyen tests de dominio.

## Politica de Balance Inicial

- El balance inicial debe favorecer partidas cortas y lectura clara.
- Las cartas de nivel superior pueden ser mas eficientes, pero no deben invalidar por completo niveles anteriores.
- El MVP usara pocas cartas por nivel antes de ampliar variedad.
- Cada clase debe tener una identidad mecanica simple.
- Los cambios de balance deben registrarse en `docs/balance.md` cuando alteren estadisticas, costes o progresion.

## Politica de RNG

- Todo RNG pasa por `RngService` o equivalente.
- La seed de partida debe almacenarse en el estado de partida.
- Cada sistema aleatorio debe consumir RNG de forma consistente.
- Los tests pueden inyectar una seed fija o un RNG stub.
- El log de combate debe permitir reproducir decisiones aleatorias relevantes.

## Restricciones Tecnicas

- Lenguaje objetivo: TypeScript.
- Renderizado objetivo: Phaser 3.
- Build objetivo: Vite.
- Tests objetivo: Vitest.
- No introducir backend en MVP.
- No introducir dependencias pesadas para sistemas que pueden resolverse con logica de dominio pequena.
- Mantener compatibilidad con ejecucion local en navegador moderno.
- Evitar assets obligatorios externos; usar placeholders locales para el MVP.
