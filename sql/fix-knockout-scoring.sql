-- ============================================================================
-- FIX COMPLETO: Scoring rules + función corregida + recálculo
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- =============================================
-- PASO 1: Asegurar que scoring_rules tiene TODOS los datos
-- =============================================
INSERT INTO scoring_rules (stage, exact_points, tendency_points) VALUES
  ('Grupo', 3, 1),
  ('Dieciseisavos', 4, 2),
  ('Octavos', 5, 3),
  ('Cuartos', 6, 4),
  ('Semifinal', 7, 5),
  ('Tercer Puesto', 8, 6),
  ('Final', 9, 7)
ON CONFLICT (stage) DO UPDATE
SET exact_points = EXCLUDED.exact_points,
    tendency_points = EXCLUDED.tendency_points;

-- =============================================
-- PASO 2: Actualizar función con mapeo LAST_32 corregido
-- =============================================
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  p_predicted_home INT,
  p_predicted_away INT,
  p_actual_home INT,
  p_actual_away INT,
  p_stage TEXT
)
RETURNS INT AS $$
DECLARE
  v_exact_points INT;
  v_tendency_points INT;
  v_predicted_winner INT;
  v_actual_winner INT;
  v_mapped_stage TEXT;
BEGIN
  v_mapped_stage := CASE 
    WHEN p_stage ILIKE '%regular%' OR p_stage ILIKE '%group%' OR p_stage ILIKE '%jornada%' THEN 'Grupo'
    WHEN p_stage ILIKE '%round of 32%' OR p_stage ILIKE '%dieciseisavos%' OR p_stage ILIKE '%last_32%' THEN 'Dieciseisavos'
    WHEN p_stage ILIKE '%round of 16%' OR p_stage ILIKE '%last_16%' OR p_stage ILIKE '%octavos%' THEN 'Octavos'
    WHEN p_stage ILIKE '%quarter%' OR p_stage ILIKE '%cuartos%' THEN 'Cuartos'
    WHEN p_stage ILIKE '%semi%' THEN 'Semifinal'
    WHEN p_stage ILIKE '%third%' OR p_stage ILIKE '%tercer%' OR p_stage ILIKE '%3rd%' THEN 'Tercer Puesto'
    WHEN p_stage ILIKE '%final%' AND p_stage NOT ILIKE '%semi%' AND p_stage NOT ILIKE '%quarter%' AND p_stage NOT ILIKE '%round%' THEN 'Final'
    ELSE 'Grupo'
  END;

  SELECT exact_points, tendency_points INTO v_exact_points, v_tendency_points
  FROM scoring_rules
  WHERE stage = v_mapped_stage;

  v_exact_points := COALESCE(v_exact_points, 3);
  v_tendency_points := COALESCE(v_tendency_points, 1);

  IF p_predicted_home = p_actual_home AND p_predicted_away = p_actual_away THEN
    RETURN v_exact_points;
  END IF;

  v_predicted_winner := CASE 
    WHEN p_predicted_home > p_predicted_away THEN 1
    WHEN p_predicted_home < p_predicted_away THEN -1
    ELSE 0
  END;

  v_actual_winner := CASE 
    WHEN p_actual_home > p_actual_away THEN 1
    WHEN p_actual_home < p_actual_away THEN -1
    ELSE 0
  END;

  IF v_predicted_winner = v_actual_winner THEN
    RETURN v_tendency_points;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- PASO 3: Recalcular TODOS los puntos
-- =============================================
DELETE FROM participant_points;

INSERT INTO participant_points (participant_id, match_id, points_awarded)
SELECT
  pred.participant_id,
  pred.match_id,
  calculate_prediction_points(
    pred.predicted_home,
    pred.predicted_away,
    m.home_score,
    m.away_score,
    m.stage
  )
FROM predictions pred
JOIN matches m ON m.id = pred.match_id
WHERE m.status = 'finished'
  AND m.home_score IS NOT NULL
  AND m.away_score IS NOT NULL
ON CONFLICT (participant_id, match_id) DO UPDATE
SET points_awarded = EXCLUDED.points_awarded;

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Scoring rules (debe mostrar 7 filas: Grupo→Final)
SELECT stage, exact_points, tendency_points FROM scoring_rules ORDER BY exact_points;

-- Test rápido de cada fase
SELECT 'LAST_32 tendencia' as test, calculate_prediction_points(1,3, 0,1, 'LAST_32') as pts, 2 as esperado
UNION ALL
SELECT 'LAST_16 exacto', calculate_prediction_points(0,1, 0,1, 'LAST_16'), 5
UNION ALL
SELECT 'QUARTER_FINALS tendencia', calculate_prediction_points(2,0, 1,0, 'QUARTER_FINALS'), 4
UNION ALL
SELECT 'SEMI_FINALS exacto', calculate_prediction_points(1,0, 1,0, 'SEMI_FINALS'), 7
UNION ALL
SELECT 'THIRD_PLACE tendencia', calculate_prediction_points(2,0, 1,0, 'THIRD_PLACE'), 6
UNION ALL
SELECT 'FINAL tendencia', calculate_prediction_points(2,1, 3,0, 'FINAL'), 7;

-- Puntos por participante
SELECT p.full_name, COALESCE(SUM(pp.points_awarded), 0) as total_points
FROM participants p
LEFT JOIN participant_points pp ON pp.participant_id = p.id
WHERE p.is_active = true
GROUP BY p.full_name
ORDER BY total_points DESC;
