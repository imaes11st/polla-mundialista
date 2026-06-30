-- ============================================================================
-- SQL PATCH: Fix scoring trigger, correct Germany vs Paraguay score, and recalculate rankings
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- 1. Recreate the trigger function with the corrected logic
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

-- 2. Correct the match score for Germany vs Paraguay to 1 - 1 (score after extra time, excluding penalties)
UPDATE matches
SET home_score = 1,
    away_score = 1
WHERE external_id = '537415' OR id = '3d50bf80-c736-4add-8ff0-66c098d8484c';

-- 3. Define recalculate_all_rankings function if it does not exist
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

-- 4. Recalculate ALL participant points to apply the corrected score and trigger fixes
SELECT recalculate_all_rankings();
