# Optimizar Recomendación por Puntaje

## User Story
Como usuario, quiero que la recomendación combine ganador/empate y resultado exacto según el sistema de puntaje del prode, para elegir la predicción con mejor valor esperado.

## Objetivo
Recomendar el marcador final que maximice el puntaje esperado del usuario en el prode, combinando la probabilidad de acertar el signo del partido con la probabilidad de acertar el resultado exacto.

## Alcance
**Incluye:**
- Calcular puntos esperados para cada resultado exacto candidato.
- Aplicar el sistema de puntaje del prode: 0 puntos si falla, 3 puntos si acierta ganador/empate y 6 puntos si acierta resultado exacto.
- Tratar los 6 puntos por resultado exacto como puntaje total, no como 6 puntos adicionales a los 3 del signo.
- Recomendar un marcador exacto final para completar el prode.
- Evaluar cada marcador candidato según su probabilidad exacta y la probabilidad de acertar el signo asociado.
- Permitir que la recomendación final sea distinta del marcador exacto más probable individualmente si mejora el puntaje esperado.
- Mostrar el puntaje esperado estimado de la recomendación.
- Mostrar una explicación breve de por qué se eligió ese marcador.
- Comparar la recomendación final contra el marcador exacto más probable individualmente.
- Usar probabilidades disponibles de mercado sin agregar modelos propios adicionales.
- Usar una recomendación simple basada en el resultado exacto más probable cuando falten datos suficientes.
- Excluir tanda de penales y respetar la regla de prórroga definida por el prode.
- Adaptar el cálculo cuando empate no sea una opción válida.

**No incluye:**
- Crear modelos predictivos propios con datos deportivos adicionales.
- Optimizar por payout de apuestas.
- Permitir apuestas con dinero real.
- Modificar el sistema de puntaje del prode.
- Registrar todavía el pronóstico final del usuario.
- Gestionar estrategias contra otros participantes del prode.

## Actores
- Usuario: persona que participa en un prode y quiere elegir el marcador que maximiza su puntaje esperado.

## Precondiciones
- El usuario seleccionó un partido del Mundial 2026.
- Existen probabilidades consenso para ganador/empate/ganador.
- Existen probabilidades consenso para resultado exacto, o al menos una recomendación simple de resultado exacto.
- La aplicación conoce el sistema de puntaje del prode.
- La aplicación conoce si el partido y mercado incluyen prórroga y excluyen tanda de penales.

## Disparador
El usuario abre la recomendación final optimizada para un partido seleccionado.

## Flujo Principal
1. La aplicación obtiene los resultados exactos candidatos para el partido.
2. La aplicación obtiene la probabilidad exacta estimada de cada marcador candidato.
3. La aplicación identifica el signo asociado a cada marcador: local, empate o visitante.
4. La aplicación obtiene la probabilidad consenso del signo asociado.
5. La aplicación descarta opciones que dependan de tanda de penales.
6. La aplicación valida si empate es una opción válida para el partido y mercado.
7. La aplicación calcula el puntaje esperado de cada marcador candidato según el sistema del prode.
8. La aplicación ordena los marcadores candidatos por puntaje esperado descendente.
9. La aplicación selecciona como recomendación final el marcador con mayor puntaje esperado.
10. La aplicación muestra el marcador recomendado, su puntaje esperado estimado y una explicación breve.
11. La aplicación compara la recomendación final contra el marcador exacto más probable individualmente.

## Flujos Alternativos
### FA-1: Recomendación distinta del marcador exacto más probable
1. La aplicación calcula el puntaje esperado de los marcadores candidatos.
2. El marcador exacto más probable no es el de mayor puntaje esperado.
3. La aplicación recomienda el marcador con mayor puntaje esperado.
4. La aplicación explica que la elección prioriza el puntaje esperado total del prode.
5. La aplicación muestra la comparación con el marcador exacto más probable individualmente.

### FA-2: Datos insuficientes para calcular puntaje esperado
1. La aplicación intenta obtener probabilidades suficientes para calcular puntaje esperado.
2. Faltan probabilidades de signo, probabilidades exactas o ambas.
3. La aplicación usa una recomendación simple basada en el resultado exacto más probable disponible.
4. La aplicación muestra una advertencia indicando que no pudo optimizar por puntaje esperado completo.

### FA-3: Empate no aplicable
1. La aplicación evalúa un partido o mercado donde empate no es una opción válida.
2. La aplicación excluye marcadores empatados de los candidatos.
3. La aplicación calcula el puntaje esperado con los signos válidos restantes.
4. La aplicación indica que empate no aplica para ese partido o mercado.

### FA-4: Mercado con alcance temporal no alineado
1. La aplicación detecta que las probabilidades disponibles aplican solo a 90 minutos.
2. La aplicación identifica que el prode considera prórroga.
3. La aplicación muestra la recomendación disponible.
4. La aplicación advierte que el cálculo puede no coincidir exactamente con el reglamento del prode.

## Reglas de Negocio
- RN-1: El puntaje esperado debe calcularse para cada marcador candidato disponible.
- RN-2: Acertar el resultado exacto otorga 6 puntos totales.
- RN-3: Acertar solo el ganador/empate otorga 3 puntos.
- RN-4: Fallar el ganador/empate y el resultado exacto otorga 0 puntos.
- RN-5: La recomendación final debe ser el marcador válido con mayor puntaje esperado.
- RN-6: La recomendación final puede diferir del resultado exacto más probable individualmente.
- RN-7: La aplicación debe mostrar el puntaje esperado estimado de la recomendación.
- RN-8: La aplicación debe explicar brevemente por qué eligió el marcador recomendado.
- RN-9: La aplicación debe comparar la recomendación final contra el marcador exacto más probable individualmente.
- RN-10: La aplicación debe usar probabilidades de mercado disponibles sin agregar modelos propios adicionales.
- RN-11: Si faltan datos suficientes, la aplicación debe usar una recomendación simple y mostrar advertencia.
- RN-12: La aplicación debe excluir goles de tanda de penales.
- RN-13: La aplicación debe respetar la regla de prórroga definida por el prode.
- RN-14: Si empate no aplica, la aplicación debe adaptar el cálculo a los signos válidos.

## Criterios de Aceptación
- CA-1: Dado un partido con probabilidades suficientes, cuando el usuario abre la recomendación final, entonces la app calcula puntos esperados para cada marcador candidato.
- CA-2: Dado el sistema de puntaje del prode, cuando la app calcula puntos esperados, entonces trata el resultado exacto como 6 puntos totales.
- CA-3: Dado que un marcador tiene el mayor puntaje esperado, cuando se muestra la recomendación final, entonces ese marcador aparece como recomendación principal.
- CA-4: Dado que el marcador con mayor puntaje esperado no es el resultado exacto más probable individualmente, cuando se muestra la recomendación, entonces la app prioriza el mayor puntaje esperado.
- CA-5: Dado que se muestra una recomendación final, cuando el usuario la consulta, entonces ve el puntaje esperado estimado.
- CA-6: Dado que el usuario quiere entender la recomendación, cuando consulta el detalle, entonces ve una explicación breve de la elección.
- CA-7: Dado que existe un resultado exacto más probable individualmente, cuando se muestra la recomendación final, entonces la app muestra una comparación contra ese marcador.
- CA-8: Dado que faltan datos suficientes, cuando el usuario abre la recomendación final, entonces la app usa una recomendación simple y muestra advertencia.
- CA-9: Dado que el prode excluye tanda de penales, cuando se calcula la recomendación, entonces no se consideran goles de tanda de penales.
- CA-10: Dado que empate no aplica al partido o mercado, cuando la app calcula la recomendación, entonces adapta el cálculo a los signos válidos.

## Resultado Esperado
El usuario recibe un marcador recomendado para completar su prode, elegido por puntaje esperado según las reglas de 0, 3 y 6 puntos, con una explicación clara y advertencias cuando los datos disponibles no permitan una optimización completa.

## Definición BDD/Gherkin
```gherkin
Feature: Optimizar recomendación por puntaje del prode

  Scenario: Calcular puntos esperados por marcador
    Given que un partido tiene probabilidades suficientes
    When el usuario abre la recomendación final
    Then la app calcula puntos esperados para cada marcador candidato

  Scenario: Aplicar resultado exacto como 6 puntos totales
    Given el sistema de puntaje del prode
    When la app calcula puntos esperados
    Then trata el resultado exacto como 6 puntos totales

  Scenario: Recomendar marcador con mayor puntaje esperado
    Given que un marcador tiene el mayor puntaje esperado
    When la aplicación muestra la recomendación final
    Then ese marcador aparece como recomendación principal

  Scenario: Priorizar puntaje esperado sobre probabilidad exacta individual
    Given que el marcador con mayor puntaje esperado no es el resultado exacto más probable individualmente
    When la aplicación muestra la recomendación
    Then prioriza el mayor puntaje esperado

  Scenario: Mostrar puntaje esperado
    Given que se muestra una recomendación final
    When el usuario consulta la recomendación
    Then ve el puntaje esperado estimado

  Scenario: Explicar elección
    Given que el usuario quiere entender la recomendación
    When consulta el detalle
    Then ve una explicación breve de por qué se eligió ese marcador

  Scenario: Comparar contra resultado exacto más probable
    Given que existe un resultado exacto más probable individualmente
    When la aplicación muestra la recomendación final
    Then muestra una comparación contra ese marcador

  Scenario: Usar recomendación simple por datos insuficientes
    Given que faltan datos suficientes para optimizar por puntaje esperado
    When el usuario abre la recomendación final
    Then la app usa una recomendación simple
    And muestra una advertencia

  Scenario: Excluir tanda de penales
    Given que el prode excluye goles de tanda de penales
    When la aplicación calcula la recomendación
    Then no considera goles de tanda de penales

  Scenario: Adaptar cálculo cuando empate no aplica
    Given que empate no aplica al partido o mercado
    When la aplicación calcula la recomendación
    Then adapta el cálculo a los signos válidos
```
