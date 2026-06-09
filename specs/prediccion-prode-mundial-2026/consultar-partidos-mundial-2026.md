# Consultar Partidos del Mundial 2026

## User Story
Como usuario, quiero consultar los partidos del Mundial 2026, para saber qué predicciones debo completar.

## Objetivo
Permitir que el usuario vea de forma simple y confiable el calendario de partidos del Mundial 2026 que deberá pronosticar en su prode, incluyendo información suficiente para identificar cada encuentro y seleccionarlo para etapas posteriores de predicción.

## Alcance
**Incluye:**
- Mostrar una lista de partidos del Mundial 2026.
- Mostrar fecha, hora, selección local, selección visitante y fase del torneo.
- Mostrar partidos de fase de grupos, eliminación directa, tercer puesto y final.
- Mostrar placeholders funcionales para cruces todavía no definidos.
- Filtrar partidos por fase, fecha y selección.
- Distinguir partidos próximos, en curso y finalizados.
- Seleccionar un partido para consultar luego sus probabilidades y recomendaciones.
- Informar claramente cuando la fuente de partidos no esté disponible y permitir reintentar.

**No incluye:**
- Carga manual de partidos por parte del usuario.
- Obtención de cuotas o probabilidades de casas de apuesta.
- Predicción de ganador, empate o resultado exacto.
- Registro del pronóstico elegido por el usuario.
- Gestión de usuarios, login o ligas privadas.

## Actores
- Usuario: persona que participa en un prode del Mundial 2026 y necesita consultar los partidos para completar sus pronósticos.

## Precondiciones
- Existe una fuente externa o dataset precargado con los partidos del Mundial 2026.
- El usuario accede a la aplicación.
- La aplicación puede determinar o usar el horario local del usuario para mostrar fechas y horas.

## Disparador
El usuario abre la aplicación o ingresa a la vista de partidos del Mundial 2026.

## Flujo Principal
1. La aplicación obtiene la lista de partidos del Mundial 2026 desde la fuente disponible.
2. La aplicación convierte las fechas y horas al horario local del usuario.
3. La aplicación muestra la lista de partidos con fecha, hora, fase, selección local, selección visitante y estado.
4. El usuario revisa la lista de partidos.
5. El usuario aplica opcionalmente filtros por fase, fecha o selección.
6. La aplicación actualiza la lista mostrando solo los partidos que cumplen los filtros elegidos.
7. El usuario selecciona un partido.
8. La aplicación deja el partido seleccionado disponible para consultar probabilidades y recomendaciones en las siguientes funcionalidades.

## Flujos Alternativos
### FA-1: Fuente de partidos no disponible
1. La aplicación intenta obtener la lista de partidos.
2. La fuente externa o dataset no está disponible.
3. La aplicación muestra un mensaje claro indicando que no pudo cargar los partidos.
4. La aplicación ofrece una acción para reintentar.
5. El usuario solicita reintentar.
6. La aplicación vuelve a intentar obtener la lista de partidos.

### FA-2: Partido con equipos todavía no definidos
1. La aplicación obtiene un partido de eliminación directa cuyos equipos aún no están definidos.
2. La aplicación muestra placeholders funcionales, como "Ganador Grupo A" o "Segundo Grupo B".
3. El usuario puede identificar el cruce y seleccionarlo igual que cualquier otro partido.

### FA-3: Filtros sin resultados
1. El usuario aplica filtros por fase, fecha o selección.
2. Ningún partido cumple los filtros seleccionados.
3. La aplicación muestra un estado vacío indicando que no hay partidos para esos filtros.
4. El usuario modifica o limpia los filtros.
5. La aplicación vuelve a mostrar los partidos correspondientes.

## Reglas de Negocio
- RN-1: Cada partido debe mostrar fecha, hora, fase, selección local, selección visitante y estado.
- RN-2: Las fechas y horas deben mostrarse en el horario local del usuario.
- RN-3: Los estados posibles del partido son próximo, en curso y finalizado.
- RN-4: Los partidos sin equipos confirmados deben mostrarse con placeholders funcionales.
- RN-5: La consulta de partidos debe cubrir fase de grupos, eliminación directa, tercer puesto y final.
- RN-6: La selección de un partido no implica todavía registrar un pronóstico.
- RN-7: Si la fuente de partidos no está disponible, la aplicación debe informar el problema y permitir reintentar.

## Criterios de Aceptación
- CA-1: Dado que existen partidos disponibles, cuando el usuario abre la vista de partidos, entonces ve una lista con fecha, hora, fase, equipos y estado de cada partido.
- CA-2: Dado que el usuario tiene un horario local determinado, cuando se muestran los partidos, entonces las fechas y horas aparecen en ese horario.
- CA-3: Dado que hay partidos de distintas fases, cuando el usuario filtra por fase, entonces solo ve los partidos de la fase seleccionada.
- CA-4: Dado que hay partidos de distintas fechas, cuando el usuario filtra por fecha, entonces solo ve los partidos de la fecha seleccionada.
- CA-5: Dado que hay partidos de distintas selecciones, cuando el usuario filtra por selección, entonces solo ve los partidos donde participa esa selección.
- CA-6: Dado que hay cruces no definidos, cuando la aplicación muestra esos partidos, entonces usa placeholders funcionales para identificar a los participantes.
- CA-7: Dado que la fuente de partidos no está disponible, cuando el usuario abre la vista, entonces ve un mensaje claro y una opción para reintentar.
- CA-8: Dado que el usuario ve la lista de partidos, cuando selecciona uno, entonces la aplicación conserva ese partido como selección activa para las siguientes funcionalidades.

## Resultado Esperado
El usuario puede consultar y filtrar los partidos del Mundial 2026, identificar cada encuentro aunque algunos equipos no estén definidos todavía, y seleccionar el partido sobre el que luego consultará probabilidades y recomendaciones.

## Definición BDD/Gherkin
```gherkin
Feature: Consultar partidos del Mundial 2026

  Scenario: Ver lista de partidos disponibles
    Given que existen partidos del Mundial 2026 disponibles
    When el usuario abre la vista de partidos
    Then ve una lista con fecha, hora, fase, equipos y estado de cada partido

  Scenario: Mostrar horarios en hora local
    Given que el usuario tiene un horario local determinado
    When la aplicación muestra los partidos
    Then las fechas y horas aparecen en el horario local del usuario

  Scenario: Filtrar partidos por fase
    Given que existen partidos de distintas fases
    When el usuario filtra por una fase específica
    Then solo ve los partidos de esa fase

  Scenario: Filtrar partidos por fecha
    Given que existen partidos en distintas fechas
    When el usuario filtra por una fecha específica
    Then solo ve los partidos de esa fecha

  Scenario: Filtrar partidos por selección
    Given que existen partidos de distintas selecciones
    When el usuario filtra por una selección específica
    Then solo ve los partidos donde participa esa selección

  Scenario: Mostrar cruces todavía no definidos
    Given que existe un partido con equipos todavía no definidos
    When la aplicación muestra el partido
    Then muestra placeholders funcionales para identificar a los participantes

  Scenario: Informar fuente no disponible
    Given que la fuente de partidos no está disponible
    When el usuario abre la vista de partidos
    Then ve un mensaje claro indicando que no se pudieron cargar los partidos
    And ve una opción para reintentar

  Scenario: Seleccionar un partido
    Given que el usuario ve la lista de partidos
    When selecciona un partido
    Then la aplicación conserva ese partido como selección activa para consultar probabilidades y recomendaciones
```
