-- ============================================================================
-- FIX: Agregar UNIQUE constraint a participant_points
-- ============================================================================
-- PROBLEMA: La función award_match_points() usa ON CONFLICT (participant_id, match_id)
-- pero NO existía un índice único en esas columnas. Esto causaba que:
-- 1. Se crearan registros duplicados en vez de actualizar
-- 2. Los puntos no se calculaban correctamente
-- ============================================================================

-- Paso 1: Eliminar registros duplicados (conservar solo el de mayor puntos)
DELETE FROM participant_points pp1
USING participant_points pp2
WHERE pp1.participant_id = pp2.participant_id
  AND pp1.match_id = pp2.match_id
  AND pp1.id < pp2.id;

-- Paso 2: Crear el UNIQUE constraint que falta
CREATE UNIQUE INDEX IF NOT EXISTS idx_participant_points_unique
ON participant_points(participant_id, match_id);

-- Paso 3: Recalcular TODOS los puntos correctamente
SELECT recalculate_all_rankings();

-- Paso 4: Verificar que los puntos estén correctos
SELECT 
  p.full_name,
  COALESCE(SUM(pp.points_awarded), 0) as total_points,
  COUNT(CASE WHEN pp.points_awarded >= 3 THEN 1 END) as exactos,
  COUNT(CASE WHEN pp.points_awarded > 0 AND pp.points_awarded < 3 THEN 1 END) as tendencias,
  COUNT(CASE WHEN pp.points_awarded = 0 THEN 1 END) as fallados
FROM participants p
LEFT JOIN participant_points pp ON p.id = pp.participant_id
WHERE p.is_active = true
GROUP BY p.full_name
ORDER BY total_points DESC;
