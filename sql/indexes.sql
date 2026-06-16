-- ============================================================================
-- PostgreSQL Indexes for Performance Optimization
-- ============================================================================

-- ============================================================================
-- MATCHES INDEXES
-- ============================================================================

-- Fast lookups by tournament and status
CREATE INDEX IF NOT EXISTS idx_matches_tournament_status
ON matches(tournament_id, status);

-- Fast lookups for upcoming matches
CREATE INDEX IF NOT EXISTS idx_matches_tournament_date
ON matches(tournament_id, match_date)
WHERE status = 'scheduled';

-- External API sync lookups
CREATE INDEX IF NOT EXISTS idx_matches_external_id
ON matches(external_id);

-- ============================================================================
-- PREDICTIONS INDEXES
-- ============================================================================

-- Fast participant prediction lookups
CREATE INDEX IF NOT EXISTS idx_predictions_participant_match
ON predictions(participant_id, match_id);

-- Fast match prediction lookups
CREATE INDEX IF NOT EXISTS idx_predictions_match
ON predictions(match_id);

-- Unique constraint index (already exists but explicitly needed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_predictions_unique
ON predictions(participant_id, match_id);

-- ============================================================================
-- PARTICIPANT_POINTS INDEXES
-- ============================================================================

-- Fast ranking calculations
CREATE INDEX IF NOT EXISTS idx_participant_points_participant
ON participant_points(participant_id);

-- Fast match result lookups
CREATE INDEX IF NOT EXISTS idx_participant_points_match
ON participant_points(match_id);

-- Score aggregation optimization
CREATE INDEX IF NOT EXISTS idx_participant_points_composite
ON participant_points(participant_id, points_awarded)
WHERE points_awarded > 0;

-- ============================================================================
-- SPECIAL_ANSWERS INDEXES
-- ============================================================================

-- Fast question lookups
CREATE INDEX IF NOT EXISTS idx_special_answers_question
ON special_answers(question_id);

-- Fast participant special answers
CREATE INDEX IF NOT EXISTS idx_special_answers_participant
ON special_answers(participant_id);

-- ============================================================================
-- AUDIT_LOGS INDEXES
-- ============================================================================

-- Fast audit trail lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs(entity_type, entity_id);

-- Fast temporal queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
ON audit_logs(created_at DESC);

-- ============================================================================
-- TEAMS INDEXES
-- ============================================================================

-- Fast team lookups by code
CREATE INDEX IF NOT EXISTS idx_teams_code
ON teams(code);

-- ============================================================================
-- TOURNAMENTS INDEXES
-- ============================================================================

-- Fast active tournament lookups
CREATE INDEX IF NOT EXISTS idx_tournaments_active
ON tournaments(is_active)
WHERE is_active = true;

-- ============================================================================
-- PARTICIPANTS INDEXES
-- ============================================================================

-- Fast active participant lookups
CREATE INDEX IF NOT EXISTS idx_participants_active
ON participants(is_active)
WHERE is_active = true;

-- Name search optimization
CREATE INDEX IF NOT EXISTS idx_participants_full_name
ON participants(full_name);

-- ============================================================================
-- OPTIMIZE FOR COMMON QUERIES
-- ============================================================================

/**
 * Full-text search optimization for participant names
 * (optional, only if doing full-text search)
 */
CREATE INDEX IF NOT EXISTS idx_participants_name_tsvector
ON participants USING GIN(to_tsvector('spanish', full_name));

/**
 * Partitioning hint for very large tables (future optimization)
 * Once matches table exceeds 1M rows, consider:
 * - Partitioning by tournament_id
 * - Partitioning by year
 */

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

ANALYZE tournaments;
ANALYZE participants;
ANALYZE teams;
ANALYZE matches;
ANALYZE predictions;
ANALYZE participant_points;
ANALYZE special_questions;
ANALYZE special_answers;
ANALYZE audit_logs;
ANALYZE scoring_rules;
