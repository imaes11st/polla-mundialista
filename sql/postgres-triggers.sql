-- ============================================================================
-- PostgreSQL Triggers for Polla Mundialista Familiar Rincón
-- ============================================================================

-- ============================================================================
-- PREDICTION LOCKING TRIGGER
-- ============================================================================

/**
 * Trigger: Prevent predictions if the match has already started
 */
CREATE OR REPLACE FUNCTION trigger_lock_predictions_on_start()
RETURNS TRIGGER AS $$
DECLARE
  v_match_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the match date
  SELECT match_date INTO v_match_date
  FROM matches
  WHERE id = NEW.match_id;

  -- If match has started, prevent prediction
  IF v_match_date <= NOW() THEN
    RAISE EXCEPTION 'No se pueden realizar o modificar pronósticos una vez que el partido ha comenzado (Inició: %)', v_match_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lock_predictions ON predictions;
CREATE TRIGGER trigger_lock_predictions
BEFORE INSERT OR UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION trigger_lock_predictions_on_start();

-- ============================================================================
-- AUTO-SCORING TRIGGER
-- ============================================================================

/**
 * Trigger: Automatically award points when match result is registered
 */
CREATE OR REPLACE FUNCTION trigger_award_points_on_finish()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'finished' with scores
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    IF OLD.status IS DISTINCT FROM 'finished' THEN
      PERFORM award_match_points(NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_points ON matches;
CREATE TRIGGER trigger_award_points
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_award_points_on_finish();

-- ============================================================================

/**
 * Trigger: Initialize participant_points entry on new prediction
 * (ensures referential integrity)
 */
CREATE OR REPLACE FUNCTION trigger_init_participant_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert initial participant_points record if not exists
  INSERT INTO participant_points (participant_id, match_id, points_awarded)
  VALUES (NEW.participant_id, NEW.match_id, 0)
  ON CONFLICT (participant_id, match_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_init_participant_points ON predictions;
CREATE TRIGGER trigger_init_participant_points
AFTER INSERT ON predictions
FOR EACH ROW
EXECUTE FUNCTION trigger_init_participant_points();

-- ============================================================================

/**
 * Trigger: Update prediction updated_at timestamp
 */
CREATE OR REPLACE FUNCTION trigger_update_prediction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_prediction_timestamp ON predictions;
CREATE TRIGGER trigger_update_prediction_timestamp
BEFORE UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_prediction_timestamp();

-- ============================================================================

/**
 * Trigger: Audit log on participant changes
 */
CREATE OR REPLACE FUNCTION trigger_audit_participant_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (entity_type, entity_id, action, changes, user_ip)
  VALUES (
    'participant',
    NEW.id,
    CASE WHEN TG_OP = 'DELETE' THEN 'delete' ELSE TG_OP::TEXT END,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    COALESCE(current_setting('request.ip', true), '0.0.0.0')
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_participant_changes ON participants;
CREATE TRIGGER trigger_audit_participant_changes
AFTER INSERT OR UPDATE OR DELETE ON participants
FOR EACH ROW
EXECUTE FUNCTION trigger_audit_participant_changes();

-- ============================================================================

/**
 * Trigger: Audit log on match result changes
 */
CREATE OR REPLACE FUNCTION trigger_audit_match_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (entity_type, entity_id, action, changes, user_ip)
  VALUES (
    'match',
    NEW.id,
    CASE WHEN TG_OP = 'DELETE' THEN 'delete' ELSE TG_OP::TEXT END,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    COALESCE(current_setting('request.ip', true), '0.0.0.0')
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_match_changes ON matches;
CREATE TRIGGER trigger_audit_match_changes
AFTER INSERT OR UPDATE OR DELETE ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_audit_match_changes();

-- ============================================================================
-- MATERIALIZED VIEW FOR RANKING CACHE
-- ============================================================================

/**
 * Create materialized view for faster ranking queries
 */
DROP MATERIALIZED VIEW IF EXISTS ranking_view CASCADE;
CREATE MATERIALIZED VIEW ranking_view AS
SELECT * FROM get_participant_ranking(NULL);

-- Refresh view periodically (requires pg_cron extension or external cron)
CREATE OR REPLACE FUNCTION refresh_ranking_view()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ranking_view;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================

/**
 * Create view for tournament leaderboard
 */
DROP VIEW IF EXISTS tournament_rankings CASCADE;
CREATE OR REPLACE VIEW tournament_rankings AS
SELECT
  t.id as tournament_id,
  t.name as tournament_name,
  ranking.*
FROM tournaments t
CROSS JOIN LATERAL get_participant_ranking(t.id) ranking
ORDER BY t.id, ranking.rank;
