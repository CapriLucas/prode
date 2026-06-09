# Obtener Probabilidades de Casas de Apuesta

## User Story
Como usuario, quiero obtener probabilidades de resultado desde casas de apuesta online, para usar el consenso del mercado como referencia.

## Objetivo
Obtener cuotas de varias casas de apuesta reconocidas, transformarlas en probabilidades comparables y calcular un consenso de mercado para cada partido y mercado relevante del prode.

## Alcance
**Incluye:**
- Consultar cuotas de varias casas de apuesta reconocidas internacionalmente.
- Obtener datos para mercados de ganador/empate/ganador.
- Obtener datos para mercados de resultado exacto.
- Convertir cuotas en probabilidades implícitas.
- Calcular una probabilidad consenso con las probabilidades disponibles.
- Continuar funcionando cuando falten datos de alguna casa o mercado.
- Mostrar la última actualización de cuotas o probabilidades.
- Advertir cuando las probabilidades sean incompletas o antiguas.
- Priorizar fuentes autorizadas, APIs públicas o proveedores de datos.
- Indicar claramente si cada mercado aplica a 90 minutos o incluye prórroga.
- Excluir goles de tanda de penales de cualquier interpretación de resultado.

**No incluye:**
- Permitir apuestas con dinero real.
- Redirigir al usuario a casas de apuesta.
- Recomendar apostar dinero.
- Garantizar disponibilidad de todas las casas para todos los partidos.
- Resolver todavía qué predicción final conviene elegir.
- Crear modelos predictivos propios con datos deportivos adicionales.

## Actores
- Usuario: persona que participa en un prode y quiere usar probabilidades de mercado para orientar sus pronósticos.
- Fuente de cuotas: casa de apuesta, API pública o proveedor de datos que ofrece cuotas para partidos y mercados.

## Precondiciones
- El usuario seleccionó o está consultando un partido del Mundial 2026.
- Existe al menos una fuente disponible con cuotas para el partido o mercado solicitado.
- La app conoce qué mercados necesita consultar: ganador/empate/ganador y resultado exacto.

## Disparador
El usuario abre la vista de probabilidades de un partido o solicita actualizar sus probabilidades.

## Flujo Principal
1. La aplicación identifica el partido seleccionado.
2. La aplicación consulta las fuentes disponibles para el mercado ganador/empate/ganador.
3. La aplicación consulta las fuentes disponibles para el mercado de resultado exacto.
4. La aplicación recibe las cuotas disponibles por casa, partido y mercado.
5. La aplicación identifica para cada mercado si aplica a 90 minutos o si incluye prórroga.
6. La aplicación convierte cada cuota en probabilidad implícita.
7. La aplicación calcula una probabilidad consenso para cada resultado disponible usando las casas con datos válidos.
8. La aplicación excluye cualquier dato que represente tanda de penales.
9. La aplicación muestra las probabilidades consenso al usuario.
10. La aplicación muestra la última actualización de los datos.
11. La aplicación informa si algún mercado tiene datos incompletos o antiguos.

## Flujos Alternativos
### FA-1: Una casa no tiene datos para el partido
1. La aplicación consulta una casa de apuesta.
2. La casa no tiene datos para el partido seleccionado.
3. La aplicación omite esa casa para el cálculo de consenso.
4. La aplicación calcula el consenso con las demás casas disponibles.
5. La aplicación informa que los datos son incompletos.

### FA-2: Falta un mercado para el partido
1. La aplicación consulta las fuentes disponibles para un mercado.
2. Ninguna fuente devuelve datos para ese mercado.
3. La aplicación indica que no hay probabilidades disponibles para ese mercado.
4. La aplicación mantiene disponibles los demás mercados que sí tengan datos.

### FA-3: Datos antiguos
1. La aplicación obtiene cuotas cuya última actualización supera el umbral aceptado.
2. La aplicación muestra las probabilidades disponibles.
3. La aplicación advierte que los datos pueden estar desactualizados.
4. El usuario puede solicitar una actualización.

### FA-4: Mercado disponible solo para 90 minutos
1. La aplicación consulta un mercado para el partido seleccionado.
2. La fuente indica que el mercado aplica solo al resultado en 90 minutos.
3. La aplicación muestra esa condición junto con las probabilidades.
4. La aplicación evita presentar ese dato como equivalente a un resultado que incluye prórroga.

## Reglas de Negocio
- RN-1: La aplicación debe usar más de una fuente cuando haya varias disponibles.
- RN-2: Las cuotas deben convertirse a probabilidades implícitas antes de compararse o combinarse.
- RN-3: La probabilidad consenso debe calcularse solo con datos válidos y disponibles.
- RN-4: Si una casa no tiene datos, la aplicación debe seguir funcionando con las fuentes restantes.
- RN-5: La aplicación debe mostrar la última actualización de cuotas o probabilidades.
- RN-6: La aplicación debe advertir cuando los datos sean incompletos o antiguos.
- RN-7: La aplicación no debe permitir realizar apuestas ni redirigir a apostar.
- RN-8: La aplicación debe priorizar fuentes autorizadas, APIs públicas o proveedores de datos antes que scraping directo.
- RN-9: La aplicación debe indicar si cada mercado aplica a 90 minutos o si incluye prórroga.
- RN-10: La aplicación debe excluir goles de tanda de penales de cualquier interpretación de resultado.
- RN-11: Las cuotas deben tratarse como insumo probabilístico para el prode, no como recomendación financiera.

## Criterios de Aceptación
- CA-1: Dado un partido seleccionado, cuando existen cuotas disponibles, entonces la aplicación obtiene datos de varias casas reconocidas.
- CA-2: Dado que hay cuotas de ganador/empate/ganador, cuando la aplicación las procesa, entonces muestra probabilidades implícitas para cada resultado.
- CA-3: Dado que hay cuotas de resultado exacto, cuando la aplicación las procesa, entonces muestra probabilidades implícitas para los marcadores disponibles.
- CA-4: Dado que hay probabilidades de varias casas, cuando la aplicación calcula el consenso, entonces combina solo datos válidos y disponibles.
- CA-5: Dado que una casa no tiene datos, cuando se calculan probabilidades, entonces la aplicación continúa con las casas restantes e informa datos incompletos.
- CA-6: Dado que las probabilidades tienen una fecha de actualización, cuando se muestran al usuario, entonces la aplicación muestra esa fecha.
- CA-7: Dado que los datos están desactualizados, cuando se muestran probabilidades, entonces la aplicación advierte que pueden no estar vigentes.
- CA-8: Dado que un mercado aplica solo a 90 minutos, cuando se muestra, entonces la aplicación lo indica claramente.
- CA-9: Dado que el prode excluye tanda de penales, cuando se interpretan resultados, entonces la aplicación no considera goles de penales.
- CA-10: Dado que el usuario consulta probabilidades, cuando usa la aplicación, entonces no puede apostar ni es redirigido a apostar.

## Resultado Esperado
El usuario puede ver probabilidades consenso para ganador/empate/ganador y resultado exacto de un partido, basadas en cuotas de casas de apuesta disponibles, con claridad sobre actualización, cobertura de datos y alcance temporal del mercado.

## Definición BDD/Gherkin
```gherkin
Feature: Obtener probabilidades de casas de apuesta

  Scenario: Obtener cuotas de varias casas
    Given que el usuario seleccionó un partido
    And existen cuotas disponibles en varias casas reconocidas
    When la aplicación consulta las fuentes
    Then obtiene datos de más de una casa de apuesta

  Scenario: Convertir cuotas de ganador empate ganador
    Given que hay cuotas para ganador empate ganador
    When la aplicación procesa las cuotas
    Then muestra probabilidades implícitas para local, empate y visitante

  Scenario: Convertir cuotas de resultado exacto
    Given que hay cuotas para resultado exacto
    When la aplicación procesa las cuotas
    Then muestra probabilidades implícitas para los marcadores disponibles

  Scenario: Calcular consenso con datos válidos
    Given que hay probabilidades de varias casas
    When la aplicación calcula el consenso
    Then combina solo datos válidos y disponibles

  Scenario: Continuar con datos incompletos
    Given que una casa no tiene datos para el partido
    When la aplicación calcula probabilidades
    Then continúa usando las casas restantes
    And informa que los datos son incompletos

  Scenario: Mostrar última actualización
    Given que las probabilidades tienen una fecha de actualización
    When la aplicación las muestra al usuario
    Then muestra la última actualización disponible

  Scenario: Advertir datos antiguos
    Given que los datos disponibles están desactualizados
    When la aplicación muestra las probabilidades
    Then advierte que pueden no estar vigentes

  Scenario: Indicar mercado de 90 minutos
    Given que un mercado aplica solo al resultado en 90 minutos
    When la aplicación muestra ese mercado
    Then indica claramente que no incluye prórroga

  Scenario: Excluir tanda de penales
    Given que el prode excluye goles de tanda de penales
    When la aplicación interpreta resultados
    Then no considera goles de tanda de penales

  Scenario: No permitir apuestas
    Given que el usuario consulta probabilidades
    When usa la aplicación
    Then no puede realizar apuestas
    And no es redirigido a apostar
```
