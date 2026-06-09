---
name: spec
description: Define una especificación funcional a partir de una historia de usuario. Rellena los espacios en blanco con asunciones explícitas, las refina interactivamente pregunta por pregunta con el usuario, y genera el archivo final en specs/<nombre>.md. Si la funcionalidad es grande, la convierte en una épica y la subdivide en historias más pequeñas, cada una con su propia spec. Usar cuando el usuario quiera crear/definir una spec, especificación, épica, o refinar una historia de usuario.
argument-hint: [historia de usuario]
---

# Definir Spec

Flujo interactivo para convertir una historia de usuario en una especificación completa. El proceso tiene 5 fases que se ejecutan SIEMPRE en este orden. La Fase 1b (modo épica) solo aplica cuando la funcionalidad es grande.

## Fase 1 — Recibir la historia de usuario y evaluar tamaño

Si el usuario ya incluyó la historia de usuario como argumento o en su mensaje, úsala. Si no, pídesela y espera su respuesta antes de continuar.

Con la historia en mano, evalúa si la funcionalidad es **grande (tamaño épica)**. Indicadores de que es una épica (basta con que se cumplan 2 o más):

- Abarca varios flujos de usuario claramente independientes (ej: "gestionar" algo implica crear, editar, eliminar, listar, aprobar...).
- Involucra a más de un actor con journeys distintos.
- No podría entregarse de forma incremental en una sola iteración de desarrollo.
- El enunciado agrupa varias capacidades unidas por "y" o por un verbo paraguas ("administrar", "gestionar", "plataforma de...").
- Una sola spec necesitaría una cantidad desproporcionada de flujos alternativos y criterios de aceptación (más de ~10 CA) para cubrirla.

**Si NO es grande**, continúa directamente con la Fase 2 (flujo de spec única).

**Si es grande**, usa `AskUserQuestion` para preguntarle al usuario cómo quiere tratarla, explicando brevemente por qué la consideras tamaño épica. Opciones: "Épica con historias" (recomendada) y "Spec única". Si elige spec única, continúa con la Fase 2; si elige épica, continúa con la Fase 1b.

## Fase 1b — Modo épica: subdividir en historias (solo si aplica)

1. Propón una subdivisión en **historias de usuario más pequeñas** (típicamente 3–7), cada una en formato `Como <actor>, quiero <acción>, para <beneficio>`. Cada historia debe ser independientemente entregable y valiosa (criterio INVEST), y juntas deben cubrir el alcance completo de la épica. Muéstralas como listado numerado y indica qué quedó explícitamente fuera de la épica.
2. Pide al usuario que confirme la subdivisión o indique cambios (agregar, quitar, fusionar, dividir o reformular historias). Itera hasta que confirme.
3. Con la subdivisión confirmada, crea el directorio `specs/<epica>/` (donde `<epica>` es un slug en kebab-case del nombre de la épica) y genera el archivo índice `specs/<epica>/epica.md` con este formato exacto:

```markdown
# Épica: <Título de la épica>

## Descripción
Como <actor>, quiero <acción>, para <beneficio>.

## Objetivo
<qué se busca lograr con la épica completa y por qué>

## Alcance general
**Incluye:**
- ...

**No incluye:**
- ...

## Historias de Usuario
| # | Historia | Spec | Estado |
|---|----------|------|--------|
| 1 | Como ..., quiero ..., para ... | [<slug-historia>](./<slug-historia>.md) | Pendiente |
| 2 | ... | ... | Pendiente |

## Dependencias entre historias
- <historia X> depende de <historia Y> (o "Sin dependencias")
```

4. Luego procesa las historias **una por una, en orden de dependencias**: cada historia pasa por las Fases 2, 3 y 4 completas (asunciones → refinamiento → archivo). El archivo de cada historia se crea en `specs/<epica>/<slug-historia>.md` en lugar de `specs/<nombre>.md`.
5. Al completar la spec de cada historia, actualiza su fila en `epica.md` cambiando el Estado de `Pendiente` a `Especificada`, y pregunta al usuario si desea continuar con la siguiente historia o pausar (las historias restantes quedan como `Pendiente` y pueden retomarse en otra sesión invocando este skill con la historia pendiente; en ese caso detecta la épica existente en `specs/` y reutiliza su directorio e índice).

## Fase 2 — Rellenar espacios en blanco y listar asunciones

Analiza la historia de usuario y rellena tú mismo todos los espacios en blanco necesarios para completar la especificación. Las asunciones deben ser **funcionales o de negocio, NO técnicas** (nada de stack, arquitectura, librerías, base de datos, etc.).

Muestra al usuario un **listado numerado** con TODAS las asunciones que hiciste. Formato:

```
## Asunciones

1. <asunción funcional>
2. <asunción funcional>
3. ...
```

Luego pide al usuario que indique **los números de las asunciones que NO le gustan** (o que confirme si todas están bien). Espera su respuesta.

## Fase 3 — Refinamiento pregunta por pregunta

Por cada número rechazado, haz **una pregunta a la vez** (nunca varias juntas) para obtener la nueva definición. Cada pregunta DEBE incluir:

1. **Barra de progreso** al inicio, mostrando cuántas preguntas lleva respondidas y cuántas faltan. Formato:

   ```
   Progreso: [██████░░░░░░░░░░░░░░] 3/10
   ```

   (20 caracteres de barra, proporcional a respondidas/total; total = cantidad de asunciones rechazadas)

2. **La pregunta** sobre la asunción rechazada, indicando a qué asunción original corresponde.

3. **5 opciones**: 4 asunciones alternativas concretas que propongas tú, más una quinta opción "Otra" para que el usuario escriba su propia respuesta.

Usa la herramienta `AskUserQuestion` para cada pregunta: pon la barra de progreso y el contexto de la asunción en el texto de la pregunta, y las 4 alternativas como opciones (la opción "Otra" la agrega la herramienta automáticamente). Si la herramienta no está disponible, muestra las 5 opciones numeradas en texto y espera la respuesta.

Reglas:
- Una pregunta por turno. Espera la respuesta antes de la siguiente.
- Las 4 alternativas deben ser distintas entre sí y distintas a la asunción original rechazada.
- Actualiza la barra de progreso en cada nueva pregunta.

Al terminar todas las preguntas, anuncia explícitamente: **"Ya me encuentro listo para crear la especificación."** y muestra un resumen breve de las definiciones finales. Espera confirmación del usuario para generar el archivo.

## Fase 4 — Generar el archivo de especificación

Crea el archivo en `specs/<nombre>.md` (relativo a la raíz del proyecto), donde `<nombre>` es un slug en kebab-case derivado de la historia de usuario (ej: `specs/registro-de-usuarios.md`). Crea el directorio `specs/` si no existe.

El archivo DEBE contener exactamente estas secciones, en este orden:

```markdown
# <Título de la spec>

## User Story
Como <actor>, quiero <acción>, para <beneficio>.

## Objetivo
<qué se busca lograr y por qué>

## Alcance
**Incluye:**
- ...

**No incluye:**
- ...

## Actores
- <actor>: <descripción de su rol>

## Precondiciones
- ...

## Disparador
<evento o acción que inicia el flujo>

## Flujo Principal
1. ...
2. ...

## Flujos Alternativos
### FA-1: <nombre>
1. ...

## Reglas de Negocio
- RN-1: ...
- RN-2: ...

## Criterios de Aceptación
- CA-1: ...
- CA-2: ...

## Resultado Esperado
<estado final del sistema/usuario tras completar el flujo>

## Definición BDD/Gherkin
```gherkin
Feature: <nombre de la feature>

  Scenario: <escenario principal>
    Given <contexto>
    When <acción>
    Then <resultado>

  Scenario: <escenario alternativo/borde>
    Given ...
    When ...
    Then ...
```
```

El contenido debe reflejar la historia original más todas las definiciones refinadas en Fase 3 (las asunciones aceptadas se mantienen tal cual). Incluye al menos un escenario Gherkin por cada criterio de aceptación relevante.

Al finalizar, confirma al usuario la ruta del archivo creado.
