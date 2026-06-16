create extension if not exists pgcrypto;

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  flag_url text,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  external_id text,
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  match_date timestamptz not null,
  stage text not null,
  status text not null check (status in ('scheduled', 'live', 'finished')),
  home_score int,
  away_score int,
  created_at timestamptz not null default now(),
  constraint check_match_scores check (
    (home_score is null and away_score is null)
    or (home_score >= 0 and away_score >= 0)
  )
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  predicted_home int not null check (predicted_home >= 0),
  predicted_away int not null check (predicted_away >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(participant_id, match_id)
);

create table if not exists scoring_rules (
  id uuid primary key default gen_random_uuid(),
  stage text not null unique,
  exact_points int not null,
  tendency_points int not null
);

create table if not exists participant_points (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  points_awarded int not null default 0,
  created_at timestamptz not null default now(),
  unique(participant_id, match_id)
);

create table if not exists special_questions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  question text not null,
  type text not null check (type in ('team', 'player', 'text')),
  points int not null,
  is_active boolean not null default true
);

create table if not exists special_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references special_questions(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(question_id, participant_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'create', 'update', 'delete')),
  changes jsonb,
  user_ip text,
  created_at timestamptz not null default now()
);

insert into tournaments (name, year, start_date, end_date, is_active)
values ('Copa Mundial 2026', 2026, '2026-06-11', '2026-07-19', true)
on conflict do nothing;

insert into scoring_rules (stage, exact_points, tendency_points) values
('Grupo', 3, 1),
('Dieciseisavos', 4, 2),
('Octavos', 5, 3),
('Cuartos', 6, 4),
('Semifinal', 7, 5),
('Tercer Puesto', 8, 6),
('Final', 9, 7)
on conflict (stage) do update
set exact_points = excluded.exact_points,
    tendency_points = excluded.tendency_points;

insert into teams (name, code, flag_url) values
('Colombia', 'co', 'https://flagcdn.com/co.svg'),
('Argentina', 'ar', 'https://flagcdn.com/ar.svg'),
('Brasil', 'br', 'https://flagcdn.com/br.svg'),
('Uruguay', 'uy', 'https://flagcdn.com/uy.svg'),
('Paraguay', 'py', 'https://flagcdn.com/py.svg'),
('Chile', 'cl', 'https://flagcdn.com/cl.svg'),
('Peru', 'pe', 'https://flagcdn.com/pe.svg'),
('Ecuador', 'ec', 'https://flagcdn.com/ec.svg'),
('Venezuela', 've', 'https://flagcdn.com/ve.svg'),
('Bolivia', 'bo', 'https://flagcdn.com/bo.svg'),
('Alemania', 'de', 'https://flagcdn.com/de.svg'),
('Francia', 'fr', 'https://flagcdn.com/fr.svg'),
('Espana', 'es', 'https://flagcdn.com/es.svg'),
('Italia', 'it', 'https://flagcdn.com/it.svg'),
('Portugal', 'pt', 'https://flagcdn.com/pt.svg'),
('Inglaterra', 'gb-eng', 'https://flagcdn.com/gb-eng.svg'),
('Belgica', 'be', 'https://flagcdn.com/be.svg'),
('Paises Bajos', 'nl', 'https://flagcdn.com/nl.svg'),
('Japon', 'jp', 'https://flagcdn.com/jp.svg'),
('Corea del Sur', 'kr', 'https://flagcdn.com/kr.svg'),
('Australia', 'au', 'https://flagcdn.com/au.svg'),
('Senegal', 'sn', 'https://flagcdn.com/sn.svg'),
('Marruecos', 'ma', 'https://flagcdn.com/ma.svg'),
('Nigeria', 'ng', 'https://flagcdn.com/ng.svg'),
('Tunez', 'tn', 'https://flagcdn.com/tn.svg'),
('Suiza', 'ch', 'https://flagcdn.com/ch.svg'),
('Suecia', 'se', 'https://flagcdn.com/se.svg'),
('Dinamarca', 'dk', 'https://flagcdn.com/dk.svg'),
('Polonia', 'pl', 'https://flagcdn.com/pl.svg'),
('Croacia', 'hr', 'https://flagcdn.com/hr.svg'),
('Mexico', 'mx', 'https://flagcdn.com/mx.svg'),
('Canada', 'ca', 'https://flagcdn.com/ca.svg'),
('Estados Unidos', 'us', 'https://flagcdn.com/us.svg')
on conflict (code) do update
set name = excluded.name,
    flag_url = excluded.flag_url;

create index if not exists idx_matches_tournament_status on matches(tournament_id, status);
create index if not exists idx_matches_tournament_date on matches(tournament_id, match_date);
create index if not exists idx_matches_external_id on matches(external_id);
create index if not exists idx_predictions_participant_match on predictions(participant_id, match_id);
create index if not exists idx_predictions_match on predictions(match_id);
create index if not exists idx_participant_points_participant on participant_points(participant_id);
create index if not exists idx_participant_points_match on participant_points(match_id);
create index if not exists idx_special_answers_question on special_answers(question_id);
create index if not exists idx_special_answers_participant on special_answers(participant_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created on audit_logs(created_at desc);
create index if not exists idx_tournaments_active on tournaments(is_active) where is_active = true;
create index if not exists idx_participants_active on participants(is_active) where is_active = true;
create index if not exists idx_participants_full_name on participants(full_name);

create or replace function calculate_prediction_points(
  p_predicted_home int,
  p_predicted_away int,
  p_actual_home int,
  p_actual_away int,
  p_stage text
)
returns int as $$
declare
  v_exact_points int;
  v_tendency_points int;
  v_predicted_winner int;
  v_actual_winner int;
begin
  select exact_points, tendency_points
  into v_exact_points, v_tendency_points
  from scoring_rules
  where stage = p_stage;

  v_exact_points := coalesce(v_exact_points, 3);
  v_tendency_points := coalesce(v_tendency_points, 1);

  if p_predicted_home = p_actual_home and p_predicted_away = p_actual_away then
    return v_exact_points;
  end if;

  v_predicted_winner := case
    when p_predicted_home > p_predicted_away then 1
    when p_predicted_home < p_predicted_away then -1
    else 0
  end;

  v_actual_winner := case
    when p_actual_home > p_actual_away then 1
    when p_actual_home < p_actual_away then -1
    else 0
  end;

  if v_predicted_winner = v_actual_winner then
    return v_tendency_points;
  end if;

  return 0;
end;
$$ language plpgsql stable;

create or replace function award_match_points(p_match_id uuid)
returns void as $$
declare
  v_match record;
  v_prediction record;
  v_points int;
begin
  select *
  into v_match
  from matches
  where id = p_match_id
    and status = 'finished'
    and home_score is not null
    and away_score is not null;

  if v_match is null then
    return;
  end if;

  for v_prediction in
    select *
    from predictions
    where match_id = p_match_id
  loop
    v_points := calculate_prediction_points(
      v_prediction.predicted_home,
      v_prediction.predicted_away,
      v_match.home_score,
      v_match.away_score,
      v_match.stage
    );

    insert into participant_points (participant_id, match_id, points_awarded)
    values (v_prediction.participant_id, p_match_id, v_points)
    on conflict (participant_id, match_id) do update
    set points_awarded = excluded.points_awarded;
  end loop;
end;
$$ language plpgsql;

create or replace function get_participant_ranking(p_tournament_id uuid default null)
returns table (
  rank bigint,
  participant_id uuid,
  full_name text,
  total_points bigint,
  matches_predicted bigint,
  exact_predictions bigint,
  created_at timestamptz
) as $$
begin
  return query
  with ranking_data as (
    select
      p.id as participant_id,
      p.full_name,
      p.created_at,
      coalesce(sum(pp.points_awarded), 0)::bigint as total_points,
      count(distinct pp.match_id)::bigint as matches_predicted,
      count(distinct case when pp.points_awarded >= 3 then pp.match_id end)::bigint as exact_predictions
    from participants p
    left join participant_points pp on pp.participant_id = p.id
    left join matches m on m.id = pp.match_id
    where p.is_active = true
      and (p_tournament_id is null or m.tournament_id = p_tournament_id or pp.match_id is null)
    group by p.id, p.full_name, p.created_at
  )
  select
    row_number() over (order by total_points desc, matches_predicted desc, full_name asc) as rank,
    ranking_data.participant_id,
    ranking_data.full_name,
    ranking_data.total_points,
    ranking_data.matches_predicted,
    ranking_data.exact_predictions,
    ranking_data.created_at
  from ranking_data
  order by rank;
end;
$$ language plpgsql stable;

create or replace function trigger_award_points_on_finish()
returns trigger as $$
begin
  if new.status = 'finished'
     and new.home_score is not null
     and new.away_score is not null
     and (old.status is distinct from 'finished'
       or old.home_score is distinct from new.home_score
       or old.away_score is distinct from new.away_score) then
    perform award_match_points(new.id);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_award_points on matches;
create trigger trigger_award_points
after update on matches
for each row execute function trigger_award_points_on_finish();

create or replace function trigger_init_participant_points()
returns trigger as $$
begin
  insert into participant_points (participant_id, match_id, points_awarded)
  values (new.participant_id, new.match_id, 0)
  on conflict (participant_id, match_id) do nothing;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_init_participant_points on predictions;
create trigger trigger_init_participant_points
after insert on predictions
for each row execute function trigger_init_participant_points();

create or replace function trigger_update_prediction_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_prediction_timestamp on predictions;
create trigger trigger_update_prediction_timestamp
before update on predictions
for each row execute function trigger_update_prediction_timestamp();

alter table tournaments enable row level security;
alter table participants enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table scoring_rules enable row level security;
alter table participant_points enable row level security;
alter table special_questions enable row level security;
alter table special_answers enable row level security;

drop policy if exists "public select tournaments" on tournaments;
create policy "public select tournaments" on tournaments for select using (is_active = true);

drop policy if exists "public select participants" on participants;
create policy "public select participants" on participants for select using (is_active = true);

drop policy if exists "public select teams" on teams;
create policy "public select teams" on teams for select using (true);

drop policy if exists "public select matches" on matches;
create policy "public select matches" on matches for select using (true);

drop policy if exists "public select predictions" on predictions;
create policy "public select predictions" on predictions for select using (true);

drop policy if exists "public insert predictions" on predictions;
create policy "public insert predictions" on predictions
for insert with check (
  now() < (select match_date from matches where matches.id = predictions.match_id)
);

drop policy if exists "public update predictions" on predictions;
create policy "public update predictions" on predictions
for update using (true)
with check (
  now() < (select match_date from matches where matches.id = predictions.match_id)
);

drop policy if exists "public delete predictions" on predictions;
create policy "public delete predictions" on predictions for delete using (true);

drop policy if exists "public select scoring rules" on scoring_rules;
create policy "public select scoring rules" on scoring_rules for select using (true);

drop policy if exists "public select participant points" on participant_points;
create policy "public select participant points" on participant_points for select using (true);

drop policy if exists "public select questions" on special_questions;
create policy "public select questions" on special_questions for select using (is_active = true);

drop policy if exists "public select answers" on special_answers;
create policy "public select answers" on special_answers for select using (true);

drop policy if exists "public insert answers" on special_answers;
create policy "public insert answers" on special_answers for insert with check (true);

drop policy if exists "public update answers" on special_answers;
create policy "public update answers" on special_answers for update using (true) with check (true);
