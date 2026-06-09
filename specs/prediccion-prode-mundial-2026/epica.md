# Épica: Predicción de Prode para el Mundial 2026

## Descripción
Como participante de un prode del Mundial 2026, quiero recibir recomendaciones basadas en probabilidades de casas de apuesta, para completar mis pronósticos priorizando lo más probable según el sistema de puntaje.

## Objetivo
Permitir que el usuario consulte partidos del Mundial 2026 y obtenga recomendaciones simples de ganador/empate y resultado exacto, optimizadas para un prode de costo fijo que otorga 0 puntos por error, 3 puntos por acertar ganador/empate y 6 puntos por acertar resultado exacto, incluyendo prórroga y excluyendo tanda de penales.

## Alcance general
**Incluye:**
- Consultar partidos del Mundial 2026.
- Obtener probabilidades o cuotas de principales casas de apuesta online.
- Recomendar ganador local, empate o ganador visitante.
- Recomendar resultado exacto.
- Combinar recomendaciones según el sistema de puntaje del prode.
- Revisar partido por partido la recomendación final.

**No incluye:**
- Apuestas con dinero real.
- Gestión de usuarios, login o ligas privadas.
- Pagos o monetización.
- Predicción de tanda de penales.
- Garantía de extracción automática desde sitios que no permitan ese uso.
- Modelos propios complejos con lesiones, clima, rankings o estadísticas históricas.

## Historias de Usuario
| # | Historia | Spec | Estado |
|---|----------|------|--------|
| 1 | Como usuario, quiero consultar los partidos del Mundial 2026, para saber qué predicciones debo completar. | [consultar-partidos-mundial-2026](./consultar-partidos-mundial-2026.md) | Especificada |
| 2 | Como usuario, quiero obtener probabilidades de resultado desde casas de apuesta online, para usar el consenso del mercado como referencia. | [obtener-probabilidades-casas-apuesta](./obtener-probabilidades-casas-apuesta.md) | Especificada |
| 3 | Como usuario, quiero ver la predicción más probable de ganador o empate, para maximizar mis chances de sumar 3 puntos. | [predecir-ganador-o-empate](./predecir-ganador-o-empate.md) | Especificada |
| 4 | Como usuario, quiero ver el resultado exacto más probable, para maximizar mis chances de sumar 6 puntos. | [predecir-resultado-exacto](./predecir-resultado-exacto.md) | Especificada |
| 5 | Como usuario, quiero que la recomendación combine ganador/empate y resultado exacto según el sistema de puntaje del prode, para elegir la predicción con mejor valor esperado. | [optimizar-recomendacion-por-puntaje](./optimizar-recomendacion-por-puntaje.md) | Especificada |
| 6 | Como usuario, quiero revisar partido por partido la recomendación final, para completar mi prode de forma simple. | [revisar-recomendacion-final](./revisar-recomendacion-final.md) | Especificada |

## Dependencias entre historias
- La historia 2 depende de la historia 1.
- La historia 3 depende de la historia 2.
- La historia 4 depende de la historia 2.
- La historia 5 depende de las historias 3 y 4.
- La historia 6 depende de la historia 5.
