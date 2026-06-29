-- ============================================================================
-- DIAGNÓSTICO: Verificar stages y puntos
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- 1. Ver QUÉ STAGE tienen los partidos de eliminatorias
SELECT 
  m.id,
  t_home.name as home_team, 
  t_away.name as away_team,
  m.stage,
  m.status,
  m.home_score,
  m.away_score
FROM matches m
JOIN teams t_home ON m.home_team_id = t_home.id
JOIN teams t_away ON m.away_team_id = t_away.id
WHERE m.status = 'finished'
  AND m.stage NOT ILIKE '%group%'
  AND m.stage NOT ILIKE '%regular%'
ORDER BY m.match_date DESC
LIMIT 20;

-- 2. Ver los puntos del partido South Africa vs Canada específicamente
SELECT 
  p.full_name,
  pred.predicted_home,
  pred.predicted_away,
  m.home_score,
  m.away_score,
  m.stage,
  pp.points_awarded,
  calculate_prediction_points(pred.predicted_home, pred.predicted_away, m.home_score, m.away_score, m.stage) as should_be
FROM predictions pred
JOIN matches m ON m.id = pred.match_id
JOIN participants p ON p.id = pred.participant_id
LEFT JOIN participant_points pp ON pp.participant_id = pred.participant_id AND pp.match_id = pred.match_id
JOIN teams t_home ON m.home_team_id = t_home.id
JOIN teams t_away ON m.away_team_id = t_away.id
WHERE (t_home.name ILIKE '%south africa%' OR t_away.name ILIKE '%south africa%' OR t_away.name ILIKE '%canada%')
  AND m.status = 'finished';

-- 3. TEST: Probar la función directamente con cada stage
SELECT 
  'LAST_32 (tendencia 1-3 vs 0-1)' as test,
  calculate_prediction_points(1, 3, 0, 1, 'LAST_32') as result,
  'Esperado: 2' as expected;

SELECT 
  'GROUP_STAGE (tendencia 1-3 vs 0-1)' as test,
  calculate_prediction_points(1, 3, 0, 1, 'GROUP_STAGE') as result,
  'Esperado: 1' as expected;

SELECT 
  'LAST_16 (exacto 0-1 vs 0-1)' as test,
  calculate_prediction_points(0, 1, 0, 1, 'LAST_16') as result,
  'Esperado: 5' as expected;

SELECT 
  'QUARTER_FINALS (tendencia 2-0 vs 1-0)' as test,
  calculate_prediction_points(2, 0, 1, 0, 'QUARTER_FINALS') as result,
  'Esperado: 4' as expected;

SELECT 
  'SEMI_FINALS (exacto 1-0 vs 1-0)' as test,
  calculate_prediction_points(1, 0, 1, 0, 'SEMI_FINALS') as result,
  'Esperado: 7' as expected;

SELECT 
  'FINAL (tendencia 2-1 vs 3-0)' as test,
  calculate_prediction_points(2, 1, 3, 0, 'FINAL') as result,
  'Esperado: 7' as expected;

-- 4. Verificar scoring_rules
SELECT * FROM scoring_rules ORDER BY exact_points;
