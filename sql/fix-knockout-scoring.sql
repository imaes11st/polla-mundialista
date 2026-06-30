-- ============================================================================
-- FIX: Knockout stage scoring — LAST_32 mapping
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Fix the scoring function: add LAST_32 mapping + 3rd place mapping
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
  -- Map external stage names to internal scoring stages
  -- FIXED: Added 'last_32' for football-data.org Round of 32
  v_mapped_stage := CASE 
    WHEN p_stage ILIKE '%regular%' OR p_stage ILIKE '%group%' OR p_stage ILIKE '%jornada%' THEN 'Grupo'
    WHEN p_stage ILIKE '%round of 32%' OR p_stage ILIKE '%dieciseisavos%' OR p_stage ILIKE '%last_32%' THEN 'Dieciseisavos'
    WHEN p_stage ILIKE '%round of 16%' OR p_stage ILIKE '%last_16%' OR p_stage ILIKE '%octavos%' THEN 'Octavos'
    WHEN p_stage ILIKE '%quarter%' OR p_stage ILIKE '%cuartos%' THEN 'Cuartos'
    WHEN p_stage ILIKE '%semi%' THEN 'Semifinal'
    WHEN p_stage ILIKE '%third%' OR p_stage ILIKE '%tercer%' OR p_stage ILIKE '%3rd%' THEN 'Tercer Puesto'
    WHEN p_stage ILIKE '%final%' AND p_stage NOT ILIKE '%semi%' AND p_stage NOT ILIKE '%quarter%' AND p_stage NOT ILIKE '%round%' THEN 'Final'
    ELSE 'Grupo' -- Default
  END;

  -- Get points from scoring rules
  SELECT exact_points, tendency_points INTO v_exact_points, v_tendency_points
  FROM scoring_rules
  WHERE stage = v_mapped_stage;

  -- If no rule found, use default (Grupo)
  v_exact_points := COALESCE(v_exact_points, 3);
  v_tendency_points := COALESCE(v_tendency_points, 1);

  -- Check if exact prediction
  IF p_predicted_home = p_actual_home AND p_predicted_away = p_actual_away THEN
    RETURN v_exact_points;
  END IF;

  -- Determine predicted winner
  v_predicted_winner := CASE 
    WHEN p_predicted_home > p_predicted_away THEN 1
    WHEN p_predicted_home < p_predicted_away THEN -1
    ELSE 0
  END;

  -- Determine actual winner
  v_actual_winner := CASE 
    WHEN p_actual_home > p_actual_away THEN 1
    WHEN p_actual_home < p_actual_away THEN -1
    ELSE 0
  END;

  -- Check if tendency correct
  IF v_predicted_winner = v_actual_winner THEN
    RETURN v_tendency_points;
  END IF;

  -- No points if wrong
  RETURN 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Recalculate ALL existing points with the fixed function
-- (inline version since recalculate_all_rankings() may not exist)

-- Step A: Clear all existing points
DELETE FROM participant_points;

-- Step B: Re-insert correct points for every finished match
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

-- ============================================================================
-- VERIFICATION: Check scoring rules are correct
-- ============================================================================
SELECT stage, exact_points, tendency_points FROM scoring_rules ORDER BY exact_points;

-- VERIFICATION: Check recalculated points per participant
SELECT p.full_name, COALESCE(SUM(pp.points_awarded), 0) as total_points
FROM participants p
LEFT JOIN participant_points pp ON pp.participant_id = p.id
WHERE p.is_active = true
GROUP BY p.full_name
ORDER BY total_points DESC;
