-- ============================================
-- EJECUTAR ESTO PRIMERO — Insertar las reglas
-- ============================================
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

-- Verificar que se insertaron
SELECT stage, exact_points, tendency_points FROM scoring_rules ORDER BY exact_points;

-- Test rápido
SELECT 'FINAL' as stage, calculate_prediction_points(2,1, 3,0, 'FINAL') as pts, 7 as esperado
UNION ALL
SELECT 'LAST_32', calculate_prediction_points(1,3, 0,1, 'LAST_32'), 2;

-- ============================================
-- Recalcular todos los puntos
-- ============================================
DELETE FROM participant_points;

INSERT INTO participant_points (participant_id, match_id, points_awarded)
SELECT
  pred.participant_id,
  pred.match_id,
  calculate_prediction_points(pred.predicted_home, pred.predicted_away, m.home_score, m.away_score, m.stage)
FROM predictions pred
JOIN matches m ON m.id = pred.match_id
WHERE m.status = 'finished' AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
ON CONFLICT (participant_id, match_id) DO UPDATE SET points_awarded = EXCLUDED.points_awarded;

-- Ver puntos finales
SELECT p.full_name, COALESCE(SUM(pp.points_awarded), 0) as total_points
FROM participants p
LEFT JOIN participant_points pp ON pp.participant_id = p.id
WHERE p.is_active = true
GROUP BY p.full_name
ORDER BY total_points DESC;
