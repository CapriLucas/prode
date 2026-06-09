# Revisar Recomendación Final

## User Story
Como usuario, quiero revisar partido por partido la recomendación final, para completar mi prode de forma simple.

## Objetivo
Permitir que el usuario recorra todos los partidos del Mundial 2026, vea la recomendación final de marcador para cada uno, identifique advertencias importantes y marque manualmente cuáles pronósticos ya completó en su prode externo.

## Alcance
**Incluye:**
- Mostrar una lista de partidos con su recomendación final de marcador.
- Mostrar el signo recomendado para cada partido: local, empate o visitante.
- Abrir el detalle de cada partido para ver probabilidades, puntaje esperado y explicación.
- Marcar manualmente un partido como "completado".
- Copiar fácilmente el marcador recomendado.
- Mostrar advertencias visibles para recomendaciones con datos incompletos, baja confianza o mercado de 90 minutos.
- Filtrar partidos por estado: pendiente, completado, sin recomendación o con advertencia.
- Ordenar partidos por fecha, fase o confianza de recomendación.
- Mostrar un resumen de avance con cantidad de partidos completados sobre el total.
- Conservar el estado de completado aunque el usuario cierre y vuelva a abrir la aplicación.
- Indicar cuando una recomendación cambió por actualización de probabilidades.

**No incluye:**
- Enviar automáticamente pronósticos a otra plataforma de prode.
- Crear integración directa con plataformas externas de prode.
- Gestión colaborativa entre usuarios.
- Ranking entre usuarios.
- Login o cuentas de usuario.
- Modificar el cálculo de recomendación final.

## Actores
- Usuario: persona que participa en un prode y quiere usar la app como guía para completar sus pronósticos.

## Precondiciones
- Existen partidos del Mundial 2026 cargados en la aplicación.
- La aplicación puede obtener o mostrar recomendaciones finales por partido.
- La aplicación puede conservar localmente el estado de partidos completados.

## Disparador
El usuario abre la vista principal de recomendaciones para completar su prode.

## Flujo Principal
1. La aplicación obtiene la lista de partidos del Mundial 2026.
2. La aplicación obtiene la recomendación final disponible para cada partido.
3. La aplicación muestra cada partido con fecha, fase, equipos, marcador recomendado y signo recomendado.
4. La aplicación muestra advertencias visibles cuando una recomendación tiene datos incompletos, baja confianza o mercado de 90 minutos.
5. La aplicación muestra el resumen de avance de partidos completados sobre el total.
6. El usuario revisa la lista de partidos.
7. El usuario copia el marcador recomendado de un partido.
8. El usuario carga manualmente ese pronóstico en su prode externo.
9. El usuario marca el partido como "completado" en la aplicación.
10. La aplicación actualiza el resumen de avance.
11. La aplicación conserva el estado de completado para futuras sesiones.

## Flujos Alternativos
### FA-1: Abrir detalle de un partido
1. El usuario selecciona un partido de la lista.
2. La aplicación abre el detalle del partido.
3. La aplicación muestra probabilidades, puntaje esperado y explicación de la recomendación.
4. El usuario vuelve a la lista principal.

### FA-2: Filtrar por estado
1. El usuario elige filtrar por pendiente, completado, sin recomendación o con advertencia.
2. La aplicación aplica el filtro seleccionado.
3. La aplicación muestra solo los partidos que coinciden con ese estado.
4. El resumen de avance permanece visible.

### FA-3: Ordenar partidos
1. El usuario elige ordenar por fecha, fase o confianza de recomendación.
2. La aplicación reordena la lista según el criterio elegido.
3. El usuario continúa revisando los partidos en el nuevo orden.

### FA-4: Recomendación actualizada
1. La aplicación detecta que una recomendación cambió por actualización de probabilidades.
2. La aplicación indica que el partido tiene una recomendación actualizada para revisar.
3. El usuario abre el partido o revisa la nueva recomendación desde la lista.
4. El usuario decide si actualiza su prode externo.

### FA-5: Partido sin recomendación
1. La aplicación no tiene datos suficientes para mostrar una recomendación final de un partido.
2. La aplicación muestra el partido como "sin recomendación".
3. El usuario puede filtrar esos partidos o abrir el detalle para ver el motivo.

## Reglas de Negocio
- RN-1: Cada partido debe mostrar marcador recomendado y signo recomendado cuando haya recomendación disponible.
- RN-2: La aplicación debe permitir abrir el detalle de cada partido.
- RN-3: El estado "completado" se marca manualmente por el usuario.
- RN-4: La aplicación no debe enviar pronósticos automáticamente a plataformas externas.
- RN-5: El usuario debe poder copiar fácilmente el marcador recomendado.
- RN-6: Las recomendaciones con datos incompletos, baja confianza o mercado de 90 minutos deben mostrar advertencias visibles.
- RN-7: La aplicación debe permitir filtrar por pendiente, completado, sin recomendación o con advertencia.
- RN-8: La aplicación debe permitir ordenar por fecha, fase o confianza de recomendación.
- RN-9: La aplicación debe mostrar un resumen de avance de partidos completados sobre el total.
- RN-10: La aplicación debe conservar el estado de completado entre sesiones.
- RN-11: La aplicación debe mantenerse orientada a uso individual, sin colaboración ni ranking.
- RN-12: Si una recomendación cambia por actualización de probabilidades, la aplicación debe indicarlo para que el usuario la revise.

## Criterios de Aceptación
- CA-1: Dado que existen partidos con recomendación disponible, cuando el usuario abre la vista principal, entonces ve cada partido con marcador recomendado y signo recomendado.
- CA-2: Dado que el usuario quiere entender una recomendación, cuando abre el detalle de un partido, entonces ve probabilidades, puntaje esperado y explicación.
- CA-3: Dado que el usuario completó un pronóstico en su prode externo, cuando marca el partido como completado, entonces la app actualiza su estado.
- CA-4: Dado que el usuario marcó partidos como completados, cuando cierra y vuelve a abrir la aplicación, entonces esos estados se conservan.
- CA-5: Dado que un partido tiene recomendación disponible, cuando el usuario usa la acción de copiar, entonces obtiene el marcador recomendado listo para pegar o ingresar manualmente.
- CA-6: Dado que una recomendación tiene datos incompletos, baja confianza o mercado de 90 minutos, cuando se muestra en la lista, entonces aparece una advertencia visible.
- CA-7: Dado que hay partidos con distintos estados, cuando el usuario filtra por estado, entonces solo ve los partidos correspondientes.
- CA-8: Dado que hay partidos con distintas fechas, fases o niveles de confianza, cuando el usuario ordena la lista, entonces la app respeta el criterio seleccionado.
- CA-9: Dado que hay partidos completados y pendientes, cuando el usuario abre la vista principal, entonces ve un resumen de avance.
- CA-10: Dado que una recomendación cambió por actualización de probabilidades, cuando el usuario ve la lista, entonces la app indica que hay una recomendación actualizada para revisar.
- CA-11: Dado que la app está orientada a uso individual, cuando el usuario completa su prode, entonces no ve funciones de colaboración, ranking ni envío automático a plataformas externas.

## Resultado Esperado
El usuario puede recorrer todos los partidos, copiar recomendaciones, revisar detalles cuando lo necesite, identificar advertencias y llevar control manual de qué pronósticos ya completó en su prode externo.

## Definición BDD/Gherkin
```gherkin
Feature: Revisar recomendación final partido por partido

  Scenario: Ver recomendaciones en la lista principal
    Given que existen partidos con recomendación disponible
    When el usuario abre la vista principal
    Then ve cada partido con marcador recomendado y signo recomendado

  Scenario: Abrir detalle de recomendación
    Given que el usuario quiere entender una recomendación
    When abre el detalle de un partido
    Then ve probabilidades, puntaje esperado y explicación

  Scenario: Marcar partido como completado
    Given que el usuario completó un pronóstico en su prode externo
    When marca el partido como completado
    Then la app actualiza su estado

  Scenario: Conservar estado completado
    Given que el usuario marcó partidos como completados
    When cierra y vuelve a abrir la aplicación
    Then esos estados se conservan

  Scenario: Copiar marcador recomendado
    Given que un partido tiene recomendación disponible
    When el usuario usa la acción de copiar
    Then obtiene el marcador recomendado listo para pegar o ingresar manualmente

  Scenario: Mostrar advertencias visibles
    Given que una recomendación tiene datos incompletos, baja confianza o mercado de 90 minutos
    When la aplicación muestra el partido en la lista
    Then aparece una advertencia visible

  Scenario: Filtrar por estado
    Given que hay partidos con distintos estados
    When el usuario filtra por estado
    Then solo ve los partidos correspondientes

  Scenario: Ordenar la lista
    Given que hay partidos con distintas fechas, fases o niveles de confianza
    When el usuario ordena la lista
    Then la app respeta el criterio seleccionado

  Scenario: Mostrar resumen de avance
    Given que hay partidos completados y pendientes
    When el usuario abre la vista principal
    Then ve un resumen de avance

  Scenario: Indicar recomendación actualizada
    Given que una recomendación cambió por actualización de probabilidades
    When el usuario ve la lista
    Then la app indica que hay una recomendación actualizada para revisar

  Scenario: Mantener uso individual
    Given que la app está orientada a uso individual
    When el usuario completa su prode
    Then no ve funciones de colaboración, ranking ni envío automático a plataformas externas
```
