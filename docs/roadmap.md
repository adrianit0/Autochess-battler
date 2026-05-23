# Roadmap

## MVP

Objetivo: loop completo jugable, determinista y testeado.

Incluye:

- Migracion tecnica a TypeScript, Vite, Phaser 3 y Vitest.
- Core puro de RNG, cartas, economia, tienda, fusiones, efectos, sinergias, combate y estados.
- Datos iniciales de cartas, enemigos, sinergias y balance.
- UI unica con tienda, combate y resultado.
- Animaciones simples desacopladas de la simulacion.
- Tests de core.

Resultado esperado:

- Una partida de 6 rondas se puede jugar localmente.
- El jugador puede ganar o perder.
- El core puede probarse sin navegador.

## Vertical Slice

Objetivo: una ronda completa con calidad representativa.

Incluye:

- Seed fija configurable.
- Ronda 1 con tienda funcional.
- Compra, venta, colocar en tablero, refrescar, congelar y finalizar.
- Un enemigo predefinido.
- Combate automatico con log.
- Resultado y avance a ronda 2.
- Tests de RNG, economia, tienda basica y combate basico.

No requiere:

- Todas las clases.
- Todas las sinergias.
- Balance final.
- Animaciones pulidas.

## Alpha

Objetivo: todos los sistemas del MVP conectados.

Incluye:

- 6 rondas.
- Nivel de tienda 1-6.
- Fusiones.
- Efectos MVP.
- Sinergias MVP.
- Vida del jugador.
- Victoria y derrota.
- Tests de regresion de sistemas.

## Beta

Objetivo: estabilizacion de experiencia.

Incluye:

- UI mas clara.
- Feedback de errores.
- Logs visuales de combate.
- Ajustes de balance.
- Revision de casos limite.
- Pruebas manuales de partidas completas.

## Balance

Objetivo: que el MVP sea corto, legible y rejugable.

Incluye:

- Ajuste de stats por nivel.
- Ajuste de enemigos por ronda.
- Ajuste de dano recibido.
- Revision de costes de subir tienda.
- Registro de cambios en `docs/balance.md`.

## Contenido Futuro

Fuera del MVP, candidatos:

- Mas cartas por clase.
- Pool de tienda con copias limitadas.
- Probabilidades ponderadas por nivel.
- Heroes o poderes de jugador.
- Recompensas despues de combate.
- Eventos de ronda.
- Persistencia de progreso.
- Tutorial.
- Sonido.
- Mas animaciones.
- Localizacion.

## Priorizacion de Sistemas

1. Infraestructura tecnica y tests.
2. Tipos de dominio y validacion de datos.
3. RNG determinista.
4. Economia.
5. Tienda.
6. Cartas e instancias.
7. Fusiones.
8. Combate basico.
9. Efectos.
10. Sinergias.
11. Estado de partida.
12. Datos de contenido.
13. Presentacion Phaser.
14. Animaciones.
15. Pulido y balance.

## Riesgos Tecnicos

- Migracion desde plantilla webpack a Vite puede generar churn inicial.
- Phaser puede contaminar el core si no se respetan capas.
- Efectos demasiado genericos pueden volverse dificiles de tipar.
- La reproduccion determinista se rompe si algun sistema usa RNG externo.
- Los tests pueden volverse fragiles si validan logs demasiado detallados.

Mitigaciones:

- Migrar primero build y tests antes de implementar sistemas grandes.
- Mantener `core` sin imports de `presentation`.
- Empezar con pocos tipos de efecto y payloads discriminados.
- Testear determinismo de combate temprano.
- Separar eventos semanticos de detalles visuales.

## Riesgos de Diseno

- Pocas cartas pueden hacer que las partidas sean repetitivas.
- Sinergias demasiado fuertes pueden eliminar decisiones.
- Combate aleatorio puede sentirse injusto si no se comunica bien.
- Fusiones automaticas pueden sorprender si mueven cartas sin feedback.
- No conservar oro simplifica, pero reduce profundidad economica.

Mitigaciones:

- Mantener partidas cortas.
- Priorizar legibilidad en textos.
- Mostrar log de combate.
- Mostrar feedback de fusion.
- Registrar balance y revisar despues de partidas manuales.

## Dependencias Entre Tareas

- La UI depende de datos y core estables.
- Combate depende de cartas, RNG y efectos basicos.
- Sinergias dependen de efectos y conteo de clases.
- Fusiones dependen de zonas de jugador e instancias de carta.
- Progresion depende de economia, tienda, enemigos y combate.
- Tests de partida completa dependen del estado global.
