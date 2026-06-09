# Predecir Resultado Exacto

## User Story
Como usuario, quiero ver el resultado exacto más probable, para maximizar mis chances de sumar 6 puntos.

## Objetivo
Recomendar al usuario el marcador exacto más probable de un partido, usando probabilidades consenso del mercado de resultado exacto y manteniendo claridad sobre la confianza, el alcance temporal del mercado y la exclusión de tanda de penales.

## Alcance
**Incluye:**
- Recomendar un único resultado exacto principal.
- Usar probabilidades consenso del mercado de resultado exacto.
- Mostrar una lista ordenada de los resultados exactos más probables.
- Mostrar la probabilidad estimada de cada resultado listado.
- Destacar visualmente el resultado exacto con mayor probabilidad.
- Indicar baja confianza cuando varios resultados tengan probabilidades muy cercanas.
- Excluir cualquier definición que dependa de tanda de penales.
- Respetar el alcance temporal del mercado: 90 minutos o incluyendo prórroga.
- Advertir cuando solo exista mercado de resultado exacto a 90 minutos.
- Permitir resultados empatados en partidos eliminatorios solo si el mercado o reglamento considerado los permite.
- Mostrar "sin resultado exacto disponible" cuando no haya datos suficientes.
- Limitar la lista visible a los resultados más probables para mantener la vista simple.

**No incluye:**
- Recomendar ganador, empate o visitante como signo principal.
- Combinar resultado exacto con puntaje esperado total del prode.
- Optimizar por payout de apuestas.
- Permitir apuestas con dinero real.
- Considerar goles de tanda de penales.
- Crear un modelo predictivo propio no basado en probabilidades consenso.

## Actores
- Usuario: persona que participa en un prode y quiere elegir el resultado exacto con mayor probabilidad de acierto.

## Precondiciones
- El usuario seleccionó un partido del Mundial 2026.
- Existen probabilidades consenso disponibles para el mercado de resultado exacto.
- La aplicación conoce si el mercado aplica a 90 minutos o si incluye prórroga.
- La aplicación conoce si los resultados empatados son válidos para el partido y mercado seleccionado.

## Disparador
El usuario abre la recomendación de resultado exacto para un partido seleccionado.

## Flujo Principal
1. La aplicación obtiene las probabilidades consenso de resultado exacto para el partido seleccionado.
2. La aplicación excluye cualquier resultado o definición que dependa de tanda de penales.
3. La aplicación valida el alcance temporal del mercado: 90 minutos o incluyendo prórroga.
4. La aplicación valida si los resultados empatados son aplicables para el partido y mercado seleccionado.
5. La aplicación ordena los resultados exactos por probabilidad estimada descendente.
6. La aplicación identifica el resultado exacto con mayor probabilidad.
7. La aplicación calcula si la diferencia entre los resultados principales indica baja confianza.
8. La aplicación muestra una lista limitada de los resultados más probables con sus probabilidades.
9. La aplicación destaca visualmente el resultado exacto recomendado.
10. La aplicación muestra si la recomendación aplica a 90 minutos o incluye prórroga.

## Flujos Alternativos
### FA-1: Resultados exactos muy cercanos
1. La aplicación compara las probabilidades de los resultados exactos principales.
2. La diferencia entre el resultado más probable y al menos una alternativa es muy pequeña.
3. La aplicación mantiene el resultado de mayor probabilidad como recomendación principal.
4. La aplicación muestra una indicación de baja confianza.

### FA-2: Mercado disponible solo para 90 minutos
1. La aplicación obtiene resultados exactos de un mercado que aplica solo a 90 minutos.
2. La aplicación identifica que el prode considera prórroga.
3. La aplicación muestra la recomendación disponible.
4. La aplicación advierte que el alcance temporal del mercado puede no coincidir exactamente con el reglamento del prode.

### FA-3: Sin datos suficientes
1. La aplicación intenta obtener probabilidades consenso de resultado exacto.
2. No hay datos suficientes para calcular una recomendación confiable.
3. La aplicación muestra el estado "sin resultado exacto disponible".
4. La aplicación evita destacar un resultado exacto principal.

### FA-4: Empate no aplicable
1. La aplicación evalúa un partido o mercado donde los resultados empatados no son válidos.
2. La aplicación excluye resultados exactos empatados de las opciones recomendables.
3. La aplicación ordena solo los resultados exactos válidos restantes.
4. La aplicación muestra que los empates no aplican para ese mercado o reglamento.

## Reglas de Negocio
- RN-1: La recomendación principal debe ser el resultado exacto válido con mayor probabilidad consenso.
- RN-2: La aplicación debe mostrar una lista ordenada de resultados exactos más probables.
- RN-3: Cada resultado listado debe mostrar su probabilidad estimada.
- RN-4: La aplicación debe destacar visualmente un único resultado exacto principal salvo que no haya datos suficientes.
- RN-5: Si varios resultados exactos tienen probabilidades muy cercanas, la aplicación debe indicar baja confianza.
- RN-6: La aplicación debe excluir cualquier dato o interpretación que dependa de tanda de penales.
- RN-7: La aplicación debe informar si el mercado aplica a 90 minutos o si incluye prórroga.
- RN-8: Si el mercado disponible es solo de 90 minutos, la aplicación debe advertir que puede no coincidir con el reglamento del prode.
- RN-9: En partidos eliminatorios, los resultados empatados solo deben permitirse si el mercado o reglamento considerado los permite.
- RN-10: Si no hay datos suficientes, la aplicación debe mostrar "sin resultado exacto disponible".
- RN-11: La lista visible de resultados puede limitarse a los marcadores más probables para mantener simple la vista.
- RN-12: La recomendación de resultado exacto no debe combinarse todavía con el puntaje esperado total del prode.

## Criterios de Aceptación
- CA-1: Dado un partido con probabilidades de resultado exacto disponibles, cuando el usuario abre la recomendación, entonces ve un resultado exacto principal.
- CA-2: Dado que existen múltiples resultados exactos disponibles, cuando se muestra la recomendación, entonces el usuario ve una lista ordenada de los resultados más probables.
- CA-3: Dado que se muestra una lista de resultados, cuando el usuario la consulta, entonces cada resultado tiene una probabilidad estimada.
- CA-4: Dado que un resultado exacto tiene la mayor probabilidad, cuando se muestra la recomendación, entonces ese resultado aparece destacado visualmente.
- CA-5: Dado que varios resultados tienen probabilidades muy cercanas, cuando se muestra la recomendación, entonces la app indica baja confianza.
- CA-6: Dado que el prode excluye tanda de penales, cuando se calcula el resultado exacto, entonces la app no considera goles de tanda de penales.
- CA-7: Dado que el mercado aplica solo a 90 minutos, cuando se muestra la recomendación, entonces la app advierte que puede no coincidir con el reglamento del prode.
- CA-8: Dado que no hay datos suficientes, cuando el usuario abre la recomendación, entonces ve "sin resultado exacto disponible".
- CA-9: Dado que los resultados empatados no aplican al partido o mercado, cuando se calcula la recomendación, entonces no se consideran marcadores empatados.
- CA-10: Dado que la vista debe ser simple, cuando hay muchos resultados exactos disponibles, entonces la app muestra solo los más probables.

## Resultado Esperado
El usuario ve el marcador exacto más probable para el partido, junto con alternativas principales, probabilidades estimadas, nivel de confianza y advertencias cuando el mercado disponible no coincide plenamente con el reglamento del prode.

## Definición BDD/Gherkin
```gherkin
Feature: Predecir resultado exacto

  Scenario: Mostrar resultado exacto principal
    Given que un partido tiene probabilidades de resultado exacto disponibles
    When el usuario abre la recomendación de resultado exacto
    Then ve un resultado exacto principal

  Scenario: Mostrar lista ordenada
    Given que existen múltiples resultados exactos disponibles
    When la aplicación muestra la recomendación
    Then el usuario ve una lista ordenada de los resultados más probables

  Scenario: Mostrar probabilidad por resultado
    Given que se muestra una lista de resultados exactos
    When el usuario consulta la lista
    Then cada resultado tiene una probabilidad estimada

  Scenario: Destacar marcador más probable
    Given que un resultado exacto tiene la mayor probabilidad
    When la aplicación muestra la recomendación
    Then ese resultado aparece destacado visualmente

  Scenario: Indicar baja confianza
    Given que varios resultados exactos tienen probabilidades muy cercanas
    When la aplicación muestra la recomendación
    Then indica que la predicción tiene baja confianza

  Scenario: Excluir tanda de penales
    Given que el prode excluye goles de tanda de penales
    When la aplicación calcula el resultado exacto
    Then no considera goles de tanda de penales

  Scenario: Advertir mercado de 90 minutos
    Given que el mercado disponible aplica solo a 90 minutos
    And el prode considera prórroga
    When la aplicación muestra la recomendación
    Then advierte que puede no coincidir con el reglamento del prode

  Scenario: Mostrar sin resultado exacto disponible
    Given que no hay datos suficientes para resultado exacto
    When el usuario abre la recomendación
    Then ve "sin resultado exacto disponible"

  Scenario: Excluir empates cuando no aplican
    Given que los resultados empatados no aplican al partido o mercado
    When la aplicación calcula la recomendación
    Then no considera marcadores empatados

  Scenario: Limitar lista visible
    Given que existen muchos resultados exactos disponibles
    When la aplicación muestra la lista
    Then muestra solo los resultados más probables
```
