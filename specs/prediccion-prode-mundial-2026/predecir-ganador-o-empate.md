# Predecir Ganador o Empate

## User Story
Como usuario, quiero ver la predicción más probable de ganador o empate, para maximizar mis chances de sumar 3 puntos.

## Objetivo
Recomendar al usuario el signo más probable de un partido, entre triunfo local, empate o triunfo visitante, usando probabilidades consenso derivadas de cuotas de casas de apuesta y priorizando la probabilidad de acierto por sobre el payout.

## Alcance
**Incluye:**
- Recomendar una única opción principal entre local, empate o visitante.
- Usar la probabilidad consenso calculada desde casas de apuesta.
- Mostrar las probabilidades comparadas de local, empate y visitante.
- Destacar visualmente la opción con mayor probabilidad.
- Indicar baja confianza cuando las probabilidades sean muy cercanas.
- Respetar el alcance temporal disponible del mercado: 90 minutos o incluyendo prórroga.
- Advertir cuando el mercado disponible sea solo de 90 minutos y pueda no coincidir con el reglamento del prode.
- Permitir ver la fuente o composición del consenso utilizado.
- Mostrar un estado claro cuando no haya recomendación disponible.
- Tratar empate como opción válida solo cuando el mercado y el reglamento del partido lo permitan.

**No incluye:**
- Recomendar resultado exacto.
- Optimizar por payout o ganancia de apuestas.
- Permitir realizar apuestas.
- Modificar las probabilidades consenso.
- Explicar modelos predictivos externos no basados en cuotas.

## Actores
- Usuario: persona que participa en un prode y quiere elegir el signo más probable del partido.

## Precondiciones
- El usuario seleccionó un partido del Mundial 2026.
- Existen probabilidades consenso disponibles para el mercado ganador/empate/ganador.
- La aplicación conoce si el mercado aplica a 90 minutos o si incluye prórroga.
- La aplicación conoce si el empate es una opción válida para el partido y mercado seleccionado.

## Disparador
El usuario abre la recomendación de ganador/empate para un partido seleccionado.

## Flujo Principal
1. La aplicación obtiene las probabilidades consenso del partido para local, empate y visitante.
2. La aplicación valida si las tres opciones son aplicables según el mercado y el reglamento del partido.
3. La aplicación compara las probabilidades disponibles.
4. La aplicación identifica la opción con mayor probabilidad.
5. La aplicación calcula si la diferencia entre la opción principal y las alternativas indica baja confianza.
6. La aplicación muestra local, empate y visitante con sus probabilidades.
7. La aplicación destaca visualmente la opción recomendada.
8. La aplicación muestra si la recomendación aplica a 90 minutos o incluye prórroga.
9. La aplicación permite consultar la fuente o composición del consenso utilizado.

## Flujos Alternativos
### FA-1: Probabilidades muy cercanas
1. La aplicación compara las probabilidades de local, empate y visitante.
2. La diferencia entre la opción más probable y al menos una alternativa es muy pequeña.
3. La aplicación mantiene la opción de mayor probabilidad como recomendación principal.
4. La aplicación muestra una indicación de baja confianza.

### FA-2: Mercado disponible solo para 90 minutos
1. La aplicación obtiene probabilidades de un mercado que aplica solo a 90 minutos.
2. La aplicación identifica que el prode considera prórroga.
3. La aplicación muestra la recomendación disponible.
4. La aplicación advierte que el alcance temporal del mercado puede no coincidir exactamente con el reglamento del prode.

### FA-3: Sin datos suficientes
1. La aplicación intenta obtener probabilidades consenso para el partido.
2. No hay datos suficientes para calcular una recomendación confiable.
3. La aplicación muestra el estado "sin recomendación disponible".
4. La aplicación evita destacar una opción principal.

### FA-4: Empate no aplicable
1. La aplicación evalúa un partido o mercado donde empate no es una opción válida.
2. La aplicación excluye empate de las opciones recomendables.
3. La aplicación compara solo las opciones válidas restantes.
4. La aplicación muestra que empate no aplica para ese mercado o reglamento.

## Reglas de Negocio
- RN-1: La recomendación principal debe ser la opción válida con mayor probabilidad consenso.
- RN-2: La aplicación debe mostrar las probabilidades de local, empate y visitante cuando estén disponibles.
- RN-3: La aplicación debe destacar una única opción principal salvo que no haya datos suficientes.
- RN-4: Si las probabilidades son muy cercanas, la aplicación debe indicar baja confianza.
- RN-5: La recomendación debe priorizar probabilidad de acierto, no payout de apuesta.
- RN-6: La aplicación debe informar si el mercado aplica a 90 minutos o si incluye prórroga.
- RN-7: Si el mercado disponible es solo de 90 minutos, la aplicación debe advertir que puede no coincidir con el reglamento del prode.
- RN-8: La aplicación debe permitir ver la fuente o composición del consenso usado.
- RN-9: Si no hay datos suficientes, la aplicación debe mostrar "sin recomendación disponible".
- RN-10: Empate debe considerarse opción válida solo cuando el mercado y el reglamento del partido lo permitan.
- RN-11: La recomendación de ganador/empate debe ser independiente de la recomendación de resultado exacto.

## Criterios de Aceptación
- CA-1: Dado un partido con probabilidades consenso disponibles, cuando el usuario abre la recomendación, entonces ve una única opción principal entre local, empate o visitante.
- CA-2: Dado que existen probabilidades para local, empate y visitante, cuando se muestra la recomendación, entonces el usuario ve las tres probabilidades comparadas.
- CA-3: Dado que una opción tiene la mayor probabilidad, cuando se muestra la recomendación, entonces esa opción aparece destacada visualmente.
- CA-4: Dado que dos opciones tienen probabilidades muy cercanas, cuando se muestra la recomendación, entonces la app indica baja confianza.
- CA-5: Dado que el mercado aplica solo a 90 minutos, cuando se muestra la recomendación, entonces la app advierte que puede no coincidir con el reglamento del prode.
- CA-6: Dado que no hay datos suficientes, cuando el usuario abre la recomendación, entonces ve "sin recomendación disponible".
- CA-7: Dado que el usuario quiere entender la recomendación, cuando consulta el detalle, entonces ve la fuente o composición del consenso usado.
- CA-8: Dado que empate no aplica al partido o mercado, cuando se calcula la recomendación, entonces empate no se considera como opción recomendada.
- CA-9: Dado que el objetivo del usuario es acertar el prode, cuando la app recomienda una opción, entonces prioriza la mayor probabilidad de acierto y no el payout.

## Resultado Esperado
El usuario ve claramente cuál es el signo más probable para el partido, qué tan fuerte es esa recomendación, qué probabilidades respaldan la elección y si el alcance temporal del mercado coincide con el reglamento del prode.

## Definición BDD/Gherkin
```gherkin
Feature: Predecir ganador o empate

  Scenario: Mostrar opción principal
    Given que un partido tiene probabilidades consenso disponibles
    When el usuario abre la recomendación de ganador o empate
    Then ve una única opción principal entre local, empate o visitante

  Scenario: Comparar probabilidades
    Given que existen probabilidades para local, empate y visitante
    When la aplicación muestra la recomendación
    Then el usuario ve las tres probabilidades comparadas

  Scenario: Destacar la opción más probable
    Given que una opción tiene la mayor probabilidad
    When la aplicación muestra la recomendación
    Then esa opción aparece destacada visualmente

  Scenario: Indicar baja confianza
    Given que dos opciones tienen probabilidades muy cercanas
    When la aplicación muestra la recomendación
    Then indica que la predicción tiene baja confianza

  Scenario: Advertir mercado de 90 minutos
    Given que el mercado disponible aplica solo a 90 minutos
    And el prode considera prórroga
    When la aplicación muestra la recomendación
    Then advierte que puede no coincidir con el reglamento del prode

  Scenario: Mostrar sin recomendación disponible
    Given que no hay datos suficientes para el partido
    When el usuario abre la recomendación
    Then ve "sin recomendación disponible"

  Scenario: Ver composición del consenso
    Given que la recomendación usa probabilidades consenso
    When el usuario consulta el detalle de la recomendación
    Then ve la fuente o composición del consenso usado

  Scenario: Excluir empate cuando no aplica
    Given que empate no aplica al partido o mercado
    When la aplicación calcula la recomendación
    Then empate no se considera como opción recomendada

  Scenario: Priorizar probabilidad de acierto
    Given que el usuario quiere acertar el prode
    When la aplicación recomienda una opción
    Then prioriza la mayor probabilidad de acierto
    And no prioriza el payout de apuesta
```
