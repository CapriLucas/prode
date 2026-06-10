# Definiciones Tecnologicas

## Objetivo
Mantener el proyecto simple, entendible y facil de evolucionar. La app debe servir primero para uso individual: consultar partidos, traer probabilidades, calcular recomendaciones y ayudar a completar el prode.

## Principios
- Priorizar pocas tecnologias bien integradas.
- Evitar microservicios, colas, Docker y servicios externos innecesarios para el MVP.
- Usar APIs autorizadas para datos de apuestas; no depender de scraping directo como camino principal.
- Mantener la logica de probabilidades y puntaje separada de la UI para poder testearla bien.
- Guardar secretos en variables de entorno, nunca en el repositorio.

## Stack principal

### Lenguaje
- TypeScript.

Motivo: permite compartir tipos entre UI, API interna y logica de negocio, reduciendo errores en calculos y estructuras de datos.

### Aplicacion web
- Next.js con App Router.
- React para componentes de UI.

Motivo: permite tener frontend y endpoints server-side en el mismo proyecto, sin crear un backend separado para el MVP.

### Estilos
- Tailwind CSS.
- Componentes propios simples antes que una libreria pesada de UI.

Motivo: acelera el armado visual sin introducir demasiada abstraccion. Si mas adelante hace falta una base de componentes, evaluar shadcn/ui.

### Persistencia
- PostgreSQL.
- Drizzle ORM para schema, queries y migraciones.

Motivo: la app se va a hostear en Coolify y PostgreSQL encaja mejor para un despliegue persistente, con backups y crecimiento futuro simple. Drizzle mantiene el acceso a datos tipado y liviano.

Para desarrollo local, usar una instancia local o contenedorizada de PostgreSQL con la misma estructura que produccion.

### Datos de partidos
- Empezar con un dataset precargado versionado en el repo cuando el fixture este disponible.
- Permitir luego reemplazarlo o actualizarlo desde una fuente externa autorizada.

Motivo: el fixture del Mundial 2026 puede cambiar en etapas previas y algunos cruces se definen durante el torneo. Para el MVP, un seed simple es suficiente.

### Datos de cuotas y probabilidades
- Usar un proveedor de odds por API como fuente principal.
- Priorizar proveedores que ofrezcan:
  - Multiples casas de apuesta.
  - Mercado de ganador/empate/ganador.
  - Mercado de resultado exacto.
  - Metadata de mercado: 90 minutos vs incluye prorroga.
  - Timestamp de ultima actualizacion.

Motivo: la app necesita datos normalizados y trazables. Scraping directo queda fuera del camino principal por fragilidad y posibles restricciones de uso.

### Actualizacion de datos
- MVP: boton manual "Actualizar probabilidades".
- Luego: job programado simple si la app queda desplegada.

Motivo: para uso individual no hace falta infraestructura de background jobs desde el dia uno.

### Calculo de predicciones
- Modulo de dominio en TypeScript puro.
- Sin dependencia de UI ni base de datos.

Debe cubrir:
- Conversion de cuotas a probabilidades implicitas.
- Normalizacion y consenso entre casas.
- Deteccion de datos incompletos o antiguos.
- Seleccion de ganador/empate mas probable.
- Seleccion de resultado exacto mas probable.
- Calculo de puntaje esperado con regla 0/3/6.

### Testing
- No priorizar tests como requisito bloqueante del MVP.
- Agregar tests puntuales solo para logica critica o propensa a errores.
- Vitest como herramienta preferida cuando se agreguen tests unitarios de dominio.

Tests recomendados si el tiempo lo permite:
- Calculo de probabilidades.
- Regla de puntaje esperado.
- Casos borde: empate no aplicable, prorroga, mercado de 90 minutos, falta de datos.

### Package manager
- pnpm.

Motivo: instalacion rapida, buen manejo de dependencias y lockfile estable para desarrollo y deploy.

### Deploy
- MVP local primero.
- Produccion en Coolify.
- Base de datos PostgreSQL administrada desde Coolify o conectada como servicio externo.

Condicion: antes de desplegar, definir variables de entorno, backups de PostgreSQL y como se ejecutan las actualizaciones de odds.

## Estructura sugerida

```text
src/
  app/
    page.tsx
    api/
      odds/
      matches/
  components/
  domain/
    odds/
    predictions/
    scoring/
  db/
    schema.ts
    client.ts
  data/
    seeds/
tests/
  domain/
docs/
  definiciones-tecnologicas.md
specs/
```

## Variables de entorno esperadas

```text
DATABASE_URL=postgresql://...
ODDS_API_KEY_IO=
ODDS_API_IO_BASE_URL=https://api.odds-api.io/v3
ODDS_API_IO_SPORT=football
ODDS_API_IO_LEAGUE=international-fifa-world-cup
```

Reglas:
- `.env.local` no se commitea.
- Agregar `.env.example` cuando se cree la app.
- La app debe funcionar sin API key usando datos mock o seed para desarrollo basico.

## Operacion de datos reales

- Ejecutar `pnpm db:migrate` contra PostgreSQL antes de usar la app en Coolify.
- Ejecutar `POST /api/sync/matches` para traer partidos reales desde odds-api.io. Los IDs internos de partido quedan iguales al `event.id` del proveedor.
- Ejecutar `POST /api/sync/odds` para traer odds reales desde odds-api.io usando esos mismos IDs.
- Ejecutar `POST /api/matches` solo para sembrar datos base mock si la tabla esta vacia.
- Si `ODDS_API_KEY_IO` no esta configurada, la app sigue usando datos mock.
- Si `DATABASE_URL` no esta configurada, la app funciona con seeds y persistencia local del navegador.

## Decisiones explicitas

- No usar backend separado en el MVP.
- No usar scraping directo como fuente principal de odds.
- No usar login ni usuarios al principio.
- No usar pagos ni integraciones con plataformas externas de prode.
- No usar modelos predictivos propios complejos al inicio.
- No optimizar por ganancia de apuestas; optimizar por puntaje esperado del prode.
- Usar PostgreSQL como base principal porque el proyecto se va a hostear en Coolify.
- Usar pnpm como package manager.
- No hacer de los tests una prioridad bloqueante para el MVP.

## Pendientes de decision

- Proveedor exacto de odds.
- Fuente exacta del fixture del Mundial 2026.
- Umbral para considerar datos "antiguos".
- Umbral para marcar baja confianza.
- Cantidad de resultados exactos visibles en la lista.
