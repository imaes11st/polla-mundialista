-- ============================================================================
-- PL/pgSQL Functions for Polla Mundialista Familiar Rincón
-- ============================================================================

-- ============================================================================
-- SCORING FUNCTIONS
-- ============================================================================

/**
 * Calculate points for a single prediction
 * Returns: points awarded for that prediction
 */
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
  v_mapped_stage := CASE 
    WHEN p_stage ILIKE '%regular%' OR p_stage ILIKE '%group%' OR p_stage ILIKE '%jornada%' THEN 'Grupo'
    WHEN p_stage ILIKE '%round of 32%' OR p_stage ILIKE '%dieciseisavos%' THEN 'Dieciseisavos'
    WHEN p_stage ILIKE '%round of 16%' OR p_stage ILIKE '%last_16%' OR p_stage ILIKE '%octavos%' THEN 'Octavos'
    WHEN p_stage ILIKE '%quarter%' OR p_stage ILIKE '%cuartos%' THEN 'Cuartos'
    WHEN p_stage ILIKE '%semi%' THEN 'Semifinal'
    WHEN p_stage ILIKE '%third%' OR p_stage ILIKE '%tercer%' THEN 'Tercer Puesto'
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

-- ============================================================================

/**
 * Award points for a completed match
 * Called after match results are registered
 */
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

-- ============================================================================

/**
 * Get participant ranking with totals
 */
CREATE OR REPLACE FUNCTION get_participant_ranking(p_tournament_id UUID DEFAULT NULL)
RETURNS TABLE (
  rank INT,
  participant_id UUID,
  full_name TEXT,
  total_points INT,
  matches_predicted INT,
  exact_predictions INT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH ranking_data AS (
    SELECT
      pp.participant_id,
      p.full_name,
      p.created_at,
      COALESCE(SUM(pp.points_awarded), 0)::INT as total_points,
      COUNT(DISTINCT pp.match_id)::INT as matches_predicted,
      COUNT(DISTINCT CASE WHEN pp.points_awarded >= 3 THEN pp.match_id END)::INT as exact_predictions
    FROM participant_points pp
    JOIN participants p ON pp.participant_id = p.id
    LEFT JOIN matches m ON pp.match_id = m.id
    WHERE (p_tournament_id IS NULL OR m.tournament_id = p_tournament_id)
    GROUP BY pp.participant_id, p.full_name, p.created_at
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY rd.total_points DESC, rd.matches_predicted DESC, rd.full_name ASC)::INT as rank,
    rd.participant_id,
    rd.full_name,
    rd.total_points,
    rd.matches_predicted,
    rd.exact_predictions,
    rd.created_at
  FROM ranking_data rd
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================

/**
 * Get participant statistics
 */
CREATE OR REPLACE FUNCTION get_participant_stats(p_participant_id UUID)
RETURNS TABLE (
  total_points INT,
  matches_predicted INT,
  exact_predictions INT,
  tendency_predictions INT,
  accuracy_percentage NUMERIC,
  biggest_stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COALESCE(SUM(pp.points_awarded), 0) as total_points,
      COUNT(DISTINCT pp.match_id) as matches_predicted,
      COUNT(DISTINCT CASE WHEN pp.points_awarded >= 3 THEN pp.match_id END) as exact_predictions,
      COUNT(DISTINCT CASE WHEN pp.points_awarded = 1 OR pp.points_awarded = 2 THEN pp.match_id END) as tendency_predictions,
      ROUND(
        (COUNT(DISTINCT CASE WHEN pp.points_awarded > 0 THEN pp.match_id END)::NUMERIC / 
         NULLIF(COUNT(DISTINCT pp.match_id), 0)::NUMERIC) * 100, 
        2
      ) as accuracy_percentage,
      MAX(m.stage ORDER BY m.stage DESC) as biggest_stage,
      p.created_at
    FROM participant_points pp
    LEFT JOIN matches m ON pp.match_id = m.id
    JOIN participants p ON pp.participant_id = p.id
    WHERE pp.participant_id = p_participant_id
    GROUP BY p.created_at
  )
  SELECT * FROM stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

/**
 * Get upcoming matches for a tournament
 */
CREATE OR REPLACE FUNCTION get_upcoming_matches(
  p_tournament_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  home_team_name TEXT,
  away_team_name TEXT,
  match_date TIMESTAMP WITH TIME ZONE,
  stage TEXT,
  home_flag_url TEXT,
  away_flag_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    th.name as home_team_name,
    ta.name as away_team_name,
    m.match_date,
    m.stage,
    th.flag_url as home_flag_url,
    ta.flag_url as away_flag_url
  FROM matches m
  JOIN teams th ON m.home_team_id = th.id
  JOIN teams ta ON m.away_team_id = ta.id
  WHERE m.tournament_id = p_tournament_id
    AND m.status = 'scheduled'
    AND m.match_date > NOW()
  ORDER BY m.match_date ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================

/**
 * Get match details with predictions count
 */
CREATE OR REPLACE FUNCTION get_match_with_predictions(p_match_id UUID)
RETURNS TABLE (
  id UUID,
  home_team_name TEXT,
  away_team_name TEXT,
  match_date TIMESTAMP WITH TIME ZONE,
  stage TEXT,
  status TEXT,
  home_score INT,
  away_score INT,
  predictions_count INT,
  home_predictions INT,
  away_predictions INT,
  draw_predictions INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    th.name as home_team_name,
    ta.name as away_team_name,
    m.match_date,
    m.stage,
    m.status,
    m.home_score,
    m.away_score,
    COUNT(p.id)::INT as predictions_count,
    COUNT(CASE WHEN p.predicted_home > p.predicted_away THEN 1 END)::INT as home_predictions,
    COUNT(CASE WHEN p.predicted_away > p.predicted_home THEN 1 END)::INT as away_predictions,
    COUNT(CASE WHEN p.predicted_home = p.predicted_away THEN 1 END)::INT as draw_predictions
  FROM matches m
  JOIN teams th ON m.home_team_id = th.id
  JOIN teams ta ON m.away_team_id = ta.id
  LEFT JOIN predictions p ON m.id = p.match_id
  WHERE m.id = p_match_id
  GROUP BY m.id, th.id, ta.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================

/**
 * Recalculate all ranking points (use after bulk result updates)
 */
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
