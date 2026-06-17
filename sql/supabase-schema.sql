-- Supabase SQL schema for Polla Mundialista Familiar Rincón

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  flag_url text,
  created_at timestamp with time zone not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  external_id text unique,
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  match_date timestamp with time zone not null,
  stage text not null,
  status text not null check (status in ('scheduled','live','finished')),
  home_score int,
  away_score int,
  created_at timestamp with time zone not null default now()
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  predicted_home int not null,
  predicted_away int not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(participant_id, match_id)
);

create table if not exists scoring_rules (
  id uuid primary key default gen_random_uuid(),
  stage text not null,
  exact_points int not null,
  tendency_points int not null
);

create table if not exists participant_points (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  points_awarded int not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists special_questions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  question text not null,
  type text not null check (type in ('team','player','text')),
  points int not null,
  is_active boolean not null default true
);

create table if not exists special_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references special_questions(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  answer text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('create','update','delete')),
  changes jsonb,
  user_ip text,
  created_at timestamp with time zone not null default now()
);

-- ============================================================================
-- CONSTRAINTS & CHECKS
-- ============================================================================


alter table predictions add constraint check_prediction_values
  check (predicted_home >= 0 AND predicted_away >= 0);

alter table matches add constraint check_match_scores
  check ((home_score IS NULL) OR (home_score >= 0 AND away_score >= 0));

-- ============================================================================
-- SEEDING DATA
-- ============================================================================

insert into scoring_rules (stage, exact_points, tendency_points) values
('Grupo', 3, 1),
('Dieciseisavos', 4, 2),
('Octavos', 5, 3),
('Cuartos', 6, 4),
('Semifinal', 7, 5),
('Tercer Puesto', 8, 6),
('Final', 9, 7)
on conflict do nothing;

-- Insert teams (basic FIFA tournament teams)
insert into teams (name, code, flag_url) values
('Colombia', 'co', 'https://flagcdn.com/co.svg'),
('Argentina', 'ar', 'https://flagcdn.com/ar.svg'),
('Brasil', 'br', 'https://flagcdn.com/br.svg'),
('Uruguay', 'uy', 'https://flagcdn.com/uy.svg'),
('Paraguay', 'py', 'https://flagcdn.com/py.svg'),
('Chile', 'cl', 'https://flagcdn.com/cl.svg'),
('Perú', 'pe', 'https://flagcdn.com/pe.svg'),
('Ecuador', 'ec', 'https://flagcdn.com/ec.svg'),
('Venezuela', 've', 'https://flagcdn.com/ve.svg'),
('Bolivia', 'bo', 'https://flagcdn.com/bo.svg'),
('Alemania', 'de', 'https://flagcdn.com/de.svg'),
('Francia', 'fr', 'https://flagcdn.com/fr.svg'),
('España', 'es', 'https://flagcdn.com/es.svg'),
('Italia', 'it', 'https://flagcdn.com/it.svg'),
('Portugal', 'pt', 'https://flagcdn.com/pt.svg'),
('Inglaterra', 'gb-eng', 'https://flagcdn.com/gb-eng.svg'),
('Bélgica', 'be', 'https://flagcdn.com/be.svg'),
('Países Bajos', 'nl', 'https://flagcdn.com/nl.svg'),
('Japón', 'jp', 'https://flagcdn.com/jp.svg'),
('Corea del Sur', 'kr', 'https://flagcdn.com/kr.svg'),
('Australia', 'au', 'https://flagcdn.com/au.svg'),
('Senegal', 'sn', 'https://flagcdn.com/sn.svg'),
('Marruecos', 'ma', 'https://flagcdn.com/ma.svg'),
('Nigeria', 'ng', 'https://flagcdn.com/ng.svg'),
('Túnez', 'tn', 'https://flagcdn.com/tn.svg'),
('Suiza', 'ch', 'https://flagcdn.com/ch.svg'),
('Suecia', 'se', 'https://flagcdn.com/se.svg'),
('Dinamarca', 'dk', 'https://flagcdn.com/dk.svg'),
('Polonia', 'pl', 'https://flagcdn.com/pl.svg'),
('Croacia', 'hr', 'https://flagcdn.com/hr.svg'),
('Méjico', 'mx', 'https://flagcdn.com/mx.svg'),
('Canadá', 'ca', 'https://flagcdn.com/ca.svg'),
('Estados Unidos', 'us', 'https://flagcdn.com/us.svg')
on conflict (code) do nothing;
