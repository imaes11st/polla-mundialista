-- ============================================================================
-- SQL PATCH: Fix scoring system mappings, triggers, and recalculate rankings
-- Run this in the Supabase SQL Editor to resolve all scoring stage issues.
-- ============================================================================

-- 1. Recreate calculate_prediction_points with correct stage mappings
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
  -- FIXED: Ensure LAST_32 and other knockout stages map to their correct scoring rules
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

-- 2. Recreate award_match_points to ensure it uses the updated scoring logic
CREATE OR REPLACE FUNCTION award_match_points(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
  v_match RECORD;
  v_prediction RECORD;
  v_points INT;
BEGIN
  -- Get match details
  SELECT *
  INTO v_match
  FROM matches
  WHERE id = p_match_id AND status = 'finished' AND home_score IS NOT NULL AND away_score IS NOT NULL;

  IF v_match IS NULL THEN
    RETURN;
  END IF;

  -- Process each prediction for this match
  FOR v_prediction IN
    SELECT *
    FROM predictions
    WHERE match_id = p_match_id
  LOOP
    -- Calculate points
    v_points := calculate_prediction_points(
      v_prediction.predicted_home,
      v_prediction.predicted_away,
      v_match.home_score,
      v_match.away_score,
      v_match.stage
    );

    -- Insert/update points (avoid duplicates)
    INSERT INTO participant_points (participant_id, match_id, points_awarded)
    VALUES (v_prediction.participant_id, p_match_id, v_points)
    ON CONFLICT (participant_id, match_id) DO UPDATE
    SET points_awarded = EXCLUDED.points_awarded;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate the trigger function with the corrected logic
CREATE OR REPLACE FUNCTION trigger_award_points_on_finish()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'finished' with scores
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    -- If status changed to finished, or if scores changed
    IF OLD.status IS DISTINCT FROM 'finished' OR 
       OLD.home_score IS DISTINCT FROM NEW.home_score OR 
       OLD.away_score IS DISTINCT FROM NEW.away_score THEN
      PERFORM award_match_points(NEW.id);
    END IF;
  -- If match was finished but is now not, or scores were removed
  ELSIF OLD.status = 'finished' AND (NEW.status IS DISTINCT FROM 'finished' OR NEW.home_score IS NULL OR NEW.away_score IS NULL) THEN
    DELETE FROM participant_points WHERE match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger just to be sure it is correctly bound
DROP TRIGGER IF EXISTS trigger_award_points ON matches;
CREATE TRIGGER trigger_award_points
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_award_points_on_finish();

-- 4. Recreate the recalculation function
CREATE OR REPLACE FUNCTION recalculate_all_rankings()
RETURNS VOID AS $$
DECLARE
  v_match RECORD;
BEGIN
  -- Delete existing participant_points
  DELETE FROM participant_points;

  -- Recalculate for all finished matches
  FOR v_match IN
    SELECT DISTINCT id FROM matches WHERE status = 'finished'
  LOOP
    PERFORM award_match_points(v_match.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Recalculate ALL participant points to apply the corrected mappings
SELECT recalculate_all_rankings();
